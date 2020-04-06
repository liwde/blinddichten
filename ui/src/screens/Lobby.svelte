<script>
  export let wsHandler;
  export let publicPlayerId;

  import debounce from '../util/debounce';

  let players = [];
  let rounds;
  let owner;
  let ready = false;

  wsHandler.on.lobbyUpdated = function(msg) {
    players = msg.lobby.players;
    rounds = msg.lobby.settings.rounds;
    ready = players.find(p => p.publicPlayerId === publicPlayerId).ready;
    owner = players.find(p => p.publicPlayerId === publicPlayerId).isOwner;
  }

  function editName(event) {
    wsHandler.sendMessage({
      type: 'changeLobby',
      name: event.target.value
    });
  }
  const editNameDebounced = debounce(editName, 1000);

  function editRounds(event) {
    wsHandler.sendMessage({
      type: 'changeLobby',
      settings: { rounds: event.target.value }
    });
  }
  const editRoundsDebounced = debounce(editRounds, 1000);
</script>

<main>
  <h1>Lobby</h1>
  <settings>
    <h2>Einstellungen</h2>
    Rundenzahl: <input disabled="{!owner}" type="number" value="{rounds}" on:keyup="{editRoundsDebounced}" on:change="{editRounds}" />
  </settings>
  <players>
    <h2>Spieler</h2>
    <ol>
      {#each players as player}
        <li class:ready="{player.ready}" class:me="{player.publicPlayerId === publicPlayerId}" class:owner="{player.isOwner}">
          {#if player.publicPlayerId === publicPlayerId && !player.ready}
            <input type="text" value="{player.name}" on:keyup="{editNameDebounced}" on:change="{editName}" />
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
  li.ready {
    background-color: lightgreen;
  }
  li.me.ready {
    background-color: #eee;
  }
  li.owner::after {
    content: " 👑"
  }
</style>
