<script>
  export let players;
  export let publicPlayerId;

  import LoadingIndicator from './LoadingIndicator.svelte';
  import { fade } from 'svelte/transition';
</script>

<players>
  <h2>Spieler</h2>
  {#if players && players.length > 0}
    <ol>
      {#each players as player}
        <li class:ready="{player.ready}" class:me="{player.publicPlayerId === publicPlayerId}" class:owner="{player.isOwner}">
            {player.name}
            {#if player.isOwner}
              👑
            {/if}
            {#if player.ready}
              <span class="badge success" transition:fade>ready</span>
            {/if}
        </li>
      {/each}
    </ol>
  {:else}
    <LoadingIndicator />
  {/if}
</players>

<style>
</style>
