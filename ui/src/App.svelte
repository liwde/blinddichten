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

<app>
  {#if gameId}
    <Game wsHandler="{wsHandler}" gameId="{gameId}" publicPlayerId="{publicPlayerId}" />
  {:else}
    <Home on:createGame="{createGame}" createDisabled="{waitingForGameCreation}" />
  {/if}
</app>

<style>
  app {
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    app {
      max-width: none;
    }
  }
</style>
