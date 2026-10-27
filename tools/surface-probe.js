/* Opt-in local computed-style evidence. No network, telemetry, styles or perpetual RAF. */
(() => {
  const boot = () => {
    const MAX_ROOTS = 31, MAX_SAMPLES = 12, MAX_STATES = 8, WINDOW_MS = 1200, GAP_MS = 100;
    const out = document.createElement('script');
    out.type = 'application/json'; out.id = 'surface-probe';
    document.body.appendChild(out);
    const began = performance.now(), roots = new Map(), keys = new WeakMap(), frames = new Map();
    const data = { status: 'listening', measurement: 'Local RAF computed opacity/translate snapshots; browser rendering evidence, not GPU FPS', limits: { roots: MAX_ROOTS, samplesPerRoot: MAX_SAMPLES, windowMs: WINDOW_MS }, viewport: [innerWidth, innerHeight], roots: [] };
    let stopped = false, ordinal = 0, observer, deadline;
    const publish = () => { out.textContent = JSON.stringify(data); };
    const elapsed = () => Math.round(performance.now() - began);
    function record(element) {
      if (!element?.dataset?.surfaceReveal) return null;
      let key = keys.get(element);
      if (!key) {
        key = element.id || `${element.closest('section')?.id || 'surface'}:${++ordinal}`;
        keys.set(element, key);
      }
      if (!roots.has(key)) {
        if (roots.size >= MAX_ROOTS) return null;
        const value = { key, states: [], samples: [], sampling: 'idle' };
        roots.set(key, value); data.roots.push(value);
      }
      return roots.get(key);
    }
    function sample(element, value, kind) {
      if (value.samples.length >= MAX_SAMPLES) return;
      const css = getComputedStyle(element);
      value.samples.push({ ms: elapsed(), kind, state: element.dataset.surfaceReveal, loader: document.body.classList.contains('loader-active'), opacity: Number(css.opacity), translate: css.translate });
    }
    function state(element) {
      const value = record(element);
      if (!value) return;
      const phase = element.dataset.surfaceReveal;
      if (value.states.at(-1)?.state !== phase && value.states.length < MAX_STATES) value.states.push({ ms: elapsed(), state: phase, loader: document.body.classList.contains('loader-active') });
      if (phase === 'pending' && !value.samples.length) sample(element, value, 'pending');
      publish();
    }
    function animationStart(event) {
      const element = event.target;
      if (stopped || event.animationName !== 'surface-card-enter' || !element?.classList?.contains('surface-reveal-entering')) return;
      const value = record(element);
      if (!value || value.sampling !== 'idle') return;
      value.sampling = 'running';
      const start = performance.now();
      let last = -Infinity;
      function frame(now) {
        frames.delete(element);
        if (stopped) return;
        if (!element.isConnected || document.hidden) { value.sampling = 'interrupted'; publish(); return; }
        if (now - last >= GAP_MS || element.dataset.surfaceReveal === 'settled') {
          sample(element, value, 'raf'); last = now; publish();
        }
        if (value.samples.length >= MAX_SAMPLES || now - start >= WINDOW_MS || element.dataset.surfaceReveal === 'settled') {
          value.sampling = 'complete'; publish(); return;
        }
        frames.set(element, requestAnimationFrame(frame));
      }
      frames.set(element, requestAnimationFrame(frame));
    }
    function ready() {
      document.querySelectorAll('[data-surface-reveal]').forEach(element => {
        state(element);
        const value = record(element);
        if (value) sample(element, value, 'portfolio:ready');
      });
      publish();
    }
    function stop(reason) {
      if (stopped) return;
      stopped = true;
      observer.disconnect();
      frames.forEach(id => cancelAnimationFrame(id)); frames.clear();
      clearTimeout(deadline);
      document.removeEventListener('animationstart', animationStart);
      document.removeEventListener('portfolio:ready', ready);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', onPageHide);
      data.status = reason; publish();
    }
    function visibility() { if (document.hidden) stop('stopped-hidden'); }
    function onPageHide() { stop('stopped-pagehide'); }
    observer = new MutationObserver(records => {
      if (stopped) return;
      records.forEach(change => state(change.target));
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-surface-reveal'] });
    document.addEventListener('animationstart', animationStart);
    document.addEventListener('portfolio:ready', ready);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', onPageHide);
    document.querySelectorAll('[data-surface-reveal]').forEach(state);
    deadline = setTimeout(() => stop('stopped-deadline'), 300000);
    publish();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
