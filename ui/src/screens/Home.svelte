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
      Irgendein Willkommenstext.
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh.
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
