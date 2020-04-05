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
  GAME_NOT_FOUND = 'gameNotFound'
}

export interface ClientMessage {
  type: Actions;
  privatePlayerId: string | null;
  gameId: string | null;
}

export interface ServerMessage {
  type: Events;
  [prop: string]: any;
}
