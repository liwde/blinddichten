<script>
  let stored = localStorage.getItem("dark-mode-storage");

  if (!stored) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches ) {
      stored = "dark";
    } else {
      stored = "light";
    }
  }

  function switchTheme() {
    if (stored === "light") {
      stored = "dark";
    } else {
      stored = "light";
    }
  }
</script>

<svelte:head>
  {#if stored === "dark"}
    <link rel='stylesheet' href='darkmode.css' id="dark-mode-css">
  {/if}
</svelte:head>

<img src="img/icon_darkmode.svg" alt="dark mode toggle" class="no-responsive no-border" on:click="{switchTheme}"/>

<style>
  img:hover {
    opacity: 0.5;
  }
  img {
    height: 30px;
    vertical-align: middle;
  }
</style>
