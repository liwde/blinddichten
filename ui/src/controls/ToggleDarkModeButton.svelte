<script>
  let theme = localStorage.getItem("theme");

  if (!theme) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches ) {
      theme = "dark";
    } else {
      theme = "light";
    }
  }

  function switchTheme() {
    if (theme === "light") {
      theme = "dark";
    } else {
      theme = "light";
    }
    localStorage.setItem("theme", theme);
  }
</script>

<svelte:head>
  {#if theme === "dark"}
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
