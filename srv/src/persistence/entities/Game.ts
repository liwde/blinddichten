import { GamePhases } from '../../handlers/GamePhases';

export interface Game {
  gameId: string; // key
  owner: string;
  rounds: number,
  currentPhase: GamePhases,
  currentChunk: number
}
