import App from './App.svelte';
import WebSocketHandler from './WebSocketHandler.js';

let host = window.location.host;
if (host === 'localhost') {
  host = `ws://${host}:5001`;
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
