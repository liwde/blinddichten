export enum Events {
  GAME_ENTERED = 'gameEntered',

  LOBBY_UPDATED = 'lobbyUpdated',
  LOBBY_COMPLETED = 'lobbyCompleted',

  WRITING_UPDATED = 'writingUpdated',
  WRITING_NEXT = 'writingNext',
  WRITING_COMPLETED = 'writingCompleted',

  NEXT_GAME_STARTED = 'nextGameStarted',

  HEARTBEAT_REQUESTED = 'heartbeatRequested',
  GAME_STATE_SENT = 'gameStateSent',

  ERROR_OCCURRED = 'errorOccurred'
}

export enum Actions {
  CREATE_GAME = 'createGame',
  ENTER_GAME = 'enterGame',

  CHANGE_LOBBY = 'changeLobby',
  READY_LOBBY = 'readyLobby',
  UNREADY_LOBBY = 'unreadyLobby',

  READY_WRITING = 'readyWriting',
  UNREADY_WRITING = 'unreadyWriting',

  START_NEXT_GAME = 'startNextGame',

  GET_GAME_STATE = 'getGameState',
  SEND_HEARTBEAT = 'sendHeartbeat',

  // Virtual Actions
  DISCONNECT = 'disconnect',
  CLOSE_GAME = 'closeGame'
}

export enum Errors {
  UNKNOWN_ERROR = 'unknownError',
  UNHANDLED_EVENT = 'unhandledEvent',
  GAME_NOT_FOUND = 'gameNotFound',
  WRONG_GAME_PHASE = 'wrongGamePhase'
}


export interface ClientMessage {
  type: Actions;
  privateClientId?: string;
}

export interface EnterGameMessage extends ClientMessage {
  gameId: string;
}

export interface CloseGameMessage extends ClientMessage {
  gameId: string;
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

export interface LobbyUpdatedMessage extends ServerMessage {
  lobby: any; // TODO
}
