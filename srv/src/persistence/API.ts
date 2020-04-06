import { Game } from "./entities/Game";
import { Player } from "./entities/Player";
import { WsPlayer } from "../servers/WsPlayer";
import { GamePhases } from "../handlers/GamePhases";

export interface PersistenceApi {
  createGame(player: WsPlayer): Promise<void>;
  deleteGame(gameId: string): Promise<void>;
  getGame(gameId: string): Promise<Game>;
  addPlayer(player: WsPlayer): Promise<void>;
  removePlayer(privatePlayerId: string): Promise<void>;

  getPlayersByGame(gameId: string): Promise<Player[]>;
  updatePlayerName(privatePlayerId: string, name: string): Promise<void>;
  updatePlayerReady(privatePlayerId: string, ready: boolean): Promise<void>;
  updatePlayersReady(gameId: string, ready: boolean): Promise<void>;
  updateGameRounds(gameId: string, rounds: number): Promise<void>;
  updateGamePhase(gameId: string, phase: GamePhases): Promise<void>;
}
