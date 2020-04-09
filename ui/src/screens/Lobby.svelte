<script>
  export let wsHandler;
  export let publicPlayerId;

  import debounce from '../util/debounce';
  import { onDestroy } from 'svelte';
  import PlayerList from '../controls/PlayerList.svelte';
  import LockingButton from '../controls/LockingButton.svelte';

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
    name = event.detail;
    wsHandler.sendMessage({
      type: 'changeLobby',
      name: event.detail
    });
  }

  function editRounds(event) {
    wsHandler.sendMessage({
      type: 'changeLobby',
      settings: { rounds: event.target.value }
    });
  }
  const editRoundsDebounced = debounce(editRounds, 1000);

  function readyLobby() {
    if (!name) {
      window.localStorage.setItem('playerName', name);
    }
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
  <PlayerList players publicPlayerId on:editName="{editName}" />
  <LockingButton on:lock="{readyLobby}" on:unlock="{unreadyLobby}" isLocked="{ready}" />
</main>

<style>

</style>
