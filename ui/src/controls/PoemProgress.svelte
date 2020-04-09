<script>
  export let status;

  let percentRounds = 0;
  let percentChunks = 0;
  $: {
    if (status) {
      percentRounds = Math.ceil((status.currentRound + 1) / status.totalRounds * 100);
      percentChunks = Math.ceil((status.currentChunk + 1) / status.totalChunks * 100);
    }
  }

  import LoadingIndicator from './LoadingIndicator.svelte';
</script>

<status>
  <h2>Status</h2>
  {#if status}
    <div class="row">
      <div class="progress margin-bottom">
        <div class="bar success w-{percentChunks}">Verspaar {status.currentChunk + 1}/{status.totalChunks}</div>
      </div>
      <div class="progress margin-bottom">
        <div class="bar secondary w-{percentRounds}">Runde {status.currentRound + 1}/{status.totalRounds}</div>
      </div>
    </div>
  {:else}
    <LoadingIndicator />
  {/if}
</status>
