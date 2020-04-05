import * as WebSocket from 'ws';
import { PersistenceApi } from '../persistence/API';
import { WsServer } from '../servers/WsServer';
import { ClientMessage, Actions, Events } from '../Messages';
import { WsPlayer } from '../WsPlayer';

export class Lobby {
  constructor(private wsServer: WsServer, private persistenceApi: PersistenceApi) {
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

    this.wsServer.sendMessage(ws, {
      type: Events.GAME_ENTERED,
      privatePlayerId: player.privatePlayerId,
      publicPlayerId: player.publicPlayerId,
      gameId: player.gameId
    });

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    });
  }

  private onEnterGame(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    // TODO create player
    // TODO get game + check: game in Lobby Phase --> abort if not
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

    this.wsServer.sendMessage(ws, {
      type: Events.GAME_ENTERED,
      privatePlayerId: player.privatePlayerId,
      publicPlayerId: player.publicPlayerId,
      gameId: player.gameId
    });

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    });
  }

  private onChangeLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    // TODO checkGamePhase: Lobby
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

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    });
  }

  private onReadyLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    // TODO checkGamePhase: Lobby
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

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    });
  }

  private onUnreadyLobby(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    // TODO checkGamePhase: Lobby
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

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    });
  }

  private onDisconnect(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    // TODO checkGamePhase: Lobby
    // TODO remove player immediately
    // TODO get lobbyObject
    const lobby = {
      players: [] as any[],
      settings: {
        rounds: 3
      }
    };

    this.wsServer.broadcastMessage(player.gameId, {
      type: Events.LOBBY_UPDATED,
      lobby
    });
  }

  private onCloseGame(ws: WebSocket, msg: ClientMessage) {
    // TODO checkGamePhase: Lobby
    // TODO remove game immediately
    // no one left to notify
  }
}
