/* HERO135/136: native finite entrance and visible-only reference geometry. */
(function () {
    'use strict';
    window.createPageEntryHeroes = function ({ runVisibleAnimation, canvasRenderScale, isPortfolioElementActive }) {
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)'), cleanups = [], scenes = [];
        const probe = new URLSearchParams(location.search).get('motionProbe') === '1';
        let disposed = false, fallbackFrame = 0;
        const identity = document.querySelector('#home > .mh-hero-container'), identityView = identity?.closest('.portfolio-view');
        let identityKey = '', identityHeight = 0;
        const listen = (node, name, fn, options) => { node.addEventListener(name, fn, options); cleanups.push(() => node.removeEventListener(name, fn, options)); };
        const smooth = n => { n = Math.max(0, Math.min(1, n)); return n * n * (3 - 2 * n); };
        const available = state => !disposed && state.visible && !document.hidden && !document.body.classList.contains('loader-active') && isPortfolioElementActive(state.hero);
        function readIdentityHeight() {
            if (!identity || !identityView) return 0;
            const width = identityView.parentElement?.clientWidth || document.documentElement.clientWidth || window.innerWidth;
            const key = width + ':' + document.documentElement.lang, box = identity.getBoundingClientRect();
            if (box.width && box.height) { identityKey = key; identityHeight = box.height; return identityHeight; }
            if (identityKey === key && identityHeight) return identityHeight;
            const saved = identityView.getAttribute('style');
            try {
                const styles = { display: 'block', position: 'fixed', left: '0', right: 'auto', top: '0', width: width + 'px', height: '0', 'max-height': '0', overflow: 'hidden', visibility: 'hidden', 'pointer-events': 'none' };
                for (const [name, value] of Object.entries(styles)) identityView.style.setProperty(name, value, 'important');
                const natural = identity.getBoundingClientRect();
                if (natural.width && natural.height) { identityKey = key; identityHeight = natural.height; }
            } finally { if (saved === null) identityView.removeAttribute('style'); else identityView.setAttribute('style', saved); }
            return identityKey === key ? identityHeight : 0;
        }
        function measure(state) {
            const targetHeight = readIdentityHeight();
            if (targetHeight > 0 && targetHeight !== state.targetHeight) { state.targetHeight = targetHeight; state.hero.style.setProperty('--identity-hero-height', targetHeight + 'px'); state.hero.dataset.entryIdentityHeight = targetHeight.toFixed(3); }
            const box = state.hero.getBoundingClientRect();
            if (!box.width || !box.height) return;
            state.width = box.width; state.height = box.height;
            state.hero.style.setProperty('--entry-left-clearance', Math.max(44, 100 - box.left) + 'px');
            state.hero.style.setProperty('--entry-right-clearance', Math.max(44, 100 - ((document.documentElement.clientWidth || window.innerWidth) - box.right)) + 'px');
            if (state.ctx) { state.scale = canvasRenderScale(box.width, box.height, 1200000); state.canvas.width = Math.round(box.width * state.scale); state.canvas.height = Math.round(box.height * state.scale); }
        }
        function settle(state) {
            state.serial++; state.entry?.cancel(); state.entry = null; state.complete = true; state.hero.dataset.entryPhase = 'settled';
        }
        function sync(state) {
            const live = available(state); state.hero.dataset.entryActive = String(live); state.last = 0;
            if (!live) {
                if (!state.complete) { state.serial++; state.entry?.cancel(); state.entry = null; state.hero.dataset.entryPhase = 'pending'; }
                return;
            }
            measure(state);
            if (motion.matches || !('IntersectionObserver' in window) || typeof state.copy.animate !== 'function') settle(state);
            else if (!state.complete && !state.entry) {
                const serial = ++state.serial; state.hero.dataset.entryPhase = 'entering';
                try {
                    state.entry = state.copy.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 1300, delay: 150, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
                    state.entry.finished.then(() => { if (state.serial === serial && available(state)) settle(state); }, () => {});
                } catch (_) { settle(state); }
            }
            state.stop?.redraw();
        }
        function dot(ctx, x, y, opacity, radius = 2.2) {
            ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(47,217,255,' + opacity + ')'; ctx.shadowColor = 'rgba(47,217,255,.8)'; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
        }
        function draw(state, now) {
            if (!state.ctx || !state.width || !available(state)) return false;
            const ctx = state.ctx, w = state.width, h = state.height;
            if (motion.matches) state.time = Math.max(160, state.time);
            else state.time += state.last ? Math.min(2, Math.max(0, now - state.last) / (1000 / 60)) : 1;
            state.last = now; const t = state.time;
            ctx.setTransform(state.scale, 0, 0, state.scale, 0, 0); ctx.clearRect(0, 0, w, h);
            if (document.documentElement.dir === 'rtl') { ctx.translate(w, 0); ctx.scale(-1, 1); }
            if (state.kind === 'network') {
                const start = w * (w <= 820 ? .04 : .34), end = w - 8, extent = start + (end - start) * smooth(t / 130);
                const wave = (i, x) => h * .5 + Math.sin(.01 * x + i * Math.PI / 2 + .004 * t) * h * .15;
                const gradient = ctx.createLinearGradient(start, 0, end, 0); gradient.addColorStop(0, 'rgba(61,123,255,0)'); gradient.addColorStop(.55, 'rgba(61,123,255,.2)'); gradient.addColorStop(1, 'rgba(47,217,255,.45)');
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath(); for (let x = start; x <= extent; x += 4) { const y = wave(i, x); if (x === start) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.strokeStyle = gradient; ctx.lineWidth = 1.2; ctx.stroke();
                    const x = start + (t * (.7 + i % 3 * .25) + 170 * i) % Math.max(30, extent - start), y = wave(i, x); let crossing = 0;
                    for (let j = 0; j < 4; j++) if (j !== i && Math.abs(wave(j, x) - y) < 5) crossing = 1;
                    dot(ctx, x, y, .3 + .55 * (x - start) / (end - start) + .15 * crossing, 2.2 + 1.2 * crossing);
                }
            } else {
                const baseRadius = Math.min(.17 * w, .4 * h), mobileScale = w <= 820 ? Math.max(1, Math.min(.46 * w / baseRadius, .44 * h / baseRadius, 2.6)) : 1;
                const radius = baseRadius, cx = w <= 820 ? w * .5 : w - 100 - radius;
                if (mobileScale !== 1) { ctx.translate(cx, h * .5); ctx.scale(mobileScale, mobileScale); ctx.translate(-cx, -h * .5); }
                const cy = h * .5 + 3 * Math.sin(.008 * t), amount = smooth(t / 70), angle = t % 460 / 460 * Math.PI * 2;
                for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, angle - (i + 1) / 8 * .62, angle - i / 8 * .62); ctx.closePath(); ctx.fillStyle = 'rgba(47,217,255,' + (.05 * (1 - i / 8) * amount) + ')'; ctx.fill(); }
                const endX = cx + Math.cos(angle) * radius, endY = cy + Math.sin(angle) * radius, line = ctx.createLinearGradient(cx, cy, endX, endY); line.addColorStop(0, 'rgba(47,217,255,' + .55 * amount + ')'); line.addColorStop(1, 'rgba(47,217,255,0)'); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(endX, endY); ctx.strokeStyle = line; ctx.lineWidth = 1.4; ctx.stroke(); dot(ctx, cx, cy, .85 * amount, 4 * (1 + .1 * Math.sin(.03 * t)));
                for (let i = 0; i < 2; i++) { const progress = (t + 150 * i) % 300 / 300, r = radius * progress; if (r < 6) continue; const alpha = .34 * (1 - progress) * amount, ring = ctx.createLinearGradient(cx - r, 0, cx + r, 0); ring.addColorStop(0, 'rgba(61,123,255,' + .4 * alpha + ')'); ring.addColorStop(1, 'rgba(47,217,255,' + alpha + ')'); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = ring; ctx.lineWidth = 1.2; ctx.stroke(); }
                [-.9, .7, 2.6].forEach((a, i) => { a += .15 * Math.sin(7.3 * i); const alpha = smooth((t - 40 - 14 * i) / 45), distance = radius * (.42 + i * .19); let after = (angle - a) % (Math.PI * 2); if (after < 0) after += Math.PI * 2; const hot = after < 1.5 ? Math.pow(1 - after / 1.5, 2) : 0; dot(ctx, cx + Math.cos(a) * distance, cy + Math.sin(a) * distance, (.08 + .75 * hot) * alpha, 2 + 2.2 * hot); });
            }
            if (probe) { state.hero.dataset.entryFrames = String(++state.frames); state.hero.dataset.entryTime = t.toFixed(2); }
        }
        document.querySelectorAll('.page-entry-hero').forEach(hero => {
            const canvas = hero.querySelector('canvas'), copy = hero.querySelector('.page-entry-copy'); let ctx = null; try { ctx = canvas?.getContext('2d'); } catch (_) {}
            const state = { hero, canvas, copy, ctx, kind: hero.dataset.entryKind, visible: false, complete: false, entry: null, serial: 0, time: 0, last: 0, width: 0, height: 0, frames: 0 }; scenes.push(state);
            hero.dataset.entryPhase = 'pending';
            if (motion.matches || !('IntersectionObserver' in window)) settle(state);
            if (ctx) state.stop = runVisibleAnimation(hero, now => draw(state, now), { fps: 30, active: () => available(state) });
            listen(hero, 'focusin', () => settle(state));
        });
        function refresh() { scenes.forEach(state => { if (!('IntersectionObserver' in window)) { const r = state.hero.getBoundingClientRect(); state.visible = r.bottom > 0 && r.top < innerHeight; } sync(state); }); }
        const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => { const state = scenes.find(s => s.hero === entry.target); if (state) { state.visible = entry.isIntersecting; sync(state); } }), { threshold: .05 }) : null;
        scenes.forEach(state => observer?.observe(state.hero));
        ['portfolio:viewchange', 'portfolio:ready', 'visibilitychange'].forEach(name => listen(document, name, refresh));
        listen(window, 'resize', refresh); listen(motion, 'change', refresh);
        const resize = 'ResizeObserver' in window ? new ResizeObserver(() => refresh()) : null; scenes.forEach(state => resize?.observe(state.hero)); if (identity) resize?.observe(identity);
        const fontsChanged = () => { if (!disposed) { identityKey = ''; refresh(); } };
        document.fonts?.ready?.then(fontsChanged); if (document.fonts?.addEventListener) listen(document.fonts, 'loadingdone', fontsChanged);
        if (!observer) listen(window, 'scroll', () => { if (!fallbackFrame && !document.hidden) fallbackFrame = requestAnimationFrame(() => { fallbackFrame = 0; refresh(); }); }, { passive: true });
        const locale = new MutationObserver(refresh); locale.observe(document.documentElement, { attributes: true, attributeFilter: ['dir', 'lang'] });
        refresh();
        return { destroy() { if (disposed) return; disposed = true; cancelAnimationFrame(fallbackFrame); observer?.disconnect(); resize?.disconnect(); locale.disconnect(); cleanups.forEach(stop => stop()); scenes.forEach(state => { state.serial++; state.entry?.cancel(); state.stop?.(); if (state.canvas) state.canvas.width = state.canvas.height = 0; ['--entry-left-clearance', '--entry-right-clearance', '--identity-hero-height'].forEach(name => state.hero.style.removeProperty(name)); delete state.hero.dataset.entryPhase; delete state.hero.dataset.entryActive; delete state.hero.dataset.entryFrames; delete state.hero.dataset.entryTime; delete state.hero.dataset.entryIdentityHeight; }); } };
    };
})();
