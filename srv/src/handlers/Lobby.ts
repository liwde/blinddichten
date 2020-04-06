import * as WebSocket from 'ws';
import { PersistenceApi } from '../persistence/API';
import { WsServer, WsHandlerFnReturn, PromisedWsHandlerFnReturn } from '../servers/WsServer';
import { ClientMessage, Actions, Events, LobbyUpdatedMessage, Errors, CloseGameMessage, ChangeLobbyMessage, GameEnteredMessage } from '../Messages';
import { WsPlayer } from '../servers/WsPlayer';
import { GamePhaseHandler, GamePhases } from './GamePhases';
import { synchronizePerGameId } from '../AsyncUtils';

export class Lobby {
  constructor(private wsServer: WsServer, private persistenceApi: PersistenceApi, private gamePhaseHandler: GamePhaseHandler) {
    this.wsServer.on(Actions.CREATE_GAME, this.onCreateGame.bind(this));
    this.wsServer.on(Actions.ENTER_GAME, this.onEnterGame.bind(this));
    this.wsServer.on(Actions.CHANGE_LOBBY, this.onChangeLobby.bind(this));
    this.wsServer.on(Actions.READY_LOBBY, this.onReadyLobby.bind(this));
    this.wsServer.on(Actions.UNREADY_LOBBY, this.onUnreadyLobby.bind(this));
    this.wsServer.on(Actions.DISCONNECT, this.onDisconnect.bind(this));
    this.wsServer.on(Actions.CLOSE_GAME, this.onCloseGame.bind(this));
  }

  private async getGameSettings(gameId: string) {
    const { rounds } = await this.persistenceApi.getGame(gameId);
    return { rounds };
  }

  private async getPlayersForLobby(gameId: string) {
    return (await this.persistenceApi.getPlayersByGame(gameId)).map(({ publicPlayerId, name, isOwner, ready }) => {
      return { publicPlayerId, name, isOwner, ready };
    });
  }

  private async getLobby(gameId: string) {
    const [ players, settings ] = await Promise.all([this.getPlayersForLobby(gameId), this.getGameSettings(gameId)]);
    return { players, settings };
  }

  private async sendAndEventuallyCloseLobby(gameId: string) {
    const lobby = await this.getLobby(gameId);

    const luMsg: LobbyUpdatedMessage = {
      type: Events.LOBBY_UPDATED,
      lobby
    };
    this.wsServer.broadcastMessage(gameId, luMsg);

    if (lobby.players.every(p => p.ready)) {
      await this.gamePhaseHandler.switchToPhase(GamePhases.WRITING, gameId);
      this.wsServer.broadcastMessage(gameId, {
        type: Events.LOBBY_COMPLETED
      });
    }
  }

  @synchronizePerGameId
  private async onCreateGame(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    await this.persistenceApi.createGame(player);
    await this.persistenceApi.addPlayer(player, true);

    const geMsg: GameEnteredMessage = {
      type: Events.GAME_ENTERED,
      privatePlayerId: player.privatePlayerId,
      publicPlayerId: player.publicPlayerId,
      gameId: player.gameId
    };
    this.wsServer.sendMessage(ws, geMsg);

    await this.sendAndEventuallyCloseLobby(player.gameId);
  }

  @synchronizePerGameId
  private async onEnterGame(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!await this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }
    await this.persistenceApi.addPlayer(player);

    const geMsg: GameEnteredMessage = {
      type: Events.GAME_ENTERED,
      privatePlayerId: player.privatePlayerId,
      publicPlayerId: player.publicPlayerId,
      gameId: player.gameId
    }
    this.wsServer.sendMessage(ws, geMsg);

    await this.sendAndEventuallyCloseLobby(player.gameId);
  }

  @synchronizePerGameId
  private async onChangeLobby(ws: WebSocket, msg: ChangeLobbyMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!await this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }

    if (msg.name) {
      await this.persistenceApi.updatePlayerName(player.privatePlayerId, msg.name);
    }
    if (msg.settings && (await this.persistenceApi.getGame(player.gameId)).owner === player.privatePlayerId) {
      await this.persistenceApi.updateGameRounds(player.gameId, msg.settings.rounds);
    }

    await this.sendAndEventuallyCloseLobby(player.gameId);
  }

  @synchronizePerGameId
  private async onReadyLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!await this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }

    await this.persistenceApi.updatePlayerReady(player.privatePlayerId, true);
    await this.sendAndEventuallyCloseLobby(player.gameId);
  }

  @synchronizePerGameId
  private async onUnreadyLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!await this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }

    await this.persistenceApi.updatePlayerReady(player.privatePlayerId, false);
    await this.sendAndEventuallyCloseLobby(player.gameId);
  }

  @synchronizePerGameId
  private async onDisconnect(_ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!await this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      return; // generic event, no message sent
    }
    await this.persistenceApi.removePlayer(player.privatePlayerId);
    await this.sendAndEventuallyCloseLobby(player.gameId);
  }

  @synchronizePerGameId
  private async onCloseGame(_ws: WebSocket, msg: CloseGameMessage): PromisedWsHandlerFnReturn {
    if (!await this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, msg.gameId)) {
      return; // generic event, no message sent
    }
    await this.persistenceApi.deleteGame(msg.gameId);
    // no one left to notify
  }
}
