import { PersistenceApi } from "./API";
import { Game } from "./entities/Game";
import { DEFAULT_NUM_ROUNDS, DEFAULT_PLAYER_NAME } from "../config";
import { GamePhases } from "../handlers/GamePhases";
import { Player } from "./entities/Player";
import { WsPlayer } from "../servers/WsPlayer";

export class InMemoryPersistence implements PersistenceApi {
  private games: Map<string, Game> = new Map();
  private players: Map<string, Player> = new Map();

  public async createGame(wsPlayer: WsPlayer) {
    if (this.games.get(wsPlayer.gameId)) {
      throw new Error('Game already exists');
    }
    const game: Game = {
      gameId: wsPlayer.gameId,
      owner: wsPlayer.privatePlayerId,
      rounds: DEFAULT_NUM_ROUNDS,
      currentPhase: GamePhases.LOBBY
    };
    this.games.set(wsPlayer.gameId, game);
  }

  public async deleteGame(gameId: string) {
    this.games.delete(gameId);
    this.players.forEach(player => {
      if (player.gameId === gameId) {
        this.players.delete(player.privatePlayerId);
      }
    });
  }

  public async getGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game doesn\'t exist');
    }
    return game;
  }

  public async addPlayer(wsPlayer: WsPlayer, isOwner: boolean = false) {
    if (this.players.get(wsPlayer.privatePlayerId)) {
      throw new Error('Player already exists');
    }
    if (!this.games.get(wsPlayer.gameId)) {
      throw new Error('Game doesn\'t exist');
    }
    const player: Player = {
      gameId: wsPlayer.gameId,
      privatePlayerId: wsPlayer.privatePlayerId,
      publicPlayerId: wsPlayer.publicPlayerId,
      name: DEFAULT_PLAYER_NAME,
      isOwner,
      ready: false
    };
    this.players.set(wsPlayer.privatePlayerId, player);
  }

  public async getPlayer(privatePlayerId: string) {
    const player = this.players.get(privatePlayerId);
    if (!player) {
      throw new Error('Player doesn\'t exist');
    }
    return player;
  }

  public async removePlayer(privatePlayerId: string) {
    this.players.delete(privatePlayerId);
  }

  public async getPlayersByGame(gameId: string) {
    return Array.from(this.players.values()).filter(player => player.gameId === gameId);
  }

  public async updatePlayerName(privatePlayerId: string, name: string) {
    const player = this.players.get(privatePlayerId);
    if (!player) {
      throw new Error('Player doesn\'t exist');
    }
    player.name = name;
  }

  public async updatePlayerReady(privatePlayerId: string, ready: boolean) {
    const player = this.players.get(privatePlayerId);
    if (!player) {
      throw new Error('Player doesn\'t exist');
    }
    player.ready = ready;
  }

  public async updatePlayersReady(gameId: string, ready: boolean) {
    this.players.forEach(player => {
      if (player.gameId === gameId) {
        player.ready = ready;
      }
    });
  }

  public async updateGameRounds(gameId: string, rounds: number) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game doesn\'t exist');
    }
    game.rounds = rounds;
  }

  public async updateGamePhase(gameId: string, phase: GamePhases) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game doesn\'t exist');
    }
    game.currentPhase = phase;
  }
}
