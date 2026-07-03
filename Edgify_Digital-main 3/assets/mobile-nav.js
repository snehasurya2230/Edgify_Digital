/* =========================================================
   Edgify Digital — Mobile navigation
   Injects a hamburger toggle into every page's <header.nav>
   and a slide-down drawer that mirrors .nav-links.
   Vanilla JS, no deps. Active link is preserved.
   ========================================================= */
(function () {
  function init() {
    const navInner = document.querySelector('.nav .nav-inner');
    if (!navInner) return;
    const links = navInner.querySelector('.nav-links');
    if (!links) return;

    // Already injected? bail.
    if (navInner.querySelector('.nav-toggle')) return;

    // Build the toggle button
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'mobile-nav-drawer');
    toggle.innerHTML =
      '<span class="nav-toggle-bar"></span>' +
      '<span class="nav-toggle-bar"></span>' +
      '<span class="nav-toggle-bar"></span>';

    // Place toggle as the last child of nav-inner (after nav-cta)
    navInner.appendChild(toggle);

    // Build the mobile drawer (clones desktop links + adds CTA)
    const drawer = document.createElement('div');
    drawer.className = 'nav-mobile';
    drawer.id = 'mobile-nav-drawer';
    drawer.setAttribute('aria-hidden', 'true');

    const drawerInner = document.createElement('div');
    drawerInner.className = 'nav-mobile-inner';

    // Clone link list
    const linksClone = links.cloneNode(true);
    linksClone.classList.remove('nav-links');
    linksClone.classList.add('nav-mobile-links');
    drawerInner.appendChild(linksClone);

    // CTA inside drawer (mirrors the desktop primary CTA)
    const ctaSrc = navInner.querySelector('.nav-cta .btn');
    if (ctaSrc) {
      const ctaWrap = document.createElement('div');
      ctaWrap.className = 'nav-mobile-cta';
      const ctaClone = ctaSrc.cloneNode(true);
      ctaWrap.appendChild(ctaClone);
      drawerInner.appendChild(ctaWrap);
    }

    drawer.appendChild(drawerInner);

    // Mount drawer right after the header so it sits below sticky nav
    const header = document.querySelector('header.nav');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(drawer, header.nextSibling);
    } else {
      document.body.insertBefore(drawer, document.body.firstChild);
    }

    function setOpen(open) {
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.documentElement.classList.toggle('nav-locked', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(!drawer.classList.contains('is-open'));
    });

    // Close on link click
    drawer.addEventListener('click', function (e) {
      const t = e.target;
      if (t && (t.tagName === 'A' || (t.closest && t.closest('a')))) {
        setOpen(false);
      }
    });

    // Close on Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close if user resizes back to desktop
    let lastWasMobile = window.matchMedia('(max-width: 820px)').matches;
    window.addEventListener('resize', function () {
      const isMobile = window.matchMedia('(max-width: 820px)').matches;
      if (lastWasMobile && !isMobile) setOpen(false);
      lastWasMobile = isMobile;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
