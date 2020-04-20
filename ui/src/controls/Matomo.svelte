<script>
  export let matomoUrl;
  export let matomoSiteId;

  let trackingAllowed = window.localStorage.getItem('matomo_enabled');

  if ((navigator.doNotTrack === '0') || (trackingAllowed === 'yes' && navigator.doNotTrack !== '1')) {
    addMatomo();
  }

  function allowTracking() {
    window.localStorage.setItem('matomo_enabled', 'yes');
    trackingAllowed = 'true';
    addMatomo();
  }

  function addMatomo() {
    var _paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      _paq.push(['setTrackerUrl', matomoUrl+'matomo.php']);
      _paq.push(['setSiteId', matomoSiteId]);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.type='text/javascript'; g.async=true; g.defer=true; g.src=matomoUrl+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
  }
</script>

{#if (!navigator.doNotTrack || (navigator.doNotTrack === "unspecified")) && !trackingAllowed }
  <input class="alert-state" id="alert-matomo" type="checkbox">
  <div class="alert alert-secondary dismissible">
    <div>
    <p>Um eine Übersicht über die Nutzung des Spiels zu erhalten, werden Seitenaufrufe – mit deiner Erlaubnis – pseudonymisiert mittels <a href="https://matomo.org/" target="_blank">Matomo</a> gespeichert.</p>
    <p>Du kannst jederzeit über die Do-Not-Track-Einstellung deines Browsers widersprechen.</p>
    </div>
    <button on:click="{allowTracking}">Einverstanden</button>
    <label class="btn-close" for="alert-matomo">X</label>
  </div>
{/if}

<style>
  div.alert p, div.alert button {
    font-size: 17px;
  }
</style>
