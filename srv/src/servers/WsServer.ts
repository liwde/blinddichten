import expressWs from 'express-ws';
import { v4 as uuid } from 'uuid';
import * as WebSocket from 'ws';
import { WsPlayer } from './WsPlayer';
import { Actions, ClientMessage, Errors, Events, ServerMessage, EnterGameMessage, CloseGameMessage } from '../Messages';
import { Server } from './Server';
import { CLOSE_EMPTY_GAME_TIMEOUT, HEARTBEAT_TIMEOUT, HEARTBEAT_INTERVAL } from '../config';

// note: handler function can return modified { ws, msg, player? } for handlers registered later or skip them with { skip: true }
type HandlerFnReturn = { ws: WebSocket, msg: ClientMessage, player?: WsPlayer, skip?: boolean } | { skip: true } | null | undefined;
type handlerFn = (ws: WebSocket, msg: ClientMessage, player?: WsPlayer) => HandlerFnReturn;

export class WsServer {
  private expressWs: expressWs.Instance;
  private app: expressWs.Application

  private games: Map<string, Set<WsPlayer>> = new Map();
  private players: Map<string, WsPlayer> = new Map();
  private handlers: Map<Actions, handlerFn[]> = new Map();

  constructor(private server: Server) {
    this.app = this.server.app as expressWs.Application;
    this.expressWs = expressWs(this.server.app);
    this.app.ws('/ws', this.onConnect.bind(this));

    // register internal operations
    this.on(Actions.CREATE_GAME, this.onCreateGame.bind(this));
    this.on(Actions.ENTER_GAME, this.onEnterGame.bind(this));
    this.on(Actions.DISCONNECT, this.onDisconnect.bind(this));

    // check heartbeat
    const heartbeatInterval = setInterval(this.checkHeartbeat.bind(this), HEARTBEAT_INTERVAL);
    this.expressWs.getWss().on('close', () => clearInterval(heartbeatInterval));
  }

  /**
   * Handle incoming Websocket Connections and Messages
   * @param ws Websocket of the incoming Connection
   */
  private onConnect(ws: WebSocket): void {
    let player: WsPlayer;
    ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data);
        // virtual events must not be triggered by incoming messages
        if (msg.type in [Actions.DISCONNECT, Actions.CLOSE_GAME]) {
          return;
        }
        // update local player object (necessary for reconnect)
        if (msg.playerId && this.players.get(msg.playerId)) {
          player = this.players.get(msg.playerId);
        }
        // update player heartbeat
        if (player) {
          player.lastSeen = new Date();
        }
        // trigger action
        this.triggerAction(ws, msg, player);
      } catch (error) {
        this.sendMessage(ws, {
          type: Events.ERROR_OCCURRED,
          msg: Errors.UNKNOWN_ERROR,
          payload: error.toString()
        });
      }
    });

    ws.on('close', () => {
      if (player) {
        this.triggerAction(ws, {
          type: Actions.DISCONNECT
        }, player);
      }
    });
  }

  private onCreateGame(ws: WebSocket, msg: ClientMessage): HandlerFnReturn {
    const gameId = uuid();
    const privatePlayerId = uuid();
    const publicPlayerId = uuid();

    const player = new WsPlayer(privatePlayerId, publicPlayerId, gameId, ws);
    this.players.set(privatePlayerId, player);
    const gamePlayers = new Set<WsPlayer>();
    gamePlayers.add(player);
    this.games.set(gameId, gamePlayers);

    return { ws, msg, player };
  }

  private onEnterGame(ws: WebSocket, msg: EnterGameMessage): HandlerFnReturn {
    const privatePlayerId = uuid();
    const publicPlayerId = uuid();
    const gameId = msg.gameId;

    if (!msg.gameId || !this.games.get(msg.gameId)) {
      this.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.GAME_NOT_FOUND
      });
      return { skip: true };
    }

    const player = new WsPlayer(privatePlayerId, publicPlayerId, gameId, ws);
    this.players.set(privatePlayerId, player);
    this.games.get(msg.gameId).add(player);

    return { ws, msg, player };
  }

  private onDisconnect(_ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    this.players.delete(player.privatePlayerId);
    const gamePlayers = this.games.get(player.gameId);
    gamePlayers.delete(player);
    if (gamePlayers.size === 0) {
      this.closeEmptyGameWithTimeout(player.gameId);
    }
  }

  /**
   * Closes a game after a given time. Does nothing if there are players left, i.e. when they reconnected within the timeout
   * @param gameId ID of the game to close
   */
  private closeEmptyGameWithTimeout(gameId: string) {
    setTimeout(() => {
      const gamePlayers = this.games.get(gameId);
      if (!gamePlayers || gamePlayers.size === 0) {
        this.games.delete(gameId);
        this.triggerAction(null, {
          type: Actions.CLOSE_GAME,
          gameId
        } as CloseGameMessage);
      }
    }, CLOSE_EMPTY_GAME_TIMEOUT);
  }

  private checkHeartbeat() {
    const now = new Date().getTime();
    this.players.forEach(player => {
      if (now - player.lastSeen.getTime() > HEARTBEAT_TIMEOUT) {
        this.players.delete(player.privatePlayerId);
      }
    });
  }

  private triggerAction(ws: WebSocket, msg: ClientMessage, player?: WsPlayer) {
    const handlerList = this.handlers.get(msg.type);
    if (handlerList) {
      // call handler chain, skipping if necessary, passing modified results if necessary
      handlerList.reduce((previousHandlerResult: HandlerFnReturn, handler) => {
        if (previousHandlerResult.skip === true) {
          return previousHandlerResult;
        }
        return handler(previousHandlerResult.ws, previousHandlerResult.msg, previousHandlerResult.player) || previousHandlerResult;
      }, { ws, msg, player });
    } else {
      this.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.UNHANDLED_EVENT
      });
    }
  }

  /**
   * Register a handler for an Action sent by the Client
   * @param action Action sent by the Client
   * @param handler Handler called on given Action
   */
  public on(action: Actions, handler: handlerFn): void {
    let handlerList = this.handlers.get(action);
    if (!handlerList) {
      handlerList = [];
      this.handlers.set(action, handlerList);
    }
    handlerList.push(handler);
  }

  /**
   * Send a ServerMessage to a Client
   * @param ws WebSocket representing the Client
   * @param msg Message
   */
  public sendMessage<T extends ServerMessage>(ws: WebSocket, msg: T): void {
    ws.send(JSON.stringify(msg));
  }

  /**
   * Broadcast a ServerMessage to all Clients in a Game
   * @param gameId ID of the Game
   * @param msg Message
   * @param excludePlayerId Optionally exclude a playerId from receiving the message
   */
  public broadcastMessage(gameId: string, msg: ServerMessage, excludePrivatePlayerId?: string) {
    const gamePlayers = this.games.get(gameId);
    if (!gamePlayers) {
      throw new Error('gameId not found');
    }
    gamePlayers.forEach(gamePlayer => {
      if (!excludePrivatePlayerId || excludePrivatePlayerId !== gamePlayer.privatePlayerId) {
        this.sendMessage(gamePlayer.ws, msg);
      }
    });
  }

  public getPlayers(gameId: string): Set<WsPlayer> {
    return this.games.get(gameId);
  }
}
