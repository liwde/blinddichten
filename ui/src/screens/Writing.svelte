<script>
  export let wsHandler;
  export let publicPlayerId;

  let poems = []; // array for animation

  let players;
  let status;

  let verseOne;
  let verseTwo;

  let ready = false;

  import { onDestroy, createEventDispatcher } from 'svelte';
  import LoadingIndicator from '../controls/LoadingIndicator.svelte';
  import PlayerStatus from '../controls/PlayerStatus.svelte';
  import PoemInput from '../controls/PoemInput.svelte';
  import PoemProgress from '../controls/PoemProgress.svelte';
  import { fly } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  function writingNext(msg) {
    poems = [{
      title: msg.title,
      lastVerse: msg.lastVerse,
      chunk: msg.status.currentChunk
    }];
    verseOne = '';
    verseTwo = '';
    writingUpdated(msg); // to handle players and status
  }
  wsHandler.on('writingNext', writingNext);

  function writingUpdated(msg) {
    players = msg.players;
    status = msg.status;
    ready = players.find(p => p.publicPlayerId === publicPlayerId).ready;
  }
  wsHandler.on('writingUpdated', writingUpdated);

  onDestroy(() => {
    wsHandler.off('writingNext', writingNext);
    wsHandler.off('writingUpdated', writingUpdated);
  });

  function readyWriting() {
    if (verseOne && (verseTwo || status.isLastChunk)) {
      wsHandler.sendMessage({ type: 'readyWriting', verse1: verseOne, verse2: verseTwo });
    } else {
      dispatch('errorOccurred', 'nothingEntered');
    }
  }

  function unreadyWriting() {
    wsHandler.sendMessage({ type: 'unreadyWriting' });
  }
</script>

<main in:fly="{{x: 500, delay: 400}}" out:fly="{{x: -500}}">
  <h1>Schreiben</h1>
  <div class="row rolling">
  {#each poems as { title, lastVerse, chunk} (chunk)}
    <div class="col-6"><div class="rolling-content">
      <PoemInput title="{title}" lastVerse="{lastVerse}" bind:verseOne bind:verseTwo chunk="{status.currentChunk}" isLastChunk="{status.isLastChunk}" isLocked="{ready}" on:lock="{readyWriting}" on:unlock="{unreadyWriting}" players="{players}" publicPlayerId="{publicPlayerId}" />
    </div></div>
  {:else}
    <LoadingIndicator />
  {/each}
  </div>
  <div class="row flex-center">
    <div class="sm-12 md-6 lg-6 col"><PlayerStatus players="{players}" publicPlayerId="{publicPlayerId}" /></div>
    <div class="sm-12 md-6 lg-6 col"><PoemProgress status="{status}" /></div>
  </div>
</main>

<style>
  main {
    max-width: 800px;
  }
  div.rolling-content {
    width: 200%;
  }
</style>
