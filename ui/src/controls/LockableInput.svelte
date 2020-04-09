<script>
  export let value;
  export let isLocked;
  export let placeholder;
</script>

{#if isLocked}
  <span class="align">{value}</span>
{:else}
  <input type="text" bind:value on:keyup on:change placeholder="{placeholder}" />
{/if}

<style>
  input {
    width: 100%;
  }
</style>
