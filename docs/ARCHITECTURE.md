# Architecture

## Source and build

`index.html` owns the bilingual dictionary, three view groups, navigation/router and most feature controllers. Scoped assets implement capabilities, interests, entry heroes, ending cards, the loader and responsive navigation/reading. `404.html` has its own compiled stylesheet. Fonts, icons, images, textures and video derivatives are local.

`tools/build-styles.cjs` compiles pinned Tailwind 3.4.17 with its compatibility minifier/prefixer and the existing theme/safelist. The final-head stylesheet position is intentional. `tools/build-production.cjs` follows literal runtime references and all required generated video variants, retains license notices, strips opt-in diagnostic injectors, and emits a complete SHA256 manifest. It refuses unowned/modified output files instead of cleaning arbitrary directories. Its owned-output deletion/refusal policy is restricted to the verified `dist` path. The compiler separately refreshes hashed utility CSS/license, index/404 stylesheet links and `tools/styles-manifest.json`; the builder also writes a local `PERF154_BUILD_REPORT.json`. Those deterministic bookkeeping writes are not additional deployable folders.

The production Worker is copied from `server/private-preview-worker.mjs`; `_routes.json` routes only `/api/previews/*` through it. Public assets are otherwise served normally. No private content is embedded in the Worker.

`tools/build-cloudflare.cjs` derives a separate mounted release from that verified root build. Only public runtime assets enter `cloudflare/public`; Pages controls, robots, server source and build manifests do not. The generated `worker.mjs` imports `server/portfolio-mount-worker.mjs`'s exact-boundary owner and the byte-identical private handler. Worker-first routing validates paths before the Assets binding; automatic HTML handling and SPA fallback are disabled. Outside `/mhalmaghawry/` and the exact normalization/alias paths, requests pass unchanged to the existing company origin. The narrowly registered route wildcards deliberately do not make suffix lookalikes portfolio pages.

The mount owner strips the prefix for internal asset/private-handler lookup. Private media fields receive the prefix on output; `__Host-preview-*` cookies retain their required `Path=/`, Secure, HttpOnly and SameSite=Strict attributes. The client captures its own script URL at evaluation, supporting both root and mount API paths without a global base tag. Hash/history/language routing is unchanged. Canonical/social metadata, sitemap, manifest and 404 links are rewritten only in mounted output. Company-root robots policy remains outside this package's ownership.

## UI ownership

- `initSideNavigation` owns view/history/hash routing, desktop rail geometry and the finite 420ms morph. The phone helper owns the four-item bottom indicator and Settings presentation, while reusing the original language/theme nodes.
- `createNativeReadingSequence` owns bounded native reading intervals for Expertise and capabilities. Tall/phone layouts retain readable native flow. `initSectionStacks` uses natural slots and tail takeover, allowing all inner reading to finish first; opaque plates prevent earlier content leaking through.
- `initInterestsCarousel` also provides the Concepts page-scroll-to-horizontal reading pattern. Native page scrolling remains authoritative; arrows and horizontal input synchronize with it. There is no wheel trap or autoplay.
- `initSurfaceReveals` owns first-visible entrances. Desktop capability cards instead use panel activation generations: completed cards replay on genuine selection/revisit, with 35ms start spacing and 260ms effects. Same-interval scroll/measurement does not replay them. Passive capability selection paints its distance-selected panel immediately; deliberate tab navigation retains instant alignment. Capability-specific reading intervals use max(600px,viewport minus clearance), including a full final dwell; Expertise retains its original default. Phone and reduced-motion policies retain their distinct readable paths.
- `initBusinessCardOverlay` owns the single ending/contact slot, 900ms entrance, per-visit dismissal and explicit replacement. Cross-view routing blocks intermediate end eligibility until the final destination write. The contact action owner handles inline disclosure, confirmed copy feedback, focus and cancellation.
- The Cast II loader retains its intentional finite branded timeline and one `portfolio:ready` release. Early dismissal, hidden-page teardown, reduced/no-WebGL fallbacks and a hard failsafe prevent a blocked page. Its duration is a visual design choice, not a loading-speed claim.

The six named Identity surface groups share the moving-logo card's measured material tokens (Day white/gray200 alpha.8/shadow-sm; Night #0c1836/white alpha.1/two shadow-xl layers; 28px radius), without changing that reference or internal artwork. Locale application refreshes informative image/brand/OTP/loader attributes as well as visible copy, preserving English originals and input values.

Artwork/renderers use existing visibility/document/view eligibility and shared scheduling. Do not introduce an independent perpetual animation loop for a new interaction. Original-node moves, rather than cloned controls/canvases, preserve focus, IDs and lifecycle ownership.

## Protected previews

Only the three public identities remain in the catalog. The six-cell UI calls the server; it has no client-valid code. The Worker requires private R2/D1 bindings and fresh short-lived project codes, enforces atomic attempt limits and project-scoped expiring opaque sessions, and checks content/media/Range authorization. Missing configuration returns 503; all three current cases are empty. See the configuration contract for exact bindings and limits.

The build's fingerprint policy contains hashes/lengths/prefilters for known retired experimental text, one reviewed generic exception and the retired credential fingerprint. Every possible text match is SHA256-confirmed after the incumbent decoding normalization. Missing, malformed, empty or inconsistent policy fails the build. This known-text guard is not a general-purpose data classifier; future private material stays outside Git/public assets and requires deliberate policy review.
