import * as WebSocket from 'ws';
import { PersistenceApi } from '../persistence/API';
import { WsServer, WsHandlerFnReturn, PromisedWsHandlerFnReturn } from '../servers/WsServer';
import { ClientMessage, Actions, Events, LobbyUpdatedMessage, Errors, CloseGameMessage, ChangeLobbyMessage } from '../Messages';
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
    return (await this.persistenceApi.getPlayersByGame(gameId)).map(({ publicPlayerId, name, ready }) => {
      return { publicPlayerId, name, ready };
    });
  }

  private async getLobby(gameId: string) {
    const [ players, settings ] = await Promise.all([this.getPlayersForLobby(gameId), this.getGameSettings(gameId)]);
    return { players, settings };
  }

  @synchronizePerGameId
  private async onCreateGame(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    await this.persistenceApi.createGame(player);
    await this.persistenceApi.addPlayer(player);
    const lobby = await this.getLobby(player.gameId);
    /* TODO get lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Unnamed Player', ready: false }
      ],
      settings: {
        rounds: 2
      }
    };
    // END TODO*/

    this.wsServer.sendMessage(ws, {
      type: Events.GAME_ENTERED,
      privatePlayerId: player.privatePlayerId,
      publicPlayerId: player.publicPlayerId,
      gameId: player.gameId
    });

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    } as LobbyUpdatedMessage);
  }

  @synchronizePerGameId
  private async onEnterGame(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }
    await this.persistenceApi.addPlayer(player);
    const lobby = await this.getLobby(player.gameId);
    /* TODO get lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Unnamed Player', ready: false }
      ],
      settings: {
        rounds: 2
      }
    };
    // END TODO*/

    this.wsServer.sendMessage(ws, {
      type: Events.GAME_ENTERED,
      privatePlayerId: player.privatePlayerId,
      publicPlayerId: player.publicPlayerId,
      gameId: player.gameId
    });

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    } as LobbyUpdatedMessage);
  }

  @synchronizePerGameId
  private async onChangeLobby(ws: WebSocket, msg: ChangeLobbyMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
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

    const lobby = await this.getLobby(player.gameId);
    /* TODO get updated lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Lukas', ready: false }
      ],
      settings: {
        rounds: 3
      }
    };
    // END TODO*/

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    } as LobbyUpdatedMessage);
  }

  @synchronizePerGameId
  private async onReadyLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }

    await this.persistenceApi.updatePlayerReady(player.privatePlayerId, true);
    const lobby = await this.getLobby(player.gameId);

    /* TODO get lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Lukas', ready: true }
      ],
      settings: {
        rounds: 3
      }
    };
    // END TODO*/

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    } as LobbyUpdatedMessage);

    if (lobby.players.every(p => p.ready)) {
      this.wsServer.broadcastMessage(player.gameId, {
        type: Events.LOBBY_COMPLETED
      });
    }
  }

  @synchronizePerGameId
  private async onUnreadyLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }

    await this.persistenceApi.updatePlayerReady(player.privatePlayerId, false);
    const lobby = await this.getLobby(player.gameId);

    /* TODO get lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Lukas', ready: false }
      ],
      settings: {
        rounds: 3
      }
    };
    // END TODO*/

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    } as LobbyUpdatedMessage);
  }

  @synchronizePerGameId
  private async onDisconnect(_ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      return; // generic event, no message sent
    }
    await this.persistenceApi.removePlayer(player.privatePlayerId);
    const lobby = await this.getLobby(player.gameId);

    /* TODO get lobbyObject
    const lobby = {
      players: [] as any[],
      settings: {
        rounds: 3
      }
    };
    // END TODO*/

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    } as LobbyUpdatedMessage);
  }

  @synchronizePerGameId
  private async onCloseGame(_ws: WebSocket, msg: CloseGameMessage): PromisedWsHandlerFnReturn {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, msg.gameId)) {
      return; // generic event, no message sent
    }
    await this.persistenceApi.deleteGame(msg.gameId);
    // no one left to notify
  }
}
