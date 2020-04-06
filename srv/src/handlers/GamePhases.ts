import { PersistenceApi } from "../persistence/API";

export enum GamePhases {
  LOBBY = 'LOBBY', WRITING = 'WRITING', VIEWING = 'VIEWING'
}

type handlerFn = (gameId: string) => void;

export class GamePhaseHandler {
  private handlers: Map<GamePhases, handlerFn[]> = new Map();

  constructor(private persistenceApi: PersistenceApi) {}

  public isInPhase(phase: GamePhases, gameId: string): boolean {
    // TODO: check with persistence
    return true;
  }

  public switchToPhase(phase: GamePhases, gameId: string): void {
    // TODO: set at persistence
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
