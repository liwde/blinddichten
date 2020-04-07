<script>
  export let wsHandler;
  export let publicPlayerId;

  import debounce from '../util/debounce';import { onDestroy } from 'svelte';

  let players = [];
  let rounds;
  let owner;
  let ready = false;
  let name;

  function lobbyUpdated(msg) {
    players = msg.players;
    rounds = msg.settings.rounds;
    ready = players.find(p => p.publicPlayerId === publicPlayerId).ready;
    owner = players.find(p => p.publicPlayerId === publicPlayerId).isOwner;
  }
  wsHandler.on('lobbyUpdated', lobbyUpdated);

  onDestroy(() => {
    wsHandler.off('lobbyUpdated', lobbyUpdated);
  });

  function editName(event) {
    name = event.target.value;
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

  function readyLobby() {
    window.localStorage.setItem('playerName', name);
    wsHandler.sendMessage({ type: 'readyLobby' });
  }
  function unreadyLobby() {
    wsHandler.sendMessage({ type: 'unreadyLobby' });
  }
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
    <button on:click="{unreadyLobby}">Ändern</button>
  {:else}
    <button on:click="{readyLobby}">Fertig</button>
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
