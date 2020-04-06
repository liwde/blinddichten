<script>
  export let wsHandler;

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
    if (waitingForGameCreation) {
      location.hash = gameId;
    }
    waitingForGameCreation = false;
  };

  onDestroy(() => wsHandler.close());

  $: {
    if (location.hash && gameId !== location.hash.substr(1)) {
      gameId = location.hash.substr(1);
      wsHandler.sendMessage({ type: 'enterGame', gameId });
    }
  }
</script>

<app>
  {#if !gameId}
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
