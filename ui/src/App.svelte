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

  wsHandler.on.gameEntered = function gameEntered(msg) {
    gameId = msg.gameId;
    privatePlayerId = msg.privatePlayerId;
    publicPlayerId = msg.publicPlayerId;
    window.localStorage.setItem('game_' + gameId, JSON.stringify({ publicPlayerId, privatePlayerId }));
    if (waitingForGameCreation) {
      location.hash = gameId;
    }
    waitingForGameCreation = false;
  };

  wsHandler.on.errorOccurred = function errorOccurred(msg) {
    if (msg.msg === 'gameNotFound') {
      gameId = null;
    }
  };

  onDestroy(() => wsHandler.close());

  $: {
    if (location.hash && gameId !== location.hash.substr(1)) {
      gameId = location.hash.substr(1);
      const existingGame = window.localStorage.getItem('game_' + gameId);
      if (existingGame) {
        // TODO: Recover state instead of entering again
      }
      wsHandler.sendMessage({ type: 'enterGame', gameId });
    }
  }
</script>

<app>
  {#if gameId}
    <Game bind:wsHandler="{wsHandler}" />
  {:else}
    <Home on:createGame="{createGame}" bind:createDisabled="{waitingForGameCreation}" />
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
