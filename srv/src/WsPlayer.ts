import * as WebSocket from 'ws';

export class WsPlayer {
  constructor(public playerId: string, public gameId: string, public ws: WebSocket, public lastSeen: Date = new Date()) {}
  // remark: JS is not python, we will get a new Date object on each invocation
}
