import * as WebSocket from 'ws';
import { WsServer, PromisedWsHandlerFnReturn } from '../servers/WsServer';
import { PersistenceApi } from '../persistence/API';
import { GamePhaseHandler, GamePhases } from './GamePhases';
import { ClientMessage, Actions, Events, Errors, ReadyWritingMessage, WritingUpdatedMessage, WritingCompletedMessage, WritingNextMessage } from '../Messages';
import { WsPlayer } from '../servers/WsPlayer';
import { synchronizePerGameId } from '../AsyncUtils';
import { Player } from '../persistence/entities/Player';

export class Writing {
  constructor(private wsServer: WsServer, private persistenceApi: PersistenceApi, private gamePhaseHandler: GamePhaseHandler) {
    this.gamePhaseHandler.onSwitchTo(GamePhases.WRITING, this.onSwitchToWriting.bind(this));
    this.wsServer.on(Actions.READY_WRITING, this.onReadyWriting.bind(this));
    this.wsServer.on(Actions.UNREADY_WRITING, this.onUnreadyWriting.bind(this));
    this.wsServer.on(Actions.RECOVER_SESSION, this.onRecoverSession.bind(this));
  }

  private async addMessageToDb(gameId: string, privatePlayerId: string, line1: string, line2?: string) {
    const [ { currentChunk }, players ] = await Promise.all([
      this.persistenceApi.getGame(gameId),
      this.persistenceApi.getPlayersByGame(gameId)
    ]);

    const selfOffset = players.findIndex(p => p.privatePlayerId === privatePlayerId);
    const accessIndex = (selfOffset + currentChunk) % players.length;
    const addToPlayerId = players[accessIndex].privatePlayerId;

    await this.persistenceApi.addVerse(gameId, addToPlayerId, 2 * currentChunk, line1);
    if (line2) {
      this.persistenceApi.addVerse(gameId, addToPlayerId, 2 * currentChunk + 1, line2);
    }
  }

  private async getWritingStatus(gameId: string) {
    const [ { rounds, currentChunk }, players ] = await Promise.all([
      this.persistenceApi.getGame(gameId),
      this.persistenceApi.getPlayersByGame(gameId)
    ]);

    const currentRound = Math.min(rounds, Math.floor(currentChunk / players.length)); // max `rounds`, as otherwise the last chunk finishing chunk would be in `rounds+1`
    const totalChunks = rounds * players.length + 1; // +1, as each player finishes his/her poem
    const isLastChunk = rounds * players.length === currentChunk; // no +1 needed, as every player finishes his/her poem

    return { currentRound, totalRounds: rounds, currentChunk, totalChunks, isLastChunk };
  }

  private async sendWritingNext(gameId: string, privatePlayerId: string, ws: WebSocket, dbPlayers?: Player[], playersForExternal?: any, status?: any) {
    if (!dbPlayers) {
      dbPlayers = await this.persistenceApi.getPlayersByGame(gameId); // in db order
    }
    if (!status) {
      status = await this.getWritingStatus(gameId);
    }

    const selfOffset = dbPlayers.findIndex(p => p.privatePlayerId === privatePlayerId);
    const accessIndex = (selfOffset + status.currentChunk) % dbPlayers.length;
    const readFromPlayerId = dbPlayers[accessIndex].privatePlayerId;

    let title = '';
    let lastVerse = '';
    if (status.currentChunk === 0) { // on first chunk, there is nothing in the database
      title = await this.persistenceApi.getVerse(gameId, readFromPlayerId, 0);
      lastVerse = await this.persistenceApi.getVerse(gameId, readFromPlayerId, 2 * status.currentChunk - 1);
    }

    const wnMsg: WritingNextMessage = {
      type: Events.WRITING_NEXT,
      status, players: playersForExternal,
      title, lastVerse
    };
    this.wsServer.sendMessage(ws, wnMsg)
  }

  private async sendWritingNextForAll(gameId: string, playersForExternal?: any, status?: any) {
    if (!status) {
      status = await this.getWritingStatus(gameId);
    }
    if (!playersForExternal) {
      playersForExternal = await this.gamePhaseHandler.getPlayersForExternal(gameId);
    }
    const dbPlayers = await this.persistenceApi.getPlayersByGame(gameId); // in db order

    // dropped players are not notified here, but they might reconnect and get the message later
    await Promise.all(
      Array.from(
        this.wsServer.getPlayers(gameId)
      ).map(
        player => this.sendWritingNext(gameId, player.privatePlayerId, player.ws, dbPlayers, playersForExternal, status)
      )
    );
  }

  private async onSwitchToWriting(gameId: string) {
    await this.sendWritingNextForAll(gameId);
  }

  @synchronizePerGameId
  private async onReadyWriting(ws: WebSocket, msg: ReadyWritingMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }

    await this.addMessageToDb(player.gameId, player.privatePlayerId, msg.verse1, msg.verse2);
    await this.persistenceApi.updatePlayerReady(player.privatePlayerId, true);
    const status = await this.getWritingStatus(player.gameId);
    const players = await this.gamePhaseHandler.getPlayersForExternal(player.gameId);

    if (players.every(p => p.ready)) {
      if (status.isLastChunk) {
        // TODO: get all poems as texts
        const poems = {
          [player.publicPlayerId]: {
            title: 'Ein Gedicht',
            text: 'Es war einmal in dunkler Nacht'
          }
        };
        // END TODO
        this.wsServer.broadcastMessage(player.gameId, {
          type: Events.WRITING_COMPLETED,
          poems
        } as WritingCompletedMessage);
      } else {
        this.persistenceApi.updatePlayersReady(player.gameId, false);
        this.persistenceApi.updateGameCurrentChunk(player.gameId, status.currentChunk + 1);
        const nextStatus = await this.getWritingStatus(player.gameId);
        const nextPlayers = await this.gamePhaseHandler.getPlayersForExternal(player.gameId);
        this.sendWritingNextForAll(player.gameId, nextPlayers, nextStatus);
      }
    } else {
      const wuMsg: WritingUpdatedMessage = {
        type: Events.WRITING_UPDATED,
        players, status
      }
      this.wsServer.broadcastMessage(player.gameId, wuMsg);
    }
  }

  @synchronizePerGameId
  private async onUnreadyWriting(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }

    await this.persistenceApi.updatePlayerReady(player.privatePlayerId, true);
    const status = await this.getWritingStatus(player.gameId);
    const players = await this.gamePhaseHandler.getPlayersForExternal(player.gameId);

    const wuMsg: WritingUpdatedMessage = {
      type: Events.WRITING_UPDATED,
      players, status
    }
    this.wsServer.broadcastMessage(player.gameId, wuMsg);
  }

  private async onRecoverSession(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (await this.gamePhaseHandler.isInPhase(GamePhases.WRITING, player.gameId)) {
      this.sendWritingNext(player.gameId, player.privatePlayerId, ws);
    }
    // TODO: Recover with WRITING COMPLETED for phase VIEWING as well -- we have the logic here anyways!
  }
}
