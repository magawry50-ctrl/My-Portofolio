/* NAV165: finite phone paint; the existing navigation owner still owns routes and Settings. */
(function () {
 'use strict';
 window.createPhoneBottomNavigation = function ({ header, buttons, toggle, state, label }) {
  if (!header || !toggle) return null;
  const main = header.querySelector('.notch-main'), items = [...buttons, toggle], motion = matchMedia('(prefers-reduced-motion:reduce)'), cleanups = [];
  const indicator = document.createElement('span'); indicator.className = 'phone-nav-indicator'; indicator.setAttribute('aria-hidden', 'true'); main.appendChild(indicator);
  const icon = document.createElement('span'); icon.className = 'phone-settings-icon material-symbols-outlined'; icon.textContent = 'settings'; icon.setAttribute('aria-hidden', 'true'); toggle.appendChild(icon);
  const caption = document.createElement('span'); caption.className = 'phone-settings-label'; toggle.appendChild(caption);
  let disposed = false, selectionAnimations = [], visibilityAnimation = null, generation = 0, key = '', hidden = false;
  const restoredStyles = new Map(), labelPaint = new Map();
  const listen = (node, event, fn, options) => { node.addEventListener(event, fn, options); cleanups.push(() => node.removeEventListener(event, fn, options)); };
  const blocked = () => state().suspended || header.hidden || document.hidden || document.body.classList.contains('loader-active');
  function clearSelection() {
   generation++; selectionAnimations.forEach(animation => animation.cancel()); selectionAnimations = [];
   restoredStyles.forEach((style, node) => { if (style === null) node.removeAttribute('style'); else node.setAttribute('style', style); }); restoredStyles.clear();
   indicator.replaceChildren(); labelPaint.clear(); delete header.dataset.phoneNavMotion;
  }
  function cancel() { clearSelection(); visibilityAnimation?.cancel(); visibilityAnimation = null; }
  const own = (node, property, value) => { if (!restoredStyles.has(node)) restoredStyles.set(node, node.getAttribute('style')); node.style.setProperty(property, value, 'important'); };
  const glyph = node => node.querySelector('.island-group-icon') || node.querySelector('.phone-settings-icon');
  const text = node => node.querySelector('.rail-phone-label') || node.querySelector('.phone-settings-label');
  const sample = node => {
   if (!node) return null;
   const paint = labelPaint.get(node) || node, style = getComputedStyle(paint), box = paint.getBoundingClientRect();
   return box.width && box.height && style.visibility !== 'hidden' ? { node, box, opacity: Number(style.opacity), font: style.fontFamily, lineHeight: style.lineHeight } : null;
  };
  function syncVisibility() {
   if (disposed) return;
   const phone = innerWidth < 768, focusWithin = header.contains(document.activeElement), settings = state().settingsOpen;
   const cardVisible = ['journey-card', 'business-card'].some(id => { const node = document.getElementById(id); return node && !node.hidden && ['entering', 'shown'].includes(node.dataset.businessPhase); });
   const next = phone && cardVisible && !focusWithin && !settings;
   if (blocked()) { cancel(); hidden = next; header.dataset.phoneNavHidden = String(next); return; }
   header.inert = next; if (next) header.setAttribute('aria-hidden', 'true'); else header.removeAttribute('aria-hidden');
   if (next === hidden) return;
   const computed = getComputedStyle(header), from = { opacity: computed.opacity, translate: computed.translate === 'none' ? '0px 0px' : computed.translate };
   visibilityAnimation?.cancel(); visibilityAnimation = null;
   hidden = next; header.dataset.phoneNavHidden = String(next);
   if (phone && !motion.matches && header.animate) {
    const animation = header.animate([from, { opacity: next ? 0 : 1, translate: next ? '0px calc(100% + 24px)' : '0px 0px' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' }); visibilityAnimation = animation;
    animation.finished.then(() => { if (visibilityAnimation === animation) visibilityAnimation = null; }, () => {});
   }
  }
  function refresh(force = false) {
   if (disposed) return;
   const phone = innerWidth < 768;
   if (!phone) { cancel(); key = ''; hidden = false; delete header.dataset.phoneNavHidden; items.forEach(node => node.classList.remove('phone-selected')); if (!blocked()) { header.inert = false; header.removeAttribute('aria-hidden'); } return; }
   if (blocked()) { cancel(); key = ''; return; }
   const settings = state().settingsOpen, selected = settings ? toggle : buttons.find(button => button.classList.contains('is-active')) || buttons[0];
   const nextKey = [selected.id || 'settings', document.documentElement.lang, document.documentElement.dir, document.documentElement.clientWidth].join('|');
   toggle.setAttribute('aria-label', label('rail_settings_title')); caption.textContent = label('rail_settings_title');
   if (force || key !== nextKey) {
    const previous = indicator.getBoundingClientRect(), painted = previous.width > 0 && key;
    const before = items.map(item => ({ glyph: sample(glyph(item)), text: sample(text(item)) }));
    clearSelection();
    items.forEach(node => node.classList.toggle('phone-selected', node === selected));
    const frame = main.getBoundingClientRect(), target = selected.getBoundingClientRect();
    const x = target.left - frame.left, y = target.top - frame.top;
    Object.assign(indicator.style, { left: x + 'px', top: y + 'px', width: target.width + 'px', height: target.height + 'px' });
    key = nextKey;
    if (painted && !motion.matches && indicator.animate) {
     const token = generation, options = { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' }, clock = document.timeline?.currentTime;
     header.dataset.phoneNavMotion = 'selecting';
     const animate = (node, frames) => { const animation = node.animate(frames, options); if (Number.isFinite(clock)) animation.startTime = clock; animation.finished.catch(() => {}); selectionAnimations.push(animation); };
     const fromOrigin = { left: previous.left, top: previous.top }, toOrigin = { left: target.left, top: target.top };
     animate(indicator, [{ left: previous.left - frame.left + 'px', top: previous.top - frame.top + 'px', width: previous.width + 'px', height: previous.height + 'px' }, { left: x + 'px', top: y + 'px', width: target.width + 'px', height: target.height + 'px' }]);
     function whitePaint(from, to, labelNode = false) {
      const source = from || to; if (!source) return;
      const node = source.node.cloneNode(true); node.removeAttribute('id'); node.removeAttribute('data-i18n'); node.setAttribute('aria-hidden', 'true'); node.dataset.phonePaint = labelNode ? 'label' : 'glyph';
      const first = from?.box || { ...to.box, top: to.box.top + 4 }, last = to?.box || { ...from.box, top: from.box.top - 4 };
      Object.assign(node.style, { position: 'absolute', left: '0px', top: '0px', margin: '0px', padding: '0px', display: 'block', visibility: 'visible', opacity: '1', width: last.width + 'px', height: last.height + 'px', pointerEvents: 'none', fontSize: labelNode ? '12px' : '20px', fontWeight: '700', fontFamily: source.font, lineHeight: source.lineHeight, whiteSpace: 'nowrap', background: 'transparent', border: '0px' });
      node.style.setProperty('color', '#fff', 'important'); indicator.appendChild(node);
      const firstFrame = { left: first.left - fromOrigin.left + 'px', top: first.top - fromOrigin.top + 'px', opacity: from?.opacity ?? 0 }, lastFrame = { left: last.left - toOrigin.left + 'px', top: last.top - toOrigin.top + 'px', opacity: to ? 1 : 0 };
      const frames = labelNode && !from ? [firstFrame, { opacity: 0, offset: .52 }, lastFrame] : labelNode && !to ? [firstFrame, { opacity: 0, offset: .47 }, lastFrame] : [firstFrame, lastFrame];
      animate(node, frames); if (labelNode) labelPaint.set(source.node, node);
     }
     items.forEach((item, index) => {
      const icon = glyph(item), labelNode = text(item), afterGlyph = sample(icon), afterText = sample(labelNode), prior = before[index];
      if (icon && prior.glyph && afterGlyph) {
       const box = afterGlyph.box, old = prior.glyph.box;
       own(icon, 'color', document.documentElement.classList.contains('dark') ? '#b9c7d8' : '#52627a');
       animate(icon, [{ translate: (old.left - box.left) + 'px ' + (old.top - box.top) + 'px' }, { translate: '0px 0px' }]);
       whitePaint(prior.glyph, afterGlyph);
      }
      if (prior.text || afterText) { if (labelNode) own(labelNode, 'opacity', '0'); whitePaint(prior.text, afterText, true); }
     });
     Promise.all(selectionAnimations.map(animation => animation.finished)).then(() => { if (token === generation) clearSelection(); }, () => {});
    }
   }
   syncVisibility();
  }
  listen(document, 'portfolio:endingchange', syncVisibility);
  listen(document, 'portfolio:endingfocusreturn', () => { if (innerWidth < 768 && !blocked()) { visibilityAnimation?.cancel(); visibilityAnimation = null; hidden = false; delete header.dataset.phoneNavHidden; header.inert = false; header.removeAttribute('aria-hidden'); } });
  listen(toggle, 'keydown', event => {
   if (innerWidth >= 768 || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
   event.preventDefault();
   const forward = event.key === (document.documentElement.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
   (event.key === 'Home' ? items[0] : event.key === 'End' ? toggle : items[forward ? 0 : 2]).focus({ preventScroll: true });
  });
  listen(header, 'focusin', () => { if (hidden && !blocked()) { hidden = false; delete header.dataset.phoneNavHidden; header.inert = false; header.removeAttribute('aria-hidden'); } });
  listen(header, 'focusout', () => queueMicrotask(syncVisibility));
  listen(document, 'visibilitychange', () => { cancel(); if (!document.hidden) refresh(true); });
  listen(motion, 'change', () => { cancel(); refresh(true); });
  refresh(true);
  return { refresh, destroy() { if (disposed) return; cancel(); disposed = true; cleanups.forEach(stop => stop()); indicator.remove(); icon.remove(); caption.remove(); items.forEach(node => node.classList.remove('phone-selected')); delete header.dataset.phoneNavHidden; if (!state().suspended) { header.inert = false; header.removeAttribute('aria-hidden'); } } };
 };
})();
