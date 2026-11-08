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
  const listen = (node, event, fn, options) => { node.addEventListener(event, fn, options); cleanups.push(() => node.removeEventListener(event, fn, options)); };
  const blocked = () => state().suspended || header.hidden || document.hidden || document.body.classList.contains('loader-active');
  function clearSelection() {
   generation++; selectionAnimations.forEach(animation => animation.cancel()); selectionAnimations = [];
   delete header.dataset.phoneNavMotion;
  }
  function cancel() { clearSelection(); visibilityAnimation?.cancel(); visibilityAnimation = null; }
  const glyph = node => node.querySelector('.island-group-icon') || node.querySelector('.phone-settings-icon');
  const text = node => node.querySelector('.rail-phone-label') || node.querySelector('.phone-settings-label');
  const sample = node => {
   if (!node) return null;
   const style = getComputedStyle(node);
   return { node, box: node.getBoundingClientRect(), color: style.color, opacity: style.visibility === 'hidden' ? 0 : Number(style.opacity) };
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
    const previous = indicator.getBoundingClientRect(), painted = Boolean(key) && previous.width > 0;
    const before = items.map(item => ({ glyph: sample(glyph(item)), text: sample(text(item)) }));
    clearSelection();
    items.forEach(node => node.classList.toggle('phone-selected', node === selected));
    const frame = main.getBoundingClientRect(), target = selected.getBoundingClientRect();
    const x = target.left - frame.left, y = target.top - frame.top;
    Object.assign(indicator.style, { left: x + 'px', top: y + 'px', width: target.width + 'px', height: target.height + 'px' });
    key = nextKey;
    if (painted && !motion.matches && indicator.animate) {
     const token = generation, clock = document.timeline?.currentTime;
     header.dataset.phoneNavMotion = 'selecting';
     const animate = (node, frames) => {
      const animation = node.animate(frames, { duration: 200, easing: 'cubic-bezier(.16,1,.3,1)' });
      if (Number.isFinite(clock)) animation.startTime = clock;
      animation.finished.catch(() => {}); selectionAnimations.push(animation);
     };
     // One timeline moves the blue surface and the original, unscaled glyphs/text.
     animate(indicator, [{ transformOrigin: '0 0', transform: `translate(${previous.left - target.left}px,${previous.top - target.top}px) scale(${previous.width / target.width},${previous.height / target.height})` }, { transformOrigin: '0 0', transform: 'translate(0px,0px) scale(1,1)' }]);
     items.forEach((item, index) => {
      for (const part of ['glyph', 'text']) {
       const from = before[index][part], to = sample(part === 'glyph' ? glyph(item) : text(item));
       if (!from || !to || part === 'text' && !from.opacity && !to.opacity) continue;
       const first = { translate: `${from.box.left - to.box.left}px ${from.box.top - to.box.top}px`, color: from.color, opacity: from.opacity, visibility: 'visible' };
       const last = { translate: '0px 0px', color: to.color, opacity: to.opacity, visibility: 'visible' };
       animate(to.node, [first, last]);
      }
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
