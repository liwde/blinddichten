import EventEmitter from './util/EventEmitter';

export default class WebSocketHandler extends EventEmitter {
  constructor(serverUri) {
    super();
    this.serverUri = serverUri;
    this.recreatingConnection = false;
    this.createSocket();
  }

  createSocket() {
    if (this.socket) {
      this.socket.close();
    }

    let socketReady;
    this.socketReady = new Promise(resolve => socketReady = resolve);

    this.socket = new WebSocket(this.serverUri);

    this.socket.addEventListener('open', event => {
      if (this.recreatingConnection) {
        this.emit('socketReconnected');
        this.recreatingConnection = false;
      }
      socketReady();
      this.heartbeatIntervalHandle = setInterval(() => this.heartbeat(), 2 * 1000);
    });

    this.socket.addEventListener('close', () => {
      clearInterval(this.heartbeatIntervalHandle);
      this.recreatingConnection = true;
      setTimeout(() => this.createSocket(), 1000);
    });

    this.socket.addEventListener('message', event => {
      const msg = JSON.parse(event.data);
      this.emit(msg.type, msg);
    });
  }

  async sendMessage(msg) {
    await this.socketReady;
    this.socket.send(JSON.stringify(msg));
  }

  heartbeat() {
    this.sendMessage({ type: 'sendHeartbeat' });
  }

  async close() {
    await socketReady
    clearInterval(this.heartbeatIntervalHandle);
    this.socket.close();
  }
}
