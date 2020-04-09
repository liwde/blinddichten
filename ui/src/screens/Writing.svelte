<script>
  export let wsHandler;
  export let publicPlayerId;

  let title;
  let lastVerse;

  let players;
  let status;

  let verseOne;
  let verseTwo;

  let ready = false;

  import { onDestroy } from 'svelte';
  import LockingButton from '../controls/LockingButton.svelte';
  import LoadingIndicator from '../controls/LoadingIndicator.svelte';
  import PlayerStatus from '../controls/PlayerStatus.svelte';
  import PoemInput from '../controls/PoemInput.svelte';
  import PoemProgress from '../controls/PoemProgress.svelte';

  function writingNext(msg) {
    title = msg.title;
    lastVerse = msg.lastVerse;
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
    wsHandler.sendMessage({ type: 'readyWriting', verse1: verseOne, verse2: verseTwo });
  }

  function unreadyWriting() {
    wsHandler.sendMessage({ type: 'unreadyWriting' });
  }
</script>

<main>
  <h1>Schreiben</h1>
  {#if status}
    <PoemInput title="{title}" lastVerse="{lastVerse}" bind:verseOne bind:verseTwo chunk="{status.currentChunk}" isLastChunk="{status.isLastChunk}" isLocked="{ready}" />
    <LockingButton on:lock="{readyWriting}" on:unlock="{unreadyWriting}" isLocked="{ready}" />
  {:else}
    <LoadingIndicator />
  {/if}
  <PlayerStatus players="{players}" publicPlayerId="{publicPlayerId}" />
  <PoemProgress status="{status}" />
</main>
