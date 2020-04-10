import App from './App.svelte';
import WebSocketHandler from './WebSocketHandler.js';

let host = window.location.host;
if (host === 'localhost:5000') {
  host = `ws://${host.replace(':5000', ':5001')}`;
} else {
  host = `wss://${host}`;
}
const wsHandler = new WebSocketHandler(`${host}/ws`);

const app = new App({
  target: document.body,
  props: {
    wsHandler
  }
});

export default app;
