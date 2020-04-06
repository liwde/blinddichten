<script>
  export let wsHandler;
  export let publicPlayerId;

  import debounce from '../util/debounce';

  let players = [];
  let rounds;
  let ready = false;

  wsHandler.on.lobbyUpdated = function(msg) {
    players = msg.lobby.players;
    rounds = msg.lobby.settings.rounds;
    ready = players.find(p => p.publicPlayerId === publicPlayerId).ready;
  }

  const editName = debounce(function editName(event) {
    wsHandler.sendMessage({
      type: 'changeLobby',
      name: event.target.value
    });
  }, 1000);
</script>

<main>
  <players>
    <ol>
      {#each players as player}
        <li class:ready="{player.ready}" class:me="{player.publicPlayerId === publicPlayerId}">
          {#if player.publicPlayerId === publicPlayerId && !player.ready}
            <input type="text" value="{player.name}" on:keyup="{editName}">
          {:else}
            {player.name}
          {/if}
        </li>
      {/each}
    </ol>
  </players>
  {#if ready}
    <button on:click="{wsHandler.sendMessage({ type: 'unreadyLobby' })}">Ändern</button>
  {:else}
    <button on:click="{wsHandler.sendMessage({ type: 'readyLobby' })}">Fertig</button>
  {/if}
</main>

<style>
  li.me.ready {
    background-color: #eee;
  }
</style>
