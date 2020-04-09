<script>
  export let chunk;
  export let isLastChunk;
  export let isLocked;

  export let title = "";
  export let lastVerse = "";

  // Svelte can't handle props with numbers :/
  export let verseOne = "";
  export let verseTwo = "";

  import LockableInput from './LockableInput.svelte';

  let lastVerseNo = 1;
  $: lastVerseNo = 2 * chunk + 1;
</script>

<poem>
  {#if chunk === 0}
    <h2><LockableInput bind:isLocked bind:value="{verseOne}" /></h2>
    <ol start="1">
      <li><LockableInput bind:isLocked bind:value="{verseTwo}" /></li>
    </ol>
  {:else}
    <h2>{title}</h2>
    <ol start="{lastVerseNo}">
      <li>{lastVerse}</li>
      <li><LockableInput bind:isLocked bind:value="{verseOne}" /></li>
      {#if !isLastChunk}
        <li><LockableInput bind:isLocked bind:value="{verseTwo}" /></li>
      {/if}
    </ol>
  {/if}
</poem>

<style>

</style>
