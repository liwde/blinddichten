<script>
  export let poems;

  import LoadingIndicator from '../controls/LoadingIndicator.svelte';
  import { fly } from 'svelte/transition';
</script>

<main in:fly="{{x: 500, delay: 800}}" out:fly="{{x: 500}}">
  <h1>Alle Gedichte</h1>
  {#if poems}
    {#each poems as poem}
      <div class="card margin-bottom">
        <div class="card-body">
          <h3 class="card-title">{poem.title}</h3>
          <h5 class="card-subtitle">von <author>{poem.author}</author></h5>
          <p class="card-text">
            {#each poem.verses as verse}
              <verse>{verse}</verse>
            {/each}
          </p>
        </div>
      </div>
    {/each}
  {:else}
    <LoadingIndicator />
  {/if}
</main>

<style>
  main {
    max-width: 800px;
  }
  author {
    font-style: italic;
  }
  verse {
    display: block;
  }
</style>
