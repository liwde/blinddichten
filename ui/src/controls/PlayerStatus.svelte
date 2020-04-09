<script>
  export let players;
  export let publicPlayerId;

  import LoadingIndicator from './LoadingIndicator.svelte';
</script>

<players>
  <h2>Spieler</h2>
  {#if players && players.length > 0}
    <ol>
      {#each players as player}
        <li class:ready="{player.ready}" class:me="{player.publicPlayerId === publicPlayerId}" class:owner="{player.isOwner}">
            {player.name}
            {#if player.ready}
              <span class="badge success">ready</span>
            {/if}
        </li>
      {/each}
    </ol>
  {:else}
    <LoadingIndicator />
  {/if}
</players>

<style>
  li.owner::after {
    content: " 👑"
  }
</style>
