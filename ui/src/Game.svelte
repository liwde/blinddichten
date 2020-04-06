<script>
  export let wsHandler;

  import Lobby from './screens/Lobby.svelte';
  import Writing from './screens/Writing.svelte';
  import Viewing from './screens/Viewing.svelte';

  let gamePhase = 'lobby';
</script>

{#if gamePhase === 'lobby'}
  <Lobby bind:wsHandler="{wsHandler}" />
{:else if gamePhase === 'writing'}
  <Writing bind:wsHandler="{wsHandler}" />
{:else}
  <Viewing bind:wsHandler="{wsHandler}" />
{/if}
