<script>
  export let status;

  import LoadingIndicator from './LoadingIndicator.svelte';
</script>

<status>
  <h2>Status</h2>
  {#if status}
    <ul>
      <li>Runde: {status.currentRound + 1}/{status.totalRounds}</li>
      <li>Verse: {status.currentChunk + 1}/{status.totalChunks}</li>
    </ul>
  {:else}
    <LoadingIndicator />
  {/if}
</status>
