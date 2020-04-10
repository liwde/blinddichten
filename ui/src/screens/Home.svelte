<script>
  export let createDisabled = true;
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { getLastGames } from '../util/lastGames';

  const lastGames = getLastGames(4);

  function padZeros(num) {
    return ('' + num).padStart(2, '0');
  }

  function formatDate(date) {
    return `${padZeros(date.getDate())}.${padZeros(date.getMonth() + 1)}.${date.getFullYear()} ${padZeros(date.getHours())}:${padZeros(date.getMinutes())}`;
  }

  const dispatch = createEventDispatcher();
</script>

<main in:fly="{{x: -500}}" out:fly="{{x: -500}}">
  <div>
    <h1><img src="img/logo.svg" alt="blinddichten" class="no-responsive no-border" /></h1>
    <p>
      <em>blinddichten</em> ist ein lustiges Partyspiel für Menschen, die kreativ veranlagt sind oder Poetry Slams ganz fetzig finden.
      Im Laufe eines Spiels schreiben alle Spieler gemeinsam pro Teilnehmer ein Gedicht – Zeile für Zeile:
    </p>
    <ol class="larger">
      <li><span>Jeder Spieler erhält einen Zettel und schreibt darauf den <em>Titel</em> für das Gedichts sowie eine <em>erste Zeile</em>.</span></li>
      <li><span>Danach werden die Zettel im Kreis einen Platz <em>weitergereicht</em>.</span></li>
      <li><span>Der nächste Spieler ergänzt einen <em>reimenden zweiten</em> sowie einen eigenständigen <em>dritten Vers</em>.</span></li>
      <li><span>Der Zettel wird so <em>gefaltet</em>, dass <em>nur der Titel und der letzte Vers</em> sichtbar sind.</span></li>
      <li><span>Das Weitergeben wird wiederholt, bis der jeder Zettel nach einer oder mehreren Runden wieder <em>beim Ursprungsautor</em> angekommen ist, der die <em>Schlusszeile reimt</em>.</span></li>
      <li><span><em>Tragt</em> euch die fertigen Gedichte <em>gegenseitig vor</em>!</span></li>
    </ol>
    <p>
      Mit dieser Website ist es möglich, das Spiel digital zum Beispiel während einer Videokonferenz mit Freunden zu spielen. Viel Spaß dabei!
    </p>
  </div>
  <div class="row flex-center flex-middle">
    <div class="sm-12 md-6 lg-6 col center">
      <button on:click="{() => dispatch('createGame')}" class="btn-primary" enabled="{!createDisabled}">Neues Spiel starten</button>
    </div>
    <div class="sm-12 md-6 lg-6 col">
      <h4>Letzte 4 Spiele</h4>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Datum</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {#each lastGames as game, idx}
            <tr class="linked">
              <td><a class="rowlink" href="#{game.gameId}">{idx + 1}</a></td>
              <td>{formatDate(game.date)}<td>
              <td>{#if game.finished}<span class="badge success">fertig</span>{:else}<span class="badge warning">läuft…</span>{/if}</td>
            </tr>
          {:else}
            <tr>
              <td colspan="3"><em>Noch kein Spiel gespielt</em></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</main>

<style>
  main {
    max-width: 800px;
  }

  div.center {
    text-align: center;
  }

  h1 {
    color: #74c017;
    font-size: 6em;
  }

  h1 img {
    width: 100%;
  }

  @media(min-width: 600px) {
    ol.larger li {
      margin: 0 0 0 1em;
      font-size: 40px;
      font-weight: bold;
      line-height: 1;
      margin-bottom: .2em;
    }
    ol.larger li span {
      font-size: 25px;
      font-weight: normal;
    }
  }

  table {
    position: relative;
  }

  .rowlink::before {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    width: 100%;
    height: 1.5em; /* don't forget to set the height! */
  }

  a.rowlink {
    background-image: none;
  }

  tr.linked:hover {
    opacity: .5;
  }
</style>
