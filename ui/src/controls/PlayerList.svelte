<script>
  export let players;
  export let publicPlayerId;

  import debounce from '../util/debounce';
  import { createEventDispatcher } from 'svelte';
  import LoadingIndicator from './LoadingIndicator.svelte';

  const dispatch = createEventDispatcher();

  let lastName;

  function editName(event) {
    if (lastName !== event.target.value) {
      lastName = event.target.value;
      dispatch('editName', event.target.value);
    }
  }
  const editNameDebounced = debounce(editName, 1000);
</script>

<players>
  <h2>Spieler</h2>
  {#if players && players.length > 0}
    <ol>
      {#each players as player}
        <li class:ready="{player.ready}" class:me="{player.publicPlayerId === publicPlayerId}" class:owner="{player.isOwner}">
          {#if player.publicPlayerId === publicPlayerId && !player.ready}
            <input type="text" value="{player.name}" on:keyup="{editNameDebounced}" on:change="{editName}" />
          {:else}
            <span class="align">
              {player.name}
              {#if player.ready}
                <span class="badge success">fertig</span>
              {/if}
            </span>
          {/if}
        </li>
      {/each}
    </ol>
  {:else}
    <LoadingIndicator />
  {/if}
</players>

<style>
  players {
    min-width: 200px;
  }
  ol {
    max-width: 350px;
  }
  input {
    display: inline-block;
    vertical-align: middle;
    width: 100%;
  }
  li.owner:not(.me)::after {
    content: " 👑"
  }
</style>
