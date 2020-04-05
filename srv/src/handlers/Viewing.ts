import * as WebSocket from 'ws';
import { WsServer } from '../servers/WsServer';
import { PersistenceApi } from '../persistence/API';
import { GamePhaseHandler, GamePhases } from './GamePhases';
import { ClientMessage, Actions, Events, Errors, LobbyUpdatedMessage } from '../Messages';
import { WsPlayer } from '../servers/WsPlayer';

export class Viewing {
  constructor(private wsServer: WsServer, private persistenceApi: PersistenceApi, private gamePhaseHandler: GamePhaseHandler) {
    this.wsServer.on(Actions.START_NEXT_GAME, this.onStartNextGame.bind(this));
  }

  private onStartNextGame(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    if (!this.gamePhaseHandler.isInPhase(GamePhases.VIEWING, player.gameId)) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.WRONG_GAME_PHASE
      });
      return;
    }

    // TODO: check: is there already a next game
    if (false) {
      this.wsServer.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.NEXT_GAME_ALREADY_STARTED
      });
      return;
    }

    // TODO create new WsPlayer+game and register at WsServer --> Add API for this
    // TODO create player WITH EXISTING NAME at db
    // TODO create game at db
    // TODO add player to game at db
    // TODO get lobbyObject
    const lobby = {
      players: [
        { publicPlayerId: player.publicPlayerId, name: 'Lukas', ready: false }
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
}
