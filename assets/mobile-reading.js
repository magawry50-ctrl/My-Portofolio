/* MOBILE161–164: original-node phone reading order and one tap-preview owner. */
(function () {
 'use strict';
 window.createMobileReading = function ({ refresh = () => {}, label = key => key } = {}) {
  const phone = matchMedia('(max-width:767px)'), reduced = matchMedia('(prefers-reduced-motion:reduce)'), cleanups = [], moves = [];
  let disposed = false, mobile = false, opened = null;
  const listen = (node, event, fn, options) => { node?.addEventListener(event, fn, options); cleanups.push(() => node?.removeEventListener(event, fn, options)); };
  const remember = (node, target, after = false) => {
   if (!node || !target) return;
   const marker = document.createComment('phone reading original position'); node.before(marker);
   moves.push({ node, marker, target, after });
  };
  const profile = document.querySelector('#about .about-editorial-grid'), portrait = profile?.children[1], title = profile?.querySelector('h2');
  remember(portrait, title, true);
  document.querySelectorAll('#pillars-gallery .view-expanded').forEach(view => remember(view.querySelector('.canvas-mount-point'), view.querySelector('p[data-i18n$="_desc"]'), true));
  const list = document.querySelector('#skills .cap-selector-list'), layout = document.querySelector('#skills .cap-layout');
  list?.querySelectorAll('[data-capability-tab]').forEach(tab => remember(tab, layout.querySelector('[data-capability-panel="' + tab.dataset.capabilityTab + '"]')));
  const specs = [
   { section: document.getElementById('patents'), container: document.getElementById('patents-showcase-container'), card: document.getElementById('patents-preview-card'), row: '.patent-item', image: '.patent-preview-img', title: 'h3 [data-i18n]', index: 'patentIndex' },
   { section: document.getElementById('academic'), container: document.getElementById('awards-showcase-container'), card: document.getElementById('awards-preview-card'), row: '.award-item', image: '.award-preview-img', index: 'awardIndex' }
  ].filter(spec => spec.section && spec.container && spec.card);
  for (const spec of specs) {
   spec.marker = document.createComment('phone preview original position'); spec.card.before(spec.marker);
   spec.style = spec.card.getAttribute('style'); spec.rows = [...spec.container.querySelectorAll(spec.row)]; spec.images = [...spec.card.querySelectorAll(spec.image)];
   spec.imageStyles = spec.images.map(img => img.getAttribute('style')); spec.imageHidden = spec.images.map(img => img.getAttribute('aria-hidden')); spec.buttons = [];
   spec.close = document.createElement('button'); spec.close.type = 'button'; spec.close.className = 'mobile-preview-close';
   spec.close.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'; spec.close.setAttribute('aria-label', label('work_close_modal')); spec.close.addEventListener('click', () => close(true));
  }
  function close(returnFocus = false) {
   if (!opened) return;
   const { spec, button } = opened; opened = null;
   if (spec.card.contains(document.activeElement)) button?.focus({ preventScroll: true });
   spec.card.hidden = true; spec.card.inert = true; delete spec.card.dataset.mobilePreviewOpen;
   spec.buttons.forEach(button => button.setAttribute('aria-expanded', 'false'));
   spec.rows.forEach(row => row.classList.remove('is-active'));
   if (returnFocus) button?.focus({ preventScroll: true });
  }
  function position() {
   if (!opened) return;
   const { spec, button, index } = opened, image = spec.images[index], box = button.getBoundingClientRect();
   const width = Math.min(340, Math.max(0, document.documentElement.clientWidth - 32));
   const ratio = image?.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1.4;
   const topClearance = Math.max(16, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--notch-offset')) || 90);
   const height = Math.min(width / ratio, Math.max(100, innerHeight - topClearance - 32));
   const left = Math.max(16, Math.min(box.left, document.documentElement.clientWidth - width - 16));
   const below = box.bottom + 10, above = box.top - height - 10;
   const top = below + height <= innerHeight - 16 ? below : Math.max(topClearance + 8, Math.min(above, innerHeight - height - 16));
   Object.assign(spec.card.style, { left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px', transform: 'none', opacity: '1' });
  }
  function toggle(spec, button, row) {
   if (opened?.button === button) { close(); return; }
   close();
   const index = Number(row.dataset[spec.index]); opened = { spec, button, index };
   spec.card.hidden = false; spec.card.inert = false; spec.card.dataset.mobilePreviewOpen = 'true';
   spec.buttons.forEach(item => item.setAttribute('aria-expanded', String(item === button)));
   spec.images.forEach((img, i) => { img.style.opacity = i === index ? '1' : '0'; img.style.transform = 'none'; img.style.filter = 'none'; img.setAttribute('aria-hidden', String(i !== index)); });
   row.classList.add('is-active');
   if (spec.index === 'patentIndex') {
    const badge = spec.card.querySelector('#patent-preview-badge'), year = spec.card.querySelector('#patent-preview-year');
    if (badge) badge.textContent = row.querySelector('[data-i18n$="_reg"]')?.textContent || '';
    if (year) year.textContent = row.querySelector('[data-i18n$="_year"]')?.textContent || '';
   }
   spec.close.setAttribute('aria-label', label('work_close_modal')); position();
  }
  function enablePreviews() {
   for (const spec of specs) {
    spec.section.dataset.tapPreview = 'true'; spec.card.dataset.mobilePreview = 'true'; spec.card.hidden = true; spec.card.inert = true;
    document.body.appendChild(spec.card); spec.card.appendChild(spec.close);
    for (const row of spec.rows) {
     const text = spec.title ? row.querySelector(spec.title) : row;
     if (!text) continue;
     const button = document.createElement('button'); button.type = 'button'; button.className = 'mobile-preview-trigger';
     const key = text.getAttribute('data-i18n'); if (key) { text.removeAttribute('data-i18n'); button.setAttribute('data-i18n', key); }
     while (text.firstChild) button.appendChild(text.firstChild); text.appendChild(button);
     button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', spec.card.id);
     button.addEventListener('click', () => toggle(spec, button, row));
     spec.buttons.push(button); button._previewText = text; button._previewKey = key;
    }
   }
  }
  function disablePreviews() {
   close();
   for (const spec of specs) {
    for (const button of spec.buttons) {
     const text = button._previewText; while (button.firstChild) text.insertBefore(button.firstChild, button);
     if (button._previewKey) text.setAttribute('data-i18n', button._previewKey);
     if (button.contains(document.activeElement)) { spec.section.tabIndex = -1; spec.section.focus({ preventScroll: true }); }
     button.remove();
    }
    spec.buttons = []; spec.close.remove(); spec.marker.after(spec.card);
    if (spec.style === null) spec.card.removeAttribute('style'); else spec.card.setAttribute('style', spec.style);
    spec.images.forEach((img, i) => { if (spec.imageStyles[i] === null) img.removeAttribute('style'); else img.setAttribute('style', spec.imageStyles[i]); if (spec.imageHidden[i] === null) img.removeAttribute('aria-hidden'); else img.setAttribute('aria-hidden', spec.imageHidden[i]); });
    spec.card.hidden = true; spec.card.inert = false; delete spec.card.dataset.mobilePreview; delete spec.section.dataset.tapPreview;
   }
  }
  function restoreListSemantics() {
   if (!list || !layout) return;
   const fit = layout.dataset.capabilityMode === 'fit';
   list.setAttribute('role', fit ? 'tablist' : 'navigation');
   if (fit) list.setAttribute('aria-orientation', 'vertical'); else list.removeAttribute('aria-orientation');
  }
  function sync() {
   if (disposed || mobile === phone.matches) return;
   mobile = phone.matches;
   if (mobile) {
    for (const move of moves) { move.after ? move.target.after(move.node) : move.target.prepend(move.node); }
    if (portrait) portrait.dataset.mobilePortrait = 'true';
    document.querySelectorAll('#pillars-gallery .canvas-mount-point').forEach(node => node.dataset.mobileArt = 'true');
    if (profile) profile.dataset.mobileReading = 'true';
    if (layout) layout.dataset.mobileReading = 'true';
    list?.removeAttribute('role'); list?.removeAttribute('aria-orientation');
    enablePreviews();
   } else {
    disablePreviews(); moves.forEach(move => move.marker.after(move.node));
    if (portrait) delete portrait.dataset.mobilePortrait;
    document.querySelectorAll('#pillars-gallery .canvas-mount-point').forEach(node => delete node.dataset.mobileArt);
    if (profile) delete profile.dataset.mobileReading;
    if (layout) delete layout.dataset.mobileReading;
    restoreListSemantics();
   }
   refresh();
  }
  listen(window, 'resize', () => { close(); sync(); }, true);
  listen(window, 'scroll', () => { if (opened) close(); }, { passive: true });
  listen(document, 'pointerdown', event => { if (opened && !opened.spec.card.contains(event.target) && !opened.button.contains(event.target)) close(); });
  listen(document, 'keydown', event => { if (event.key === 'Escape' && opened) { event.preventDefault(); close(true); } });
  listen(document, 'visibilitychange', () => { if (document.hidden) close(); });
  listen(document, 'portfolio:viewchange', () => close()); listen(document, 'portfolio:stackchange', () => { if (opened && opened.spec.section.dataset.stackCovered === 'true') close(); });
  listen(reduced, 'change', () => close()); listen(phone, 'change', sync);
  listen(window, 'pagehide', () => destroy());
  function destroy() {
   if (disposed) return; close(); if (mobile) { mobile = false; disablePreviews(); moves.forEach(move => move.marker.after(move.node)); }
   disposed = true; cleanups.forEach(stop => stop());
   moves.forEach(move => move.marker.remove()); specs.forEach(spec => spec.marker.remove());
   if (portrait) delete portrait.dataset.mobilePortrait; if (profile) delete profile.dataset.mobileReading; if (layout) delete layout.dataset.mobileReading; restoreListSemantics();
   document.querySelectorAll('#pillars-gallery .canvas-mount-point').forEach(node => delete node.dataset.mobileArt);
   refresh();
  }
  sync(); return { refresh: sync, languageChanged() { close(); specs.forEach(spec => spec.close.setAttribute('aria-label', label('work_close_modal'))); }, destroy };
 };
})();
