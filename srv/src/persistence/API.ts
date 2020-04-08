import { Game } from "./entities/Game";
import { Player } from "./entities/Player";
import { WsPlayer } from "../servers/WsPlayer";
import { GamePhases } from "../handlers/GamePhases";

export interface PersistenceApi {
  createGame(player: WsPlayer): Promise<void>;
  deleteGame(gameId: string): Promise<void>;
  getGame(gameId: string): Promise<Game>;
  addPlayer(player: WsPlayer, isOwner?: boolean): Promise<void>;
  getPlayer(privatePlayerId: string): Promise<Player>;
  removePlayer(privatePlayerId: string): Promise<void>;

  getPlayersByGame(gameId: string): Promise<Player[]>;
  updatePlayerName(privatePlayerId: string, name: string): Promise<void>;
  updatePlayerReady(privatePlayerId: string, ready: boolean): Promise<void>;
  updatePlayersReady(gameId: string, ready: boolean): Promise<void>;
  updateGameRounds(gameId: string, rounds: number): Promise<void>;
  updateGamePhase(gameId: string, phase: GamePhases): Promise<void>;
  updateGameChunk(gameId: string, chunk: number): Promise<void>;

  addVerse(gameId: string, privatePlayerId: string, verseNo: number, text: string): Promise<void>; // mysql: INSERT ... ON DUPLICATE KEY UPDATE!
  getVerseText(gameId: string, privatePlayerId: string, verseNo: number): Promise<string>;
  getAllVerseTexts(gameId: string, privatePlayerId: string): Promise<string[]>;
}
