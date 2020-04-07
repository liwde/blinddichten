<script>
  export let wsHandler;
  export let gameId;
  export let privatePlayerId;
  export let publicPlayerId;

  import Lobby from './screens/Lobby.svelte';
  import Writing from './screens/Writing.svelte';
  import Viewing from './screens/Viewing.svelte';

  wsHandler.on('lobbyCompleted', function(msg) {
    gamePhase = 'writing';
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
