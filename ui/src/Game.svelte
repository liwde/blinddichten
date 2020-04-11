<script>
  export let wsHandler;
  export let gameId;
  export let publicPlayerId;
  export let gamePhase;

  import Lobby from './screens/Lobby.svelte';
  import Writing from './screens/Writing.svelte';
  import Viewing from './screens/Viewing.svelte';
  import LoadingIndicator from './controls/LoadingIndicator.svelte';
  import { onDestroy } from 'svelte';
  import { finishGame } from './util/lastGames';

  let poems;

  function socketRecreated() {
        wsHandler.sendMessage({ type: 'recoverSession', gameId, privatePlayerId, publicPlayerId });
  }
  wsHandler.on('socketRecreated', socketRecreated);

  function sessionRecovered(msg) {
    gamePhase = msg.currentPhase;

    if(!msg.playerInGame) {
      if (gamePhase === 'lobby') {
        // in the lobby, we may simply try to re-enter
        wsHandler.sendMessage({ type: 'enterGame', gameId });
      } else  {
        gameId = null;
        location.hash = '';
      }
    }
  }
  wsHandler.on('sessionRecovered', sessionRecovered);

  function lobbyCompleted(msg) {
    gamePhase = 'writing';
  }
  wsHandler.on('lobbyCompleted', lobbyCompleted);

  function writingCompleted(msg) {
    poems = msg.poems;
    gamePhase = 'viewing';
    finishGame(gameId);
  }
  wsHandler.on('writingCompleted', writingCompleted);


  onDestroy(() => {
    wsHandler.off('socketRecreated', socketRecreated);
    wsHandler.off('lobbyCompleted', lobbyCompleted);
    wsHandler.off('writingCompleted', writingCompleted);
    wsHandler.off('sessionRecovered', sessionRecovered);
  });
</script>

{#if gamePhase === 'lobby'}
  <Lobby wsHandler="{wsHandler}" publicPlayerId="{publicPlayerId}" gameId="{gameId}" on:errorOccurred />
{:else if gamePhase === 'writing'}
  <Writing wsHandler="{wsHandler}" publicPlayerId="{publicPlayerId}" on:errorOccurred />
{:else if gamePhase === 'viewing'}
  <Viewing poems="{poems}" on:errorOccurred />
{:else}
  <LoadingIndicator />
{/if}
