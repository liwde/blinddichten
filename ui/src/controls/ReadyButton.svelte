<script>
  export let players;
  export let publicPlayerId;
  export let lastReadyText = 'Fertig';

  let isReady = false;
  let isLast = false;
  $: {
    const me = Array.isArray(players) && players.find(p => p.publicPlayerId === publicPlayerId);
    isReady = me ? me.ready : false;
    isLast = Array.isArray(players) && players.filter(p => !p.ready).length === 1;
  }

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

<button on:click="{() => dispatch(isReady ? 'unlock' : 'lock')}">
{#if isReady}Ändern
{:else if isLast}{lastReadyText}
{:else}Fertig{/if}
</button>
