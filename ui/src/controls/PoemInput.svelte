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
  import LockingButton from './LockingButton.svelte';

  let lastVerseNo = 2 * chunk + 1;
  let verseOneNo = 2 * chunk + 2;
  let verseTwoNo = 2 * chunk + 3;
  $: {
    lastVerseNo = 2 * chunk + 1;
    verseOneNo = 2 * chunk + 2;
    verseTwoNo = 2 * chunk + 3;
  }
</script>

<poem class="card">
  <div class="card-body">
    {#if chunk === 0}
      <h4><LockableInput isLocked="{isLocked}" bind:value="{verseOne}" placeholder="Titel" /></h4>
      <ol start="1">
        <li><LockableInput isLocked="{isLocked}" bind:value="{verseTwo}" placeholder="Vers 1" /></li>
      </ol>
    {:else}
      <h4>{title}</h4>
      {#if chunk === 2}
      <hr/>
      {/if}
      <ol start="{lastVerseNo}">
        <li><span class="align">{lastVerse}</span></li>
        <li><LockableInput isLocked="{isLocked}" bind:value="{verseOne}" placeholder="Vers {verseOneNo}" /></li>
        {#if !isLastChunk}
          <li><LockableInput isLocked="{isLocked}" bind:value="{verseTwo}" placeholder="Vers {verseTwoNo}" /></li>
        {/if}
      </ol>
    {/if}
    <LockingButton on:lock on:unlock isLocked="{isLocked}" />
  </div>
</poem>

<style>
  span.align {
    display: inline-block;
    margin: .5rem;
  }
  ol {
    list-style-type: none;
  }
</style>
