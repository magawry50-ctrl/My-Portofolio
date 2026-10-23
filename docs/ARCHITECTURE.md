# Architecture

## Source and build

`index.html` owns the bilingual dictionary, three view groups, navigation/router and most feature controllers. Scoped assets implement capabilities, interests, entry heroes, ending cards, the loader and responsive navigation/reading. `404.html` has its own compiled stylesheet. Fonts, icons, images, textures and video derivatives are local.

`tools/build-styles.cjs` compiles pinned Tailwind 3.4.17 with its compatibility minifier/prefixer and the existing theme/safelist. The final-head stylesheet position is intentional. `tools/build-production.cjs` follows literal runtime references and all required generated video variants, retains license notices, strips opt-in diagnostic injectors, and emits a complete SHA256 manifest. It refuses unowned/modified output files instead of cleaning arbitrary directories. Its owned-output deletion/refusal policy is restricted to the verified `dist` path. The compiler separately refreshes hashed utility CSS/license, index/404 stylesheet links and `tools/styles-manifest.json`; the builder also writes a local `PERF154_BUILD_REPORT.json`. Those deterministic bookkeeping writes are not additional deployable folders.

The production Worker is copied from `server/private-preview-worker.mjs`; `_routes.json` routes only `/api/previews/*` through it. Public assets are otherwise served normally. No private content is embedded in the Worker.

## UI ownership

- `initSideNavigation` owns view/history/hash routing, desktop rail geometry and the finite 420ms morph. The phone helper owns the four-item bottom indicator and Settings presentation, while reusing the original language/theme nodes.
- `createNativeReadingSequence` owns bounded native reading intervals for Expertise and capabilities. Tall/phone layouts retain readable native flow. `initSectionStacks` uses natural slots and tail takeover, allowing all inner reading to finish first; opaque plates prevent earlier content leaking through.
- `initInterestsCarousel` also provides the Concepts page-scroll-to-horizontal reading pattern. Native page scrolling remains authoritative; arrows and horizontal input synchronize with it. There is no wheel trap or autoplay.
- `initSurfaceReveals` owns first-visible entrances. Desktop capability cards start 35ms apart over 260ms each, while phone and reduced-motion policies retain their distinct readable paths.
- `initBusinessCardOverlay` owns the single ending/contact slot, 900ms entrance, per-visit dismissal and explicit replacement. Cross-view routing blocks intermediate end eligibility until the final destination write. The contact action owner handles inline disclosure, confirmed copy feedback, focus and cancellation.
- The Cast II loader retains its intentional finite branded timeline and one `portfolio:ready` release. Early dismissal, hidden-page teardown, reduced/no-WebGL fallbacks and a hard failsafe prevent a blocked page. Its duration is a visual design choice, not a loading-speed claim.

Artwork/renderers use existing visibility/document/view eligibility and shared scheduling. Do not introduce an independent perpetual animation loop for a new interaction. Original-node moves, rather than cloned controls/canvases, preserve focus, IDs and lifecycle ownership.

## Protected previews

Only the three public identities remain in the catalog. The six-cell UI calls the server; it has no client-valid code. The Worker requires private R2/D1 bindings and fresh short-lived project codes, enforces atomic attempt limits and project-scoped expiring opaque sessions, and checks content/media/Range authorization. Missing configuration returns 503; all three current cases are empty. See the configuration contract for exact bindings and limits.

The build's fingerprint policy contains hashes/lengths/prefilters for known retired experimental text, one reviewed generic exception and the retired credential fingerprint. Every possible text match is SHA256-confirmed after the incumbent decoding normalization. Missing, malformed, empty or inconsistent policy fails the build. This known-text guard is not a general-purpose data classifier; future private material stays outside Git/public assets and requires deliberate policy review.
