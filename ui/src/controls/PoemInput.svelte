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
  import { fly } from 'svelte/transition';
  import titleGenerator from '../titlegen';

  let lastVerseNo = 2 * chunk + 1;
  let verseOneNo = 2 * chunk + 2;
  let verseTwoNo = 2 * chunk + 3;
  $: {
    lastVerseNo = 2 * chunk + 1;
    verseOneNo = 2 * chunk + 2;
    verseTwoNo = 2 * chunk + 3;
  }

  function makeRandomTitle() {
    verseOne = titleGenerator.generateTitle();
  }
</script>

<poem class="card" in:fly="{{x: 500, duration: 800, delay: 800}}" out:fly="{{x: -500, duration: 800}}">
  <div class="card-body">
    {#if chunk === 0}
      <h3 class="card-title">
        {#if !isLocked}<img class="inputAction" src="img/random.svg" alt="Zufälligen Titel generieren" title="Zufälligen Titel generieren" on:click="{makeRandomTitle}" />{/if}
        <LockableInput isLocked="{isLocked}" bind:value="{verseOne}" placeholder="Titel" />
      </h3>
      <ol start="1">
        <li><LockableInput isLocked="{isLocked}" bind:value="{verseTwo}" placeholder="Vers 1" /></li>
      </ol>
    {:else}
      <h3 class="card-title">{title}</h3>
      {#if chunk >= 2}
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

  img.inputAction {
    cursor: pointer;
    height: 20px;
    position: absolute;
    right: 40px;
    top: 38px;
  }
  img.inputAction:hover {
    opacity: .5;
  }
</style>
