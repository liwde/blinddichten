<script>
  export let isFirstChunk;
  export let isLastChunk;
  export let isLocked;

  export let title = "";
  export let lastLine = "";

  // Svelte can't handle props with numbers :/
  export let verseOne = "";
  export let verseTwo = "";

  import LockableInput from './LockableInput.svelte';
</script>

<poem>
  {#if isFirstChunk}
    <h2><LockableInput bind:isLocked bind:value="{verseOne}" /></h2>
    <ul>
      <li><LockableInput bind:isLocked bind:value="{verseTwo}" /></li>
    </ul>
  {:else}
    <h2>{title}</h2>
    <ul>
      <li>{lastLine}</li>
      <li><LockableInput bind:isLocked bind:value="{verseOne}" /></li>
      {#if !isLastChunk}
        <li><LockableInput bind:isLocked bind:value="{verseTwo}" /></li>
      {/if}
    </ul>
  {/if}
</poem>

<style>

</style>
