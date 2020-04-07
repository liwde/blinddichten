<script>
  export let wsHandler;
  export let gameId;
  export let privatePlayerId;
  export let publicPlayerId;

  import Lobby from './screens/Lobby.svelte';
  import Writing from './screens/Writing.svelte';
  import Viewing from './screens/Viewing.svelte';
  import { onDestroy } from 'svelte';

  function sessionRecovered(msg) {
    gamePhase = msg.currentPhase;

    if (gamePhase === 'lobby') {
      wsHandler.sendMessage({ type: 'enterGame', gameId });
    } else if(!msg.playerInGame) {
      gameId = null;
      location.hash = '';
    }
  }
  wsHandler.on('sessionRecovered', sessionRecovered);

  function lobbyCompleted(msg) {
    gamePhase = 'writing';
  }
  wsHandler.on('lobbyCompleted', lobbyCompleted);


  onDestroy(() => {
    wsHandler.off('lobbyCompleted', lobbyCompleted);
    wsHandler.off('sessionRecovered', sessionRecovered);
  });

  let gamePhase = 'lobby';
</script>

{#if gamePhase === 'lobby'}
  <Lobby bind:wsHandler="{wsHandler}" bind:publicPlayerId="{publicPlayerId}" />
{:else if gamePhase === 'writing'}
  <Writing bind:wsHandler="{wsHandler}" />
{:else}
  <Viewing bind:wsHandler="{wsHandler}" />
{/if}
