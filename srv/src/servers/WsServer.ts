import expressWs from 'express-ws';
import { v4 as uuid } from 'uuid';
import * as WebSocket from 'ws';
import { WsPlayer } from '../WsPlayer';
import { Actions, ClientMessage, Errors, Events, ServerMessage } from '../Messages';
import { Server } from './Server';
import { CLOSE_EMPTY_GAME_TIMEOUT, HEARTBEAT_TIMEOUT, HEARTBEAT_INTERVAL } from '../config';

type handlerFn = (ws: WebSocket, msg: ClientMessage, player?: WsPlayer) => void;

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
    this.on(Actions.DISCONNECT, this.onClientDisconnect.bind(this));

    // check heartbeat
    const heartbeatInterval = setInterval(this.checkHeartbeat.bind(this), HEARTBEAT_INTERVAL);
    this.expressWs.getWss().on('close', () => clearInterval(heartbeatInterval));
  }

  /**
   * Handle incoming Websocket Connections and Messages
   * @param ws Websocket of the incoming Connection
   */
  private onConnect(ws: WebSocket): void {
    ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data);
        // virtual events must not be triggered by incoming messages
        if (msg.type in [Actions.DISCONNECT, Actions.CLOSE_GAME]) {
          return;
        }
        // update player heartbeat
        if (msg.playerId && this.players.get(msg.playerId)) {
          this.players.get(msg.playerId).lastSeen = new Date();
        }
        // trigger action
        this.triggerActionForMessage(ws, msg);
      } catch (error) {
        this.sendMessage(ws, {
          type: Events.ERROR_OCCURRED,
          msg: Errors.UNKNOWN_ERROR,
          payload: error.toString()
        });
      }
    });
  }

  private onCreateGame(ws: WebSocket): void {
    const gameId = uuid();
    const playerId = uuid();

    const player = new WsPlayer(playerId, gameId, ws);
    this.players.set(playerId, player);
    const gamePlayers = new Set<WsPlayer>();
    gamePlayers.add(player);
    this.games.set(gameId, gamePlayers);

    // TODO: actually create game --> Lobby registers on create game as well!
    // TODO: sendMessage will later be sent by Lobby screen that handles game creation
    this.sendMessage(ws, {
      type: Events.GAME_ENTERED,
      playerId, gameId
    });
  }

  private onEnterGame(ws: WebSocket, msg: ClientMessage): void {
    const playerId = uuid();
    const gameId = msg.gameId;

    if (!msg.gameId || !this.games.get(msg.gameId)) {
      this.sendMessage(ws, {
        type: Events.ERROR_OCCURRED,
        msg: Errors.GAME_NOT_FOUND
      });
      return;
    }

    const player = new WsPlayer(playerId, gameId, ws);
    this.players.set(playerId, player);
    this.games.get(msg.gameId).add(player);

    // TODO: actually enter game (and check if it exists at all) --> Lobby registers on create game as well!
    // TODO: sendMessage will later be sent by Lobby screen that handles game creation
    this.sendMessage(ws, {
      type: Events.GAME_ENTERED,
      playerId, gameId
    });
  }

  private onClientDisconnect(_ws: WebSocket, msg: ClientMessage) {
    const player = this.players.get(msg.playerId);
    this.players.delete(msg.playerId);
    const gamePlayers = this.games.get(msg.gameId);
    gamePlayers.delete(player);
    if (gamePlayers.size === 0) {
      this.closeEmptyGameWithTimeout(msg.gameId);
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
        this.triggerActionForMessage(null, {
          type: Actions.CLOSE_GAME,
          playerId: null,
          gameId
        });
      }
    }, CLOSE_EMPTY_GAME_TIMEOUT);
  }

  private checkHeartbeat() {
    const now = new Date().getTime();
    this.players.forEach(player => {
      if (now - player.lastSeen.getTime() > HEARTBEAT_TIMEOUT) {
        this.players.delete(player.playerId);
      }
    });
  }

  private triggerActionForMessage(ws: WebSocket, msg: ClientMessage) {
    const handlerList = this.handlers.get(msg.type);
    const player = this.players.get(msg.playerId);
    if (handlerList) {
      handlerList.forEach(handler => handler(ws, msg, player));
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
  public sendMessage(ws: WebSocket, msg: ServerMessage): void {
    ws.send(JSON.stringify(msg));
  }

  /**
   * Broadcast a ServerMessage to all Clients in a Game
   * @param gameId ID of the Game
   * @param msg Message
   * @param excludePlayerId Optionally exclude a playerId from receiving the message
   */
  public broadcastMessage(gameId: string, msg: ServerMessage, excludePlayerId?: string) {
    const gamePlayers = this.games.get(gameId);
    if (!gamePlayers) {
      throw new Error('gameId not found');
    }
    gamePlayers.forEach(gamePlayer => {
      if (!excludePlayerId || excludePlayerId !== gamePlayer.playerId) {
        this.sendMessage(gamePlayer.ws, msg);
      }
    });
  }
}
