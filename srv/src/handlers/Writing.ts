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

    const currentRound = Math.min(rounds - 1, Math.floor(currentChunk / players.length)); // max `rounds - 1`, as otherwise the last chunk finishing chunk would be in `rounds+1`
    const totalChunks = rounds * players.length + 1; // +1, as each player finishes his/her poem
    const isLastChunk = rounds * players.length === currentChunk; // no +1 needed, as every player finishes his/her poem
    const isFirstChunk = currentChunk === 0;

    return { currentRound, totalRounds: rounds, currentChunk, totalChunks, isFirstChunk, isLastChunk };
  }

  private async sendWritingNext(gameId: string, privatePlayerId: string, ws: WebSocket, dbPlayers?: Player[], playersForExternal?: any, status?: any) {
    if (!dbPlayers) {
      dbPlayers = await this.persistenceApi.getPlayersByGame(gameId); // in db order
    }
    if (!playersForExternal) {
      playersForExternal = await this.gamePhaseHandler.getPlayersForExternal(gameId);
    }
    if (!status) {
      status = await this.getWritingStatus(gameId);
    }

    const selfOffset = dbPlayers.findIndex(p => p.privatePlayerId === privatePlayerId);
    if (selfOffset === -1) {
      // Player is not part of the DB.
      // This can happen if a player disconnects at the lobby and isn't yet removed from the WsServer (who doesn't know about the lobby)
      // Or if a player joins a game that has already started -- we can't send new lines for him/her
      return;
    }
    const accessIndex = (selfOffset + status.currentChunk) % dbPlayers.length;
    const readFromPlayerId = dbPlayers[accessIndex].privatePlayerId;

    let title = null;
    let lastVerse = null;
    if (status.currentChunk !== 0) { // on first chunk, there is nothing in the database
      title = await this.persistenceApi.getVerseText(gameId, readFromPlayerId, 0);
      lastVerse = await this.persistenceApi.getVerseText(gameId, readFromPlayerId, 2 * status.currentChunk - 1);
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

  private async getAllPoems(gameId: string) {
    const players = await this.persistenceApi.getPlayersByGame(gameId);
    return Promise.all(players.map(async player => {
      const verses = await this.persistenceApi.getAllVerseTexts(gameId, player.privatePlayerId);
      return {
        publicPlayerId: player.publicPlayerId,
        author: player.name,
        title: verses[0],
        verses: verses.slice(1)
      };
    }));
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
        await this.gamePhaseHandler.switchToPhase(GamePhases.VIEWING, player.gameId);
        const poems = await this.getAllPoems(player.gameId);
        const wcMsg: WritingCompletedMessage = {
          type: Events.WRITING_COMPLETED,
          poems
        };
        this.wsServer.broadcastMessage(player.gameId, wcMsg);
      } else {
        this.persistenceApi.updatePlayersReady(player.gameId, false);
        this.persistenceApi.updateGameChunk(player.gameId, status.currentChunk + 1);
        const nextStatus = await this.getWritingStatus(player.gameId);
        const nextPlayers = await this.gamePhaseHandler.getPlayersForExternal(player.gameId);
        this.sendWritingNextForAll(player.gameId, nextPlayers, nextStatus);
      }
    } else {
      const wuMsg: WritingUpdatedMessage = {
        type: Events.WRITING_UPDATED,
        players, status
      };
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

    await this.persistenceApi.updatePlayerReady(player.privatePlayerId, false);
    const status = await this.getWritingStatus(player.gameId);
    const players = await this.gamePhaseHandler.getPlayersForExternal(player.gameId);

    const wuMsg: WritingUpdatedMessage = {
      type: Events.WRITING_UPDATED,
      players, status
    };
    this.wsServer.broadcastMessage(player.gameId, wuMsg);
  }

  private async onRecoverSession(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    // TODO: Check if in Session
    if (await this.gamePhaseHandler.isInPhase(GamePhases.WRITING, player.gameId)) {
      this.sendWritingNext(player.gameId, player.privatePlayerId, ws);
    }
    if (await this.gamePhaseHandler.isInPhase(GamePhases.VIEWING, player.gameId)) {
      const poems = await this.getAllPoems(player.gameId);
      const wcMsg: WritingCompletedMessage = {
        type: Events.WRITING_COMPLETED,
        poems
      };
      this.wsServer.sendMessage(player.ws, wcMsg);
    }
  }
}
