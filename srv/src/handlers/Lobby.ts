import * as WebSocket from 'ws';
import { PersistenceApi } from '../persistence/API';
import { WsServer } from '../servers/WsServer';
import { ClientMessage, Actions, Events, LobbyUpdatedMessage, Errors, CloseGameMessage } from '../Messages';
import { WsPlayer } from '../servers/WsPlayer';
import { GamePhaseHandler, GamePhases } from './GamePhases';

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

  private onCreateGame(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    // TODO create player
    // TODO create game
    // TODO add player to game
    // TODO get lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Unnamed Player', ready: false }
      ],
      settings: {
        rounds: 2
      }
    };
    // END TODO

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

  private onEnterGame(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }
    // TODO create player
    // TODO add player to game
    // TODO get lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Unnamed Player', ready: false }
      ],
      settings: {
        rounds: 2
      }
    };
    // END TODO

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

  private onChangeLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }
    // TODO if necessary: update player
    // TODO if necessary and player is owner: update settings
    // TODO get updated lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Lukas', ready: false }
      ],
      settings: {
        rounds: 3
      }
    };
    // END TODO

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    } as LobbyUpdatedMessage);
  }

  private onReadyLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }
    // TODO update player
    // TODO get lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Lukas', ready: true }
      ],
      settings: {
        rounds: 3
      }
    };
    // END TODO

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

  private onUnreadyLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }
    // TODO update player
    // TODO get lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Lukas', ready: false }
      ],
      settings: {
        rounds: 3
      }
    };
    // END TODO

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    } as LobbyUpdatedMessage);
  }

  private onDisconnect(_ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      return; // generic event, no message sent
    }
    // TODO remove player immediately
    // TODO get lobbyObject
    const lobby = {
      players: [] as any[],
      settings: {
        rounds: 3
      }
    };
    // END TODO

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    } as LobbyUpdatedMessage);
  }

  private onCloseGame(_ws: WebSocket, msg: CloseGameMessage) {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, msg.gameId)) {
      return; // generic event, no message sent
    }
    // TODO remove game from db immediately
    // no one left to notify
  }
}
