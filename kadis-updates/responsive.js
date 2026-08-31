/* ============================================================
   KADIS — Responsive & Mobile Nav Fix
   Drop this ONE file's <script> tag into any page (after the
   page's own inline <style>/<script> tags, same pattern as
   cart.js / Quickview.js) and it:

   1. Adds a working hamburger menu on mobile. The site's own
      CSS hides .nav-links at max-width:900px with no way to
      get them back — this restores access via a slide-down
      panel, built from whatever links already exist in
      .nav-links, so it needs no per-page editing.

   2. Adds real small-phone breakpoints (≤600px / ≤420px).
      The site's smallest existing breakpoint is ~900-980px
      ("tablet"), so actual phones (~360-430px wide) were still
      rendering 2-column grids, 90px section padding, and 32px
      side padding meant for desktop. This tightens things up
      for real phone widths.

   3. Prevents the floating decorative "chip" icons in the hero
      from causing horizontal overflow/scrollbars on narrow
      screens.

   4. Protects the logo and gives the header room on mobile —
      the hamburger + icon buttons + "Request a Solution" pill
      were all competing for space with nothing stopping the
      logo from being squeezed. The pill is hidden under 480px
      (it's duplicated as a full-width CTA further down every
      page) and cloned into the mobile drawer instead, so the
      action isn't lost, just relocated.
   ============================================================ */

