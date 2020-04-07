import { GamePhases } from "./handlers/GamePhases";

export enum Events {
  GAME_ENTERED = 'gameEntered',
  SESSION_RECOVERED = 'sessionRecovered',

  LOBBY_UPDATED = 'lobbyUpdated',
  LOBBY_COMPLETED = 'lobbyCompleted',

  WRITING_UPDATED = 'writingUpdated',
  WRITING_NEXT = 'writingNext',
  WRITING_COMPLETED = 'writingCompleted',

  NEXT_GAME_STARTED = 'nextGameStarted',

  ERROR_OCCURRED = 'errorOccurred'
}

export enum Actions {
  CREATE_GAME = 'createGame',
  ENTER_GAME = 'enterGame',
  RECOVER_SESSION = 'recoverSession',

  CHANGE_LOBBY = 'changeLobby',
  READY_LOBBY = 'readyLobby',
  UNREADY_LOBBY = 'unreadyLobby',

  READY_WRITING = 'readyWriting',
  UNREADY_WRITING = 'unreadyWriting',

  START_NEXT_GAME = 'startNextGame',

  SEND_HEARTBEAT = 'sendHeartbeat',

  // Virtual Actions
  DISCONNECT = 'disconnect',
  CLOSE_GAME = 'closeGame'
}

export enum Errors {
  UNKNOWN_ERROR = 'unknownError',
  UNHANDLED_EVENT = 'unhandledEvent',
  GAME_NOT_FOUND = 'gameNotFound',
  WRONG_GAME_PHASE = 'wrongGamePhase',
  NEXT_GAME_ALREADY_STARTED = 'nextGameAlreadyStarted'
}


export interface ClientMessage {
  type: Actions;
  privateClientId?: string;
}

export interface EnterGameMessage extends ClientMessage {
  gameId: string;
}

export interface RecoverSessionMessage extends ClientMessage {
  gameId: string;
  privatePlayerId: string;
  publicPlayerId: string;
}

export interface ChangeLobbyMessage extends ClientMessage {
  name?: string;
  settings?: any; // TODO
}

export interface CloseGameMessage extends ClientMessage {
  gameId: string;
}

export interface ReadyWritingMessage extends ClientMessage {
  verse1: string; // is title on first chunk
  verse2?: string; // is empty on last chunk
}


export interface ServerMessage {
  type: Events;
}

export interface ErrorMessage extends ServerMessage {
  msg: Errors;
  payload?: any;
}

export interface GameEnteredMessage extends ServerMessage {
  publicPlayerId: string;
  privatePlayerId: string;
  gameId: string;
}

export interface SessionRecoveredMessage extends ServerMessage {
  currentPhase: GamePhases,
  playerInGame: boolean
}

export interface LobbyUpdatedMessage extends ServerMessage {
  lobby: any; // TODO
}

export interface WritingUpdatedMessage extends ServerMessage {
  players: any; // TODO
}

export interface WritingNextMessage extends ServerMessage {
  title: string;
  lastVerse: string;
}

export interface WritingCompletedMessage extends ServerMessage {
  poems: any; // TODO
}
