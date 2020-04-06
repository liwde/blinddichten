import { PersistenceApi } from "../persistence/API";

export enum GamePhases {
  LOBBY = 'LOBBY', WRITING = 'WRITING', VIEWING = 'VIEWING'
}

type handlerFn = (gameId: string) => void;

export class GamePhaseHandler {
  private handlers: Map<GamePhases, handlerFn[]> = new Map();

  constructor(private persistenceApi: PersistenceApi) {}

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
