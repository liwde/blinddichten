<script>
  export let isLocked;

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

{#if isLocked}
  <button on:click="{() => dispatch('unlock')}">Ändern</button>
{:else}
  <button on:click="{() =>  dispatch('lock')}">Fertig</button>
{/if}
