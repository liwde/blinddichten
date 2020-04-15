import * as WebSocket from 'ws';
import { synchronizePerGameId } from '../AsyncUtils';
import { getDefaultPlayerName } from "../getDefaultPlayerName";
import { Actions, ChangeLobbyMessage, ClientMessage, CloseGameMessage, Errors, Events, GameEnteredMessage, LobbyUpdatedMessage } from '../Messages';
import { PersistenceApi } from '../persistence/API';
import { WsPlayer } from '../servers/WsPlayer';
import { PromisedWsHandlerFnReturn, WsServer } from '../servers/WsServer';
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
    // Lobby must not handle recovering, as players are removed immediately.
    // Instead, the client must re-enter the game.
  }

  private async getGameSettings(gameId: string) {
    const { rounds } = await this.persistenceApi.getGame(gameId);
    return { rounds };
  }

  private async getLobby(gameId: string) {
    const [ players, settings ] = await Promise.all([this.gamePhaseHandler.getPlayersForExternal(gameId), this.getGameSettings(gameId)]);
    return { players, settings };
  }

  private async sendAndEventuallyCloseLobby(gameId: string) {
    const [ players, settings ] = await Promise.all([
      this.gamePhaseHandler.getPlayersForExternal(gameId),
      this.getGameSettings(gameId)
    ]);

    const luMsg: LobbyUpdatedMessage = {
      type: Events.LOBBY_UPDATED,
      players, settings
    };
    this.wsServer.broadcastMessage(gameId, luMsg);

    if (players.length > 0 && players.every(p => p.ready)) {
      await this.gamePhaseHandler.switchToPhase(GamePhases.WRITING, gameId);
      this.wsServer.broadcastMessage(gameId, {
        type: Events.LOBBY_COMPLETED
      });
    }
  }

  @synchronizePerGameId
  private async onCreateGame(ws: WebSocket, msg: ClientMessage, player: WsPlayer): PromisedWsHandlerFnReturn {
    await this.persistenceApi.createGame(player);
    await this.persistenceApi.addPlayer(player, getDefaultPlayerName(), true);

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
        msg: Errors.CANT_ENTER_GAME
      });
      return;
    }
    await this.persistenceApi.addPlayer(player, getDefaultPlayerName());

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
    if (await this.gamePhaseHandler.isInPhase(GamePhases.LOBBY, player.gameId)) {
      await this.persistenceApi.removePlayer(player.privatePlayerId);
      await this.sendAndEventuallyCloseLobby(player.gameId);
    }
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
