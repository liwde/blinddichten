<script>
  export let value;
  export let isLocked;
</script>

{#if isLocked}
  {value}
{:else}
  <input type="text" bind:value on:keyup on:change />
{/if}
