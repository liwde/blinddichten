export default class WebSocketHandler {
  constructor(serverUri) {
    this.serverUri = serverUri;
    this.on = {};
    this.createSocket();
  }

  createSocket() {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = new WebSocket(this.serverUri);

    this.socket.addEventListener('open', event => {
      this.heartbeatIntervalHandle = setInterval(() => this.heartbeat(), 10 * 1000);
    });

    this.socket.addEventListener('close', () => {
      clearInterval(this.heartbeatIntervalHandle);
      setTimeout(this.createSocket, 1000)
    });

    this.socket.addEventListener('message', event => {
      const msg = JSON.parse(event.data);
      if (msg.type && this.on[msg.type]) {
        this.on[msg.type](msg);
      }
    });
  }

  sendMessage(msg) {
    this.socket.send(JSON.stringify(msg));
  }

  heartbeat() {
    this.sendMessage({ type: 'sendHeartbeat' });
  }

  close() {
    clearInterval(this.heartbeatIntervalHandle);
    this.socket.close();
  }
}