(function () {
  'use strict';

  // ---------- 1. Inject responsive CSS ----------
  const style = document.createElement('style');
  style.textContent = `
    /* ---- Hamburger button ---- */
    .kadis-hamburger {
      display: none;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.13);
      background: transparent;
      color: #EDEEEC;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      order: -1;
    }
    .kadis-hamburger .bar {
      display: block;
      width: 18px;
      height: 2px;
      background: currentColor;
      position: relative;
      transition: transform .2s ease, opacity .2s ease;
    }
    .kadis-hamburger .bar::before,
    .kadis-hamburger .bar::after {
      content: '';
      position: absolute;
      left: 0;
      width: 18px;
      height: 2px;
      background: currentColor;
      transition: transform .2s ease, top .2s ease;
    }
    .kadis-hamburger .bar::before { top: -6px; }
    .kadis-hamburger .bar::after { top: 6px; }
    .kadis-hamburger.is-open .bar { background: transparent; }
    .kadis-hamburger.is-open .bar::before { top: 0; transform: rotate(45deg); }
    .kadis-hamburger.is-open .bar::after { top: 0; transform: rotate(-45deg); }

    /* ---- Mobile nav drawer (built from the page's own .nav-links) ---- */
    .kadis-mobile-drawer {
      display: none;
      flex-direction: column;
      background: #131519;
      border-top: 1px solid rgba(255,255,255,0.09);
      border-bottom: 1px solid rgba(255,255,255,0.09);
    }
    .kadis-mobile-drawer.is-open { display: flex; }
    .kadis-mobile-drawer a {
      padding: 15px 20px;
      font-size: 15px;
      font-weight: 600;
      color: #EDEEEC;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .kadis-mobile-drawer a:last-child { border-bottom: none; }
    .kadis-mobile-drawer a:active { background: rgba(217,119,46,0.08); }
    /* the cloned "Request a Solution" entry gets a little visual weight
       so it still reads as the primary action, just inside the drawer */
    .kadis-mobile-drawer a.kadis-drawer-cta {
      color: #D9772E;
    }

    @media (max-width: 900px) {
      .kadis-hamburger { display: inline-flex; }

      /* Give the header room instead of letting flexbox squash the logo:
         hamburger, icon buttons and the logo all keep their natural size,
         nothing shrinks them. */
      .nav-inner { flex-wrap: nowrap; }
      .logo { flex-shrink: 0; min-width: 0; }
      .nav-actions { flex-shrink: 0; gap: 8px; }
    }

    @media (max-width: 480px) {
      /* The header CTA pill is what's actually crowding the logo out —
         it's duplicated as a full-width button in the hero and again
         near the page footer, so it's safe to drop from the cramped
         header row. It's cloned into the mobile drawer below instead,
         so the action itself isn't lost. */
      .nav-actions .btn-primary { display: none; }
    }

    /* ---- Real phone breakpoints (site's own CSS stops at ~900-980px) ----
       IMPORTANT: these are written as separate padding-left/right vs
       padding-top/bottom (never the "padding: a b c" shorthand) on
       purpose. Several elements on this site carry BOTH the .wrap class
       and another class (e.g. <header class="wrap hero">, and multiple
       <section class="... wrap">). Shorthand "padding" rules on two
       classes that land on the same element silently overwrite each
       other's left/right or top/bottom values depending on specificity
       and source order — which is what was pinning hero/section content
       flush against the left edge with no horizontal breathing room,
       and zeroing out vertical section spacing. Longhand properties on
       different axes can never collide like that. */
    @media (max-width: 600px) {
      .wrap { padding-left: 18px !important; padding-right: 18px !important; }
      section { padding-top: 48px !important; padding-bottom: 48px !important; }
      .hero { padding-top: 32px !important; padding-bottom: 36px !important; }
      .cat-grid,
      .prod-grid { grid-template-columns: 1fr !important; }
      .foot-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
      .stats-band { grid-template-columns: 1fr 1fr !important; }
      .serv-grid { grid-template-columns: 1fr !important; }
      .blog-grid { grid-template-columns: 1fr !important; }
      .hero h1 { font-size: 30px !important; }
      .sec-head h2 { font-size: 24px !important; }
      .cta-band { padding-top: 36px !important; padding-bottom: 36px !important; padding-left: 22px !important; padding-right: 22px !important; }
      .foot-promo .wrap,
      .trust .wrap { flex-direction: column; align-items: flex-start !important; }
    }

    @media (max-width: 420px) {
      .hero-stats { gap: 20px !important; }
      .hero-cta { flex-direction: column; align-items: stretch !important; }
      .hero-cta a { justify-content: center; text-align: center; }
    }

    /* ---- Stop hero decoration from causing horizontal overflow ---- */
    body { overflow-x: hidden; }
    @media (max-width: 640px) {
      .hero-visual { transform: scale(0.82); transform-origin: center; }
    }
  `;
  document.head.appendChild(style);

  // ---------- 2. Build the hamburger + drawer from the existing nav ----------
  function init() {
    const navInner = document.querySelector('nav .nav-inner, .nav-inner');
    const navLinksSrc = document.querySelector('.nav-links');
    const navEl = document.querySelector('nav');
    if (!navInner || !navLinksSrc || !navEl) return; // page has no standard nav — skip safely

    // avoid double-injecting if this script somehow runs twice
    if (navEl.dataset.kadisResponsiveBound) return;
    navEl.dataset.kadisResponsiveBound = 'true';

    // hamburger button, placed at the start of nav-actions (or nav-inner as fallback)
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kadis-hamburger';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = '<span class="bar"></span>';

    const actions = navInner.querySelector('.nav-actions');
    if (actions) actions.insertBefore(btn, actions.firstChild);
    else navInner.appendChild(btn);

    // drawer with cloned links, inserted right after the whole <nav>
    const drawer = document.createElement('div');
    drawer.className = 'kadis-mobile-drawer';
    Array.from(navLinksSrc.querySelectorAll('a')).forEach(a => {
      const clone = a.cloneNode(true);
      drawer.appendChild(clone);
    });
    // the header's "Request a Solution" pill is hidden under 480px (see CSS
    // above) so it doesn't crowd the logo — clone it into the drawer too,
    // so the action stays reachable on the smallest screens instead of
    // just disappearing.
    const headerCta = actions && actions.querySelector('.btn-primary');
    if (headerCta) {
      const ctaClone = headerCta.cloneNode(true);
      ctaClone.classList.add('kadis-drawer-cta');
      drawer.appendChild(ctaClone);
    }
    navEl.parentNode.insertBefore(drawer, navEl.nextSibling);

    function closeDrawer() {
      drawer.classList.remove('is-open');
      btn.classList.remove('is-open');
      btn.setAttribute('aria-label', 'Open menu');
    }
    function toggleDrawer() {
      const nowOpen = drawer.classList.toggle('is-open');
      btn.classList.toggle('is-open', nowOpen);
      btn.setAttribute('aria-label', nowOpen ? 'Close menu' : 'Open menu');
    }

    btn.addEventListener('click', toggleDrawer);
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeDrawer();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeDrawer();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();