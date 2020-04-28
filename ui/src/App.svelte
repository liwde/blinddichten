<script>
  export let wsHandler;
  export let matomoUrl;
  export let matomoSiteId;

  import Game from './Game.svelte';
  import Matomo from './controls/Matomo.svelte';
  import Home from './screens/Home.svelte';
  import { onDestroy } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import errorList from './util/errorList';
  import { removeGame } from './util/lastGames';
  import toggleDarkModeButton from './controls/toggleDarkModeButton.svelte';

  let gameId, privatePlayerId, publicPlayerId, gamePhase;
  let waitingForGameCreation = false;
  let errors = [];

  function createGame() {
    waitingForGameCreation = true;
    wsHandler.sendMessage({ type: 'createGame' });
  }

  function gameEntered(msg) {
    gameId = msg.gameId;
    privatePlayerId = msg.privatePlayerId;
    publicPlayerId = msg.publicPlayerId;
    window.localStorage.setItem('game_' + gameId, JSON.stringify({ publicPlayerId, privatePlayerId }));
    if (waitingForGameCreation) {
      location.hash = gameId;
    }
    const lastPlayerName = window.localStorage.getItem('playerName');
    if (lastPlayerName && lastPlayerName !== 'undefined') {
      wsHandler.sendMessage({ type: 'changeLobby', name: lastPlayerName });
    }
    waitingForGameCreation = false;
    gamePhase = 'lobby';
  }
  wsHandler.on('gameEntered', gameEntered);

  function errorOccurred(msg) {
    const code = msg.msg || msg.detail;
    if (!errorList[code].recoverable) {
      removeGame(gameId);
      gameId = null;
      location.hash = '';
    } else {
        wsHandler.sendMessage({ type: 'recoverSession', gameId, privatePlayerId, publicPlayerId });
    }
    if (!errorList[code].silent) {
      errors = [
        {
          code,
          text: errorList[code].text,
          id: (new Date()).getTime()
        },
      ...errors];
    }
  }
  wsHandler.on('errorOccurred', errorOccurred);

  function dismissError(id) {
    errors = errors.filter(e => e.id !== id);
  }

  function hashChanged() {
    if (location.hash && location.hash.length > 1 && gameId !== location.hash.substr(1)) {
      gameId = location.hash.substr(1);
      const existingGame = window.localStorage.getItem('game_' + gameId);
      if (existingGame) {
        let existingGameParsed = JSON.parse(existingGame);
        privatePlayerId = existingGameParsed.privatePlayerId;
        publicPlayerId = existingGameParsed.publicPlayerId;
        wsHandler.sendMessage({ type: 'recoverSession', gameId, privatePlayerId, publicPlayerId });
      } else {
        wsHandler.sendMessage({ type: 'enterGame', gameId });
      }
    }
  }

  window.addEventListener('hashchange', hashChanged, false);

  onDestroy(() => {
    wsHandler.off('gameEntered', gameEntered);
    wsHandler.off('errorOccurred', errorOccurred);
    wsHandler.close()
  });

  hashChanged();
</script>

<nav class="border fixed split-nav">
  <div class="nav-brand">
    <h3><a href="/"><img src="img/logo_header.svg" height="40" alt="blinddichten" class="no-responsive no-border" /></a></h3>
  </div>
  <div class="collapsible">
    <input id="collapsible1" type="checkbox" name="collapsible1">
    <button>
    <label for="collapsible1">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
      </label>
    </button>
    <div class="collapsible-body">
      <ul class="inline">
        <li><a href="https://blog.liwde.de" target="_blank">liwde</a></li>
        <li><a href="https://www.github.com/liwde/blinddichten" target="_blank">GitHub</a></li>
        <li><toggleDarkModeButton/></li>
      </ul>
    </div>
  </div>
</nav>
<app>
  <messages>
    <Matomo matomoUrl="{matomoUrl}" matomoSiteId="{matomoSiteId}" />
    {#if errors && errors.length > 0}
      <errors>
        {#each errors as error (error.id)}
          <div class="alert alert-danger dismissible" in:fly="{{y: -500}}" out:fade>
            {error.text}
            <label class="btn-close" on:click="{() => dismissError(error.id)}">X</label>
          </div>
        {/each}
      </errors>
    {/if}
  </messages>
  {#if gameId}
    <Game wsHandler="{wsHandler}" gameId="{gameId}" publicPlayerId="{publicPlayerId}" bind:gamePhase on:errorOccurred="{errorOccurred}" />
  {:else}
    <Home on:createGame="{createGame}" createDisabled="{waitingForGameCreation}" />
  {/if}
</app>

<style>
  app {
    display: block;
    padding: 1em;
  }
  messages {
    display: block;
    margin: 4em auto -1em auto;
    max-width: 800px;
  }
  nav .nav-brand h3 a img {
    vertical-align: middle;
    height: 40px;
  }
  nav .nav-brand h3 a:hover img {
    opacity: 0.5;
  }
</style>
