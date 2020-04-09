<script>
  export let poems;

  import LoadingIndicator from '../controls/LoadingIndicator.svelte';
</script>

<main>
  <h1>Alle Gedichte</h1>
  {#if poems}
    {#each poems as poem}
      <h2>{poem.title}</h2>
      <author>{poem.author}</author>
      <verses>
        {#each poem.verses as verse}
          <verse>{verse}</verse>
        {/each}
      </verses>
    {/each}
  {:else}
    <LoadingIndicator />
  {/if}
</main>

<style>
  author {
    font-style: italic;
  }
  author, verses, verse {
    display: block;
  }
</style>
