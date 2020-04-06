<script>
  export let createDisabled = true;
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

<main>
  <h1>Blinddichten</h1>
  <p>Irgendein Willkommenstext</p>
  <button on:click="{() => dispatch('createGame')}" enabled="{!createDisabled}">Neues Spiel starten</button>
</main>

<style>
  main {
    text-align: center;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
