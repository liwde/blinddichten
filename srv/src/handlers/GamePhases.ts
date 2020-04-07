import * as WebSocket from 'ws';
import { Actions, ClientMessage, SessionRecoveredMessage, Events } from "../Messages";
import { PersistenceApi } from "../persistence/API";
import { WsPlayer } from "../servers/WsPlayer";
import { WsServer } from "../servers/WsServer";

export enum GamePhases {
  LOBBY = 'lobby', WRITING = 'writing', VIEWING = 'viewing'
}

type handlerFn = (gameId: string) => void;

export class GamePhaseHandler {
  private handlers: Map<GamePhases, handlerFn[]> = new Map();

  constructor(private wsServer: WsServer, private persistenceApi: PersistenceApi) {
    this.wsServer.on(Actions.RECOVER_SESSION, this.onRecoverSession.bind(this));
  }

  private async onRecoverSession(ws: WebSocket, msg: ClientMessage, player: WsPlayer) {
    const currentPhase = (await this.persistenceApi.getGame(player.gameId)).currentPhase;
    let playerInGame: boolean;
    try {
      playerInGame = (await this.persistenceApi.getPlayer(player.privatePlayerId)).gameId === player.gameId;
    } catch(error) {
      playerInGame = false;
    }

    const srMessage: SessionRecoveredMessage = {
      type: Events.SESSION_RECOVERED,
      currentPhase, playerInGame
    };
    this.wsServer.sendMessage(ws, srMessage);
  }

  public async isInPhase(phase: GamePhases, gameId: string): Promise<boolean> {
    return (await this.persistenceApi.getGame(gameId)).currentPhase === phase;
  }

  public async switchToPhase(phase: GamePhases, gameId: string): Promise<void> {
    await this.persistenceApi.updateGamePhase(gameId, phase);
    await this.persistenceApi.updatePlayersReady(gameId, false); // unready all players for next phase
    const handlerList = this.handlers.get(phase);
    if (handlerList) {
      handlerList.forEach(handler => handler(gameId));
    }
  }

  // TODO unclear if really needed...
  public onSwitchTo(phase: GamePhases, handler: handlerFn) {
    let handlerList = this.handlers.get(phase);
    if (!handlerList) {
      handlerList = [];
      this.handlers.set(phase, handlerList);
    }
    handlerList.push(handler);
  }
}
