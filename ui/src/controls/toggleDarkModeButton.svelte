<script>
var darkTheme = document.getElementById("dark-mode-css");
var stored = localStorage.getItem("dark-mode-storage")

if (stored) {
  setTheme(stored)
} else {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches ) {
  localStorage.setItem("dark-mode-storage", "dark");
  }
}

function switchTheme() {
    console.log("dark mode clicked")
    if (darkTheme.disabled) {
        setTheme("dark");
    } else {
        setTheme("light");
      }
}

function setTheme(mode) {
  localStorage.setItem("dark-mode-storage", mode);
    if (mode === "dark") {
        darkTheme.disabled = false;
    } else if (mode === "light") {
        darkTheme.disabled = true;
    }
}

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();
</script>

<button on:click="{() => dispatch(switchTheme)}">
<img src="img/icon_darkmode.svg" alt="dark mode toggle" class="no-responsive no-border"/>
</button>
