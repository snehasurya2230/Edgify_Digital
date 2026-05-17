/* =========================================================
   Edgify Digital — Tweaks panel
   Vanilla JS. Persists choices in localStorage and applies
   them to <html> data-* attributes on every page load.
   Implements the host edit-mode protocol.
   ========================================================= */
(function () {
  const STORE_KEY = 'edgify.tweaks.v2';
  const DEFAULTS = {
    variation: 'editorial', // sharp | editorial
    layout:    'split',     // split | centered | list
    typeset:   'auto'       // auto | grotesk | serif | condensed
  };

  // ----- state -----
  let state = Object.assign({}, DEFAULTS);
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved) Object.assign(state, saved);
  } catch (e) {}

  function applyState() {
    const root = document.documentElement;
    root.setAttribute('data-variation', state.variation);

    // typeset 'auto' = inherit from variation default; clear the override
    if (state.typeset && state.typeset !== 'auto') {
      root.setAttribute('data-typeset', state.typeset);
    } else {
      root.removeAttribute('data-typeset');
    }

    // hero layout (only affects pages that have a hero)
    document.querySelectorAll('.hero').forEach(h => {
      h.setAttribute('data-layout', state.layout);
    });

    // Swap nav logo per variation (light bg → navy text, dark bg → white text)
    // hero-orbit always uses the dark version (the orbit panel is always dark)
    const darkLogo  = 'assets/edgify-logo-dark.png';
    const lightLogo = 'assets/edgify-logo-light.png';
    document.querySelectorAll('.brand img').forEach(img => {
      img.src = state.variation === 'editorial' ? lightLogo : darkLogo;
    });
    document.querySelectorAll('.hero-orbit-mark img').forEach(img => {
      img.src = darkLogo;
    });
  }

  function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  function set(key, value) {
    state[key] = value;
    applyState();
    save();
    renderButtons();
  }

  // ----- apply ASAP so there's no flash -----
  applyState();
  document.addEventListener('DOMContentLoaded', applyState);

  // ----- panel UI -----
  let panel = null;
  function buildPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'tweaks-panel';
    panel.innerHTML = `
      <div class="tweaks-head">
        <h6>Tweaks</h6>
        <button class="tweaks-close" aria-label="Close tweaks">✕</button>
      </div>
      <div class="tweaks-body">
        <div class="tweak-section">
          <h6>Design variation</h6>
          <div class="tweak-options" data-key="variation">
            <button class="tweak-opt" data-value="sharp">Sharp · dark</button>
            <button class="tweak-opt" data-value="editorial">Editorial · cream</button>
          </div>
        </div>
        <div class="tweak-section">
          <h6>Hero layout</h6>
          <div class="tweak-options cols-3" data-key="layout">
            <button class="tweak-opt" data-value="split">Split</button>
            <button class="tweak-opt" data-value="centered">Centered</button>
            <button class="tweak-opt" data-value="list">List</button>
          </div>
        </div>
        <div class="tweak-section">
          <h6>Display type</h6>
          <div class="tweak-options" data-key="typeset">
            <button class="tweak-opt" data-value="auto">Auto</button>
            <button class="tweak-opt" data-value="grotesk">Grotesk</button>
            <button class="tweak-opt" data-value="serif">Serif</button>
            <button class="tweak-opt" data-value="condensed">Condensed</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector('.tweaks-close').addEventListener('click', () => {
      hidePanel();
      try { window.parent.postMessage({type:'__edit_mode_dismissed'}, '*'); } catch (e) {}
    });
    panel.querySelectorAll('.tweak-options').forEach(group => {
      const key = group.getAttribute('data-key');
      group.querySelectorAll('.tweak-opt').forEach(btn => {
        btn.addEventListener('click', () => set(key, btn.getAttribute('data-value')));
      });
    });
    return panel;
  }
  function renderButtons() {
    if (!panel) return;
    panel.querySelectorAll('.tweak-options').forEach(group => {
      const key = group.getAttribute('data-key');
      group.querySelectorAll('.tweak-opt').forEach(btn => {
        btn.classList.toggle('is-on', btn.getAttribute('data-value') === state[key]);
      });
    });
  }
  function showPanel() { buildPanel(); panel.classList.add('is-open'); renderButtons(); }
  function hidePanel() { if (panel) panel.classList.remove('is-open'); }

  // ----- edit-mode protocol -----
  window.addEventListener('message', (e) => {
    const t = e.data && e.data.type;
    if (t === '__activate_edit_mode')   showPanel();
    if (t === '__deactivate_edit_mode') hidePanel();
  });

  // announce availability AFTER listener is registered
  try { window.parent.postMessage({type:'__edit_mode_available'}, '*'); } catch (e) {}
})();
