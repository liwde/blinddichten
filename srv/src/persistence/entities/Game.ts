import { Player } from './Player';
import { GamePhases } from '../../handlers/GamePhases';

export interface Game {
  gameId: string;
  owner: string;
  rounds: number,
  currentPhase: GamePhases
}
