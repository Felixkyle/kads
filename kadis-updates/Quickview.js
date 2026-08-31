/* ============================================================
   KADIS Quick View — universal product preview modal
   Drop this ONE file's <script> tag into any page that has
   .prod-card product cards, and it just works — no other
   HTML or CSS needs to be copy-pasted per page.

   Usage: add this before </body>:
     <script src="quickview.js"></script>
   ============================================================ */

(function () {
  'use strict';

  // ---------- 0. Clear out any old/leftover popup markup ----------
  // If a manual modal was pasted into this page before (from earlier drafts,
  // copy-pasted card markup, a stray heart/fav-btn used as "cancel", etc.),
  // remove it so there's only ever ONE modal on the page: this script's own,
  // with a guaranteed-working close button.
  document.querySelectorAll(
    '#quickViewOverlay, #qvOverlay, .qv-overlay, .quick-view-overlay, .product-modal, .product-overlay'
  ).forEach(el => el.remove());

  // ---------- 1. Inject modal CSS once ----------
  const style = document.createElement('style');
  style.textContent = `
    .qv-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(8px);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .qv-overlay.active { display: flex; }
    .qv-modal {
      background: #131519;
      border: 1px solid rgba(255,255,255,0.1);
      color: #EDEEEC;
      padding: 26px;
      border-radius: 16px;
      max-width: 420px;
      width: 100%;
      position: relative;
      text-align: center;
      max-height: 90vh;
      overflow-y: auto;
      font-family: 'Manrope', sans-serif;
    }
    .qv-close {
      position: absolute;
      top: 12px;
      right: 14px;
      z-index: 10000;
      background: rgba(255,255,255,0.08);
      border: none;
      color: #EDEEEC;
      font-size: 22px;
      font-family: Arial, sans-serif; /* guarantees a plain × glyph, not an icon font */
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      line-height: 1;
      pointer-events: auto;
    }
    .qv-close:hover { background: rgba(255,255,255,0.18); }
    .qv-img-wrap {
      width: 100%;
      height: 220px;
      background: linear-gradient(150deg,#20232A,#1A1D22);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .qv-img-wrap img { width: 100%; height: 100%; object-fit: contain; padding: 16px; }
    .qv-img-wrap svg { width: 90px; height: 90px; }
    .qv-cat {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      color: #E8A15E;
      text-transform: uppercase;
      letter-spacing: .06em;
      display: block;
      margin-bottom: 8px;
    }
    .qv-name { font-size: 19px; font-weight: 800; margin-bottom: 10px; font-family: 'Sora', sans-serif; }
    .qv-desc { font-size: 13.5px; color: #9A9FA8; line-height: 1.6; margin-bottom: 16px; }
    .qv-price-row { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 18px; }
    .qv-price-row b { font-size: 20px; color: #E8A15E; font-family: 'Sora', sans-serif; }
    .qv-price-row .old { font-size: 13px; color: #5C616A; text-decoration: line-through; }
    .qv-btn-row {
      display: flex;
      gap: 10px;
    }
    .qv-add-btn {
      background: #D9772E;
      color: #0B0C0F;
      border: none;
      font-weight: 700;
      font-size: 14.5px;
      padding: 13px 26px;
      border-radius: 10px;
      cursor: pointer;
      flex: 1;
    }
    .qv-add-btn:hover { background: #E8A15E; }
    .qv-cancel-btn {
      background: transparent;
      color: #EDEEEC;
      border: 1px solid rgba(255,255,255,0.18);
      font-weight: 700;
      font-size: 14.5px;
      padding: 13px 20px;
      border-radius: 10px;
      cursor: pointer;
      flex: 1;
    }
    .qv-cancel-btn:hover { background: rgba(255,255,255,0.08); }
  `;
  document.head.appendChild(style);

  // ---------- 2. Inject modal HTML once ----------
  const overlay = document.createElement('div');
  overlay.id = 'qvOverlay';
  overlay.className = 'qv-overlay';
  overlay.innerHTML = `
    <div class="qv-modal">
      <button class="qv-close" id="qvClose" type="button" aria-label="Close">&times;</button>
      <div class="qv-img-wrap" id="qvImgWrap"></div>
      <span class="qv-cat" id="qvCat"></span>
      <h3 class="qv-name" id="qvName"></h3>
      <p class="qv-desc" id="qvDesc"></p>
      <div class="qv-price-row" id="qvPriceRow"></div>
      <div class="qv-btn-row">
        <button class="qv-cancel-btn" id="qvCancelBtn" type="button">Cancel</button>
        <button class="qv-add-btn" id="qvAddBtn" type="button">Add to Cart</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const els = {
    imgWrap: overlay.querySelector('#qvImgWrap'),
    cat: overlay.querySelector('#qvCat'),
    name: overlay.querySelector('#qvName'),
    desc: overlay.querySelector('#qvDesc'),
    priceRow: overlay.querySelector('#qvPriceRow'),
    addBtn: overlay.querySelector('#qvAddBtn'),
    close: overlay.querySelector('#qvClose'),
    cancel: overlay.querySelector('#qvCancelBtn'),
  };

  let activeCard = null;

  function openQuickView(card) {
    activeCard = card;

    // Image: works across .prod-img, .prod-media (gadgets.html), and
    // .ql-img (the "Quick Look" scroller on index.html).
    const mediaWrap = card.querySelector('.prod-img, .prod-media, .ql-img');
    els.imgWrap.innerHTML = mediaWrap ? mediaWrap.innerHTML : '';
    // Strip out any tag/favourite/close-like elements that got copied along
    // with the media, so the ONLY button visible in the popup is the real
    // qv-close (×) button above — never a heart, tag, or leftover icon.
    els.imgWrap.querySelectorAll(
      '.prod-tag, .fav-btn, [class*="fav"], [class*="close"], [class*="cancel"], .add-btn'
    ).forEach(n => n.remove());

    // Category label: .prod-cat on prod-cards, first <span> in .ql-body on
    // quick-look cards.
    els.cat.textContent =
      card.querySelector('.prod-cat')?.textContent.trim() ||
      card.querySelector('.ql-body > span:first-child')?.textContent.trim() ||
      '';

    // Name: h5 on prod-cards, h6 on quick-look cards.
    els.name.textContent = card.querySelector('h5, h6')?.textContent.trim() || 'Product';

    els.desc.textContent = card.querySelector('.prod-desc')?.textContent.trim() || '';

    // Price: .prod-price on prod-cards; .ql-old/.ql-price pair on quick-look
    // cards (there's no wrapping element there, so build the row manually).
    const priceBlock = card.querySelector('.prod-price');
    if (priceBlock) {
      els.priceRow.innerHTML = priceBlock.querySelector('div')?.innerHTML || '';
    } else {
      const oldPrice = card.querySelector('.ql-old');
      const curPrice = card.querySelector('.ql-price');
      els.priceRow.innerHTML = curPrice
        ? `${oldPrice ? `<span class="old">${oldPrice.textContent}</span>` : ''}<b>${curPrice.textContent}</b>`
        : '';
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // stop background scroll on mobile while popup is open
  }

  function closeQuickView() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    activeCard = null;
  }

  els.close.addEventListener('click', closeQuickView);
  els.cancel.addEventListener('click', closeQuickView);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeQuickView(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeQuickView(); });

  // "Add to cart" inside the modal re-triggers the card's own + button,
  // so it plugs into whatever cart.js logic each page already has.
  els.addBtn.addEventListener('click', () => {
    if (!activeCard) return;
    const realAddBtn = activeCard.querySelector('.add-btn');
    if (realAddBtn) realAddBtn.click();
    closeQuickView();
  });

  // ---------- 3. Wire up every .prod-card on the page ----------
  function attachQuickView(card) {
    if (card.dataset.qvBound) return; // avoid double-binding
    card.dataset.qvBound = 'true';
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.add-btn, .fav-btn')) return; // let those buttons work normally
      openQuickView(card);
    });
  }

  document.querySelectorAll('.prod-card, .ql-card').forEach(attachQuickView);

  // If cards are added dynamically later (e.g. after a filter re-render),
  // this catches new ones automatically too.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.matches?.('.prod-card, .ql-card')) attachQuickView(node);
        node.querySelectorAll?.('.prod-card, .ql-card').forEach(attachQuickView);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();