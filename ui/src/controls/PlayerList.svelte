<script>
  export let players;
  export let publicPlayerId;

  import debounce from '../util/debounce';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function editName(event) {
    dispatch('editName', event.target.value);
  }
  const editNameDebounced = debounce(editName, 1000);
</script>

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
