<svelte:head>
{#if stored == "dark"}
<link rel='stylesheet' href='darkmode.css' id="dark-mode-css">
{/if}
</svelte:head>

<script>
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();
var stored = localStorage.getItem("dark-mode-storage");

if (!stored) {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches ) {
    stored = "dark";
  } else {
    stored = "light";
  }
}

function switchTheme() {
    if (stored == "light") {
        stored = "dark";
    } else {
        stored = "light";
      }
}
</script>

<button on:click="{switchTheme}">
<img src="img/icon_darkmode.svg" alt="dark mode toggle" class="no-responsive no-border"/>
</button>

