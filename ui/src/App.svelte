<script>
  export let wsHandler;

  import Game from './Game.svelte';
  import Home from './screens/Home.svelte';
  import { onDestroy } from 'svelte';

  let gameId, privatePlayerId, publicPlayerId;
  let waitingForGameCreation = false;

  function createGame() {
    waitingForGameCreation = true;
    wsHandler.sendMessage({ type: 'createGame' });
  }

  function gameEntered(msg) {
    gameId = msg.gameId;
    privatePlayerId = msg.privatePlayerId;
    publicPlayerId = msg.publicPlayerId;
    window.localStorage.setItem('game_' + gameId, JSON.stringify({ publicPlayerId, privatePlayerId }));
    if (waitingForGameCreation) {
      location.hash = gameId;
    }
    const lastPlayerName = window.localStorage.getItem('playerName');
    if (lastPlayerName) {
      wsHandler.sendMessage({ type: 'changeLobby', name: lastPlayerName });
    }
    waitingForGameCreation = false;
  }
  wsHandler.on('gameEntered', gameEntered);

  function errorOccurred(msg) {
    //if (msg.msg === 'gameNotFound') {
    // TODO: We need to find a way when errors can be recovered by refreshing the state -- and then do this.
    // For now, we just always reset and go home
    gameId = null;
    location.hash = '';
    alert(msg.msg);
    //}
  }
  wsHandler.on('errorOccurred', errorOccurred);

  function hashChanged() {
    if (location.hash && location.hash.length > 1 && gameId !== location.hash.substr(1)) {
      gameId = location.hash.substr(1);
      const existingGame = window.localStorage.getItem('game_' + gameId);
      if (existingGame) {
        let existingGameParsed = JSON.parse(existingGame);
        privatePlayerId = existingGameParsed.privatePlayerId;
        publicPlayerId = existingGameParsed.publicPlayerId;
        wsHandler.sendMessage({ type: 'recoverSession', gameId, privatePlayerId, publicPlayerId });
      } else {
        wsHandler.sendMessage({ type: 'enterGame', gameId });
      }
    }
  }

  window.onhashchange = hashChanged

  onDestroy(() => {
    wsHandler.off('gameEntered', gameEntered);
    wsHandler.off('errorOccurred', errorOccurred);
    wsHandler.close()
  });

  hashChanged();
</script>

<nav class="border fixed split-nav">
  <div class="nav-brand">
    <h3><a href="/">blinddichten</a></h3>
  </div>
  <div class="collapsible">
    <input id="collapsible1" type="checkbox" name="collapsible1">
    <button>
    <label for="collapsible1">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
      </label>
    </button>
    <div class="collapsible-body">
      <ul class="inline">
        <li><a href="https://blog.liwde.de" target="_blank">liwde</a></li>
        <li><a href="https://www.github.com/liwde/blinddichten" target="_blank">GitHub</a></li>
      </ul>
    </div>
  </div>
</nav>

<app>
  {#if gameId}
    <Game wsHandler="{wsHandler}" gameId="{gameId}" publicPlayerId="{publicPlayerId}" />
  {:else}
    <Home on:createGame="{createGame}" createDisabled="{waitingForGameCreation}" />
  {/if}
</app>

<style>
  app {
    display: block;
    padding: 1em;
  }
</style>
