import App from './App.svelte';
import WebSocketHandler from './WebSocketHandler.js';

const wsHandler = new WebSocketHandler('ws://localhost:5001/ws');

const app = new App({
  target: document.body,
  props: {
    wsHandler
  }
});

export default app;
