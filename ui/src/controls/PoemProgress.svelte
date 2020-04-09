<script>
  export let status;

  import LoadingIndicator from './LoadingIndicator.svelte';
</script>

{#if status}
  <ul>
    <li>Runde: {status.currentRound}/{status.totalRounds}</li>
    <li>Verse: {status.currentChunk}/{status.totalChunks}</li>
  </ul>
{:else}
  <LoadingIndicator />
{/if}
