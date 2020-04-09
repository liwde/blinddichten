import { PersistenceApi } from "./API";
import { Game } from "./entities/Game";
import { DEFAULT_NUM_ROUNDS, DEFAULT_PLAYER_NAME } from "../config";
import { GamePhases } from "../handlers/GamePhases";
import { Player } from "./entities/Player";
import { WsPlayer } from "../servers/WsPlayer";
import { Verse } from "./entities/Verse";

export class InMemoryPersistence implements PersistenceApi {
  private games: Map<string, Game> = new Map();
  private players: Map<string, Player> = new Map();
  private verses: Map<string, Verse> = new Map();

  public async createGame(wsPlayer: WsPlayer) {
    if (this.games.get(wsPlayer.gameId)) {
      throw new Error('Game already exists');
    }
    const game: Game = {
      gameId: wsPlayer.gameId,
      owner: wsPlayer.privatePlayerId,
      rounds: DEFAULT_NUM_ROUNDS,
      currentChunk: 0,
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

  public async updateGameChunk(gameId: string, chunk: number) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game doesn\'t exist');
    }
    game.currentChunk = chunk;
  }

  public async addVerse(gameId: string, privatePlayerId: string, verseNo: number, text: string) {
    const key = gameId + privatePlayerId + verseNo ;
    const verse = this.verses.get(key);
    if (verse) {
      verse.text = text;
    } else {
      this.verses.set(key, { gameId, privatePlayerId, verseNo, text});
    }
  }

  public async getVerseText(gameId: string, privatePlayerId: string, verseNo: number) {
    const key = gameId + privatePlayerId + verseNo ;
    const verse = this.verses.get(key);
    if (!verse) {
      throw new Error('Verse doesn\'t exist');
    }
    return verse.text;
  }

  public async getAllVerseTexts(gameId: string, privatePlayerId: string) {
    const verses: Verse[] = [];
    this.verses.forEach(verse => {
      if (verse.gameId === gameId && verse.privatePlayerId === privatePlayerId) {
        verses.push(verse);
      }
    });
    return verses.sort((v1, v2) => v1.verseNo - v2.verseNo).map(v => v.text);
  }
}
