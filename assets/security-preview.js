/* OTP87: sphere geometry/palettes adapted from the user-supplied reference; no demo verification logic. */
(() => {
 function initSecurityPreviewSphere() {
  const modal = document.getElementById('security-otp-modal'), canvas = document.getElementById('security-particle-canvas');
  if (!modal || !canvas || typeof runVisibleAnimation !== 'function') return;
  let renderer = null, stop = null;
  function createRenderer() {
   const ctx = canvas.getContext('2d', { alpha: true });
   if (!ctx) return null;
   let isDark = document.documentElement.classList.contains('dark'), isSuccess = false, energyBoost = 0;
        const logicalSize = 260;
        const dpr = canvasRenderScale(logicalSize, logicalSize);
        canvas.width = logicalSize * dpr;
        canvas.height = logicalSize * dpr;
        ctx.scale(dpr, dpr);

        const centerX = logicalSize / 2;
        const centerY = logicalSize / 2;
        const sphereRadius = 76;

        function makeRadialSprite(size, stops) {
            const c = document.createElement("canvas");
            c.width = c.height = size;
            const context = c.getContext("2d");
            const grad = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            for (const [offset, color] of stops) grad.addColorStop(offset, color);
            context.fillStyle = grad;
            context.fillRect(0, 0, size, size);
            return c;
        }

        const glowCanvas = makeRadialSprite(64, [
            [0, "rgba(255, 255, 255, 1)"],
            [0.35, "rgba(255, 255, 255, 0.9)"],
            [0.7, "rgba(186, 230, 253, 0.45)"],
            [1, "rgba(186, 230, 253, 0)"]
        ]);

        const glowLightCanvas = makeRadialSprite(64, [
            [0, "rgba(13, 110, 253, 0.95)"],
            [0.28, "rgba(0, 194, 255, 0.75)"],
            [0.62, "rgba(13, 110, 253, 0.28)"],
            [1, "rgba(13, 110, 253, 0)"]
        ]);

        const glowSuccessCanvas = makeRadialSprite(64, [
            [0, "rgba(255, 255, 255, 1)"],
            [0.4, "rgba(255, 255, 255, 0.95)"],
            [0.75, "rgba(224, 242, 254, 0.5)"],
            [1, "rgba(255, 255, 255, 0)"]
        ]);

        const emissionOuter = makeRadialSprite(96, [
            [0, "rgba(0, 157, 255, 0.65)"],
            [0.32, "rgba(13, 110, 253, 0.28)"],
            [0.68, "rgba(36, 181, 232, 0.10)"],
            [1, "rgba(36, 181, 232, 0)"]
        ]);

        const emissionInner = makeRadialSprite(96, [
            [0, "rgba(241, 255, 255, 1)"],
            [0.10, "rgba(206, 253, 255, 0.99)"],
            [0.20, "rgba(89, 220, 253, 0.92)"],
            [0.32, "rgba(15, 151, 245, 0.68)"],
            [0.48, "rgba(13, 110, 253, 0.24)"],
            [0.72, "rgba(36, 181, 232, 0.045)"],
            [1, "rgba(36, 181, 232, 0)"]
        ]);

        const emissionTrail = document.createElement("canvas");
        emissionTrail.width = canvas.width;
        emissionTrail.height = canvas.height;
        const emissionCtx = emissionTrail.getContext("2d");
        emissionCtx.scale(dpr, dpr);
        let previousEmissionTheme = isDark;

        const particles = [];
        const numLatRings = 34;
        for (let r = 1; r < numLatRings; r++) {
            const phi = (r / numLatRings) * Math.PI;
            const y = Math.cos(phi);
            const ringRadius = Math.sin(phi);
            const ptsInRing = Math.max(8, Math.round(ringRadius * 72));
            for (let j = 0; j < ptsInRing; j++) {
                const theta = (j / ptsInRing) * Math.PI * 2 + (r % 2) * (Math.PI / ptsInRing);
                particles.push({
                    ux: Math.cos(theta) * ringRadius,
                    uy: y,
                    uz: Math.sin(theta) * ringRadius
                });
            }
        }

        const waveRings = [
            { baseR: 99,  f1: 2, a1: 3.8, s1: 1.15, f2: 3, a2: 2.2, s2: -0.75, phase: 0.0,  rotSpeed: 0.35, width: 1.75, alpha: 0.92 },
            { baseR: 101, f1: 3, a1: 3.4, s1: -0.95, f2: 2, a2: 2.8, s2: 1.25, phase: 1.57, rotSpeed: -0.28, width: 1.4,  alpha: 0.80 },
            { baseR: 97.5,f1: 2, a1: 4.2, s1: 0.80, f2: 4, a2: 1.7, s2: 1.40, phase: 3.14, rotSpeed: 0.42, width: 1.2,  alpha: 0.72 },
            { baseR: 102.5,f1: 3, a1: 2.9, s1: 1.30, f2: 2, a2: 3.1, s2: -0.85, phase: 4.71, rotSpeed: -0.32, width: 1.0,  alpha: 0.60 }
        ];

        function drawContinuousOrbitalRings(t) {
            ctx.save();
            ctx.globalCompositeOperation = isDark ? "screen" : "source-over";
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            const steps = 180;
            for (let idx = 0; idx < waveRings.length; idx++) {
                const ring = waveRings[idx];
                const rotAngle = t * ring.rotSpeed + ring.phase;
                const gx = Math.cos(rotAngle) * ring.baseR;
                const gy = Math.sin(rotAngle) * ring.baseR;

                const grad = ctx.createLinearGradient(centerX - gx, centerY - gy, centerX + gx, centerY + gy);

                if (isSuccess) {
                    if (isDark) {
                        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
                        grad.addColorStop(0.35, "rgba(0, 212, 255, 0.95)");
                        grad.addColorStop(0.7, "rgba(56, 189, 248, 0.9)");
                        grad.addColorStop(1, "rgba(13, 110, 253, 0.75)");
                    } else {
                        grad.addColorStop(0, "rgba(13, 110, 253, 0.98)");
                        grad.addColorStop(0.5, "rgba(0, 194, 255, 0.92)");
                        grad.addColorStop(1, "rgba(2, 132, 199, 0.85)");
                    }
                } else {
                    if (isDark) {
                        grad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
                        grad.addColorStop(0.3, "rgba(0, 194, 255, 0.95)");
                        grad.addColorStop(0.68, "rgba(13, 110, 253, 0.90)");
                        grad.addColorStop(1, "rgba(37, 99, 235, 0.65)");
                    } else {
                        grad.addColorStop(0, "rgba(0, 194, 255, 0.98)");
                        grad.addColorStop(0.4, "rgba(13, 110, 253, 0.92)");
                        grad.addColorStop(0.75, "rgba(29, 78, 216, 0.88)");
                        grad.addColorStop(1, "rgba(56, 189, 248, 0.80)");
                    }
                }

                ctx.beginPath();
                const boostScale = 1 + energyBoost * 0.45;
                for (let i = 0; i <= steps; i++) {
                    const theta = (i / steps) * Math.PI * 2;
                    const d1 = Math.sin(theta * ring.f1 + t * ring.s1 + ring.phase) * ring.a1;
                    const d2 = Math.cos(theta * ring.f2 + t * ring.s2 - ring.phase) * ring.a2;
                    const d3 = Math.sin(theta * 5 - t * 1.6 + idx) * 0.85;
                    const r = ring.baseR + (d1 + d2 + d3) * boostScale;
                    const x = centerX + Math.cos(theta) * r;
                    const y = centerY + Math.sin(theta) * r;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();

                ctx.strokeStyle = grad;
                ctx.lineWidth = ring.width * 3.0;
                ctx.globalAlpha = ring.alpha * (isDark ? 0.22 : 0.16);
                ctx.stroke();

                ctx.lineWidth = ring.width * (isDark ? 1 : 0.85);
                ctx.globalAlpha = ring.alpha * (isDark ? 1 : 0.72);
                ctx.stroke();
            }
            ctx.restore();
        }

        let lastTime = performance.now();
        let elapsed = 0;
        let rotY = 0;

        function renderSphere(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            const speedMult = isSuccess ? 1.45 : 1 + energyBoost * 0.6;
            elapsed += dt * speedMult;
            rotY += dt * 0.32 * speedMult;
            const rotX = 0.32 + Math.sin(elapsed * 0.45) * 0.14;
            energyBoost *= Math.pow(0.06, dt);

            ctx.clearRect(0, 0, logicalSize, logicalSize);

            const lightAzimuth = Math.sin(elapsed * 0.62) * 0.78 + Math.cos(elapsed * 0.37) * 0.35;
            const lightElevation = -0.25 + Math.cos(elapsed * 0.53) * 0.52;
            const lx = Math.sin(lightAzimuth) * Math.cos(lightElevation);
            const ly = Math.sin(lightElevation);
            const lz = Math.cos(lightAzimuth) * Math.cos(lightElevation);

            const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
            const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

            const projected = [];
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const x1 = p.ux * cosY - p.uz * sinY;
                const z1 = p.uz * cosY + p.ux * sinY;
                const y2 = p.uy * cosX - z1 * sinX;
                const z2 = z1 * cosX + p.uy * sinX;

                const wavePhase = x1 * 3.8 + y2 * 3.8 + z2 * 2.5 - elapsed * 2.1;
                const ripple = Math.sin(wavePhase) * Math.cos(y2 * 4.2 + elapsed * 1.4);
                const dotLight = Math.max(0, x1 * lx + y2 * ly + z2 * lz);
                const waveCrest = Math.pow(dotLight, 4.2) * (0.68 + 0.32 * Math.sin(wavePhase * 1.5));
                const r = sphereRadius + ripple * 1.8 + waveCrest * (3.6 + energyBoost * 3.5);

                const wx = x1 * r, wy = y2 * r, wz = z2 * r;
                const fov = 340;
                const scale = fov / (fov - wz);

                projected.push({
                    x: centerX + wx * scale,
                    y: centerY + wy * scale,
                    z: wz,
                    normZ: z2,
                    scale,
                    crest: waveCrest,
                    variation: 0.86 + 0.14 * Math.sin(p.ux * 43 + p.uy * 29 + p.uz * 31)
                });
            }

            projected.sort((a, b) => a.z - b.z);

            if (!isDark) {
                const bgWash = ctx.createRadialGradient(centerX, centerY, sphereRadius * 0.1, centerX, centerY, sphereRadius * 1.18);
                bgWash.addColorStop(0, "rgba(13, 110, 253, 0.055)");
                bgWash.addColorStop(0.65, "rgba(0, 194, 255, 0.025)");
                bgWash.addColorStop(1, "rgba(13, 110, 253, 0)");
                ctx.fillStyle = bgWash;
                ctx.beginPath();
                ctx.arc(centerX, centerY, sphereRadius * 1.18, 0, Math.PI * 2);
                ctx.fill();
            }

            if (previousEmissionTheme !== isDark) {
                emissionCtx.clearRect(0, 0, logicalSize, logicalSize);
                previousEmissionTheme = isDark;
            }
            if (!isDark) {
                emissionCtx.globalCompositeOperation = "destination-out";
                emissionCtx.globalAlpha = 1 - Math.exp(-dt / 0.065);
                emissionCtx.fillStyle = "#000";
                emissionCtx.fillRect(0, 0, logicalSize, logicalSize);
                emissionCtx.globalCompositeOperation = "source-over";
                const frameWeight = 1 - Math.exp(-dt / 0.065);
                for (const p of projected) {
                    if (p.normZ < 0 || p.crest < 0.04) continue;
                    const energy = Math.pow(p.crest, 0.72);
                    const pulse = 0.88 + 0.12 * Math.sin(elapsed * 3.6 + p.normZ * 4);
                    const outerSize = (8 + energy * 10) * p.scale;
                    emissionCtx.globalAlpha = frameWeight * Math.pow(energy, 1.7) * 0.065 * pulse;
                    emissionCtx.drawImage(emissionOuter, p.x - outerSize / 2, p.y - outerSize / 2, outerSize, outerSize);
                }
                emissionCtx.globalAlpha = 1;
                ctx.globalAlpha = 1;
                ctx.drawImage(emissionTrail, 0, 0, logicalSize, logicalSize);
            }

            const sprite = isDark ? (isSuccess ? glowSuccessCanvas : glowCanvas) : glowLightCanvas;

            for (let i = 0; i < projected.length; i++) {
                const p = projected[i];
                if (p.normZ < -0.35) continue;

                const depth = Math.max(0, (p.normZ + 0.35) / 1.35);
                const c = p.crest;
                const radius = (0.72 + Math.pow(depth, 1.3) * 0.38 + Math.pow(c, 1.15) * 1.45) * p.scale;

                if (isDark) {
                    const alpha = Math.min(1, 0.18 + Math.pow(depth, 1.5) * 0.52 + c * 0.9);
                    if (p.normZ > -0.1) {
                        const glowIntensity = 0.12 * depth + c * 0.85;
                        if (glowIntensity > 0.05) {
                            const glowSize = radius * (4.2 + c * 3.2);
                            ctx.globalAlpha = Math.min(1, glowIntensity);
                            ctx.drawImage(sprite, p.x - glowSize * 0.5, p.y - glowSize * 0.5, glowSize, glowSize);
                        }
                    }
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${Math.round(235 + c * 20)}, ${Math.round(244 + c * 11)}, 255, ${alpha})`;
                    ctx.fill();
                } else {
                    const energy = Math.min(1, Math.pow(c, 0.82) * p.variation * (1 + energyBoost * 0.12));
                    const exposure = energy * energy * (3 - 2 * energy);
                    const pointRadius = (0.68 + Math.pow(depth, 1.5) * 0.32 + exposure * 0.65) * p.scale;
                    const front = Math.max(0, p.normZ);
                    const opacity = 0.20 + Math.pow(depth, 1.35) * 0.66;

                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${217 - energy * 18}, ${65 + energy * 33}%, ${49 + energy * 6}%, ${opacity * (1 - exposure * 0.86)})`;
                    ctx.fill();

                    if (front > 0 && energy > 0.035) {
                        const bloomSize = pointRadius * (4.6 + exposure * 1.8);
                        ctx.globalAlpha = Math.min(1, exposure * 1.35 + energy * 0.12);
                        ctx.drawImage(emissionInner, p.x - bloomSize / 2, p.y - bloomSize / 2, bloomSize, bloomSize);
                    }
                    ctx.globalAlpha = 1;
                }
            }

            drawContinuousOrbitalRings(elapsed);

        }


   let frames = 0;
   const probe = new URLSearchParams(location.search).get('motionProbe') === '1';
   return { draw(now) { isDark = document.documentElement.classList.contains('dark'); isSuccess = modal.dataset.otpStatus === 'success'; renderSphere(now); if (probe) { canvas.dataset.otpFrames = String(++frames); canvas.dataset.otpTheme = isDark ? 'dark' : 'light'; } }, boost() { energyBoost = 1; } };
  }
  function sync() {
   const allowed = modal.classList.contains('modal-open') && !document.hidden;
   if (!allowed) { stop?.(); stop = null; canvas.dataset.otpRunning = 'false'; return; }
   if (!renderer) renderer = createRenderer();
   if (!renderer) { canvas.dataset.otpFallback = 'true'; return; }
   canvas.dataset.otpFallback = 'false';
   if (!stop) stop = runVisibleAnimation(canvas, renderer.draw, { fps: 30, active: () => modal.classList.contains('modal-open') && !document.hidden });
   else stop.redraw();
   canvas.dataset.otpRunning = 'true';
  }
  const observer = new MutationObserver(sync);
  observer.observe(modal, { attributes: true, attributeFilter: ['class', 'data-otp-status'] });
  const onInput = () => renderer?.boost();
  modal.addEventListener('input', onInput);
  document.addEventListener('visibilitychange', sync);
  sync();
  return { destroy() { stop?.(); stop = null; observer.disconnect(); modal.removeEventListener('input', onInput); document.removeEventListener('visibilitychange', sync); canvas.dataset.otpRunning = 'false'; } };
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSecurityPreviewSphere, { once: true });
 else initSecurityPreviewSphere();
})();
