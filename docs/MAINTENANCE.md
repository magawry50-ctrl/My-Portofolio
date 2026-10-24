# Maintenance and release review

## Editing

Keep English/Arabic keys and fallback markup synchronized. Preserve exact brand spellings and original asset identity. Test both directions, Night/Day, phone/desktop, reduced motion, keyboard focus and interrupted interactions. Do not normalize existing runtime bytes merely to change line endings. The inventory checker also rejects Windows-reserved device basenames, invalid filename characters and trailing dots/spaces; do not bypass Git filename safety settings.

Layout, rendering, routing and reveal owners are described in ARCHITECTURE.md. Extend the owner of a behavior instead of adding competing observers or scroll controllers. Every finite animation needs stale-completion protection and cleanup for view, breakpoint, hidden-page and disposal changes. Hidden content must be noninteractive without trapping focus.

The Night palette is recorded in `night-palette.json`; active/focus/hover roles are separate. Recent explicit preferences include half-alpha selected strokes and an ivory moon. Do not infer that a decorative stroke provides a universal contrast guarantee.

## Checks

| Command | Evidence |
|---|---|
| `npm run check` | Current markup/locales; actual desktop/phone navigation, responsive original-node reading, capability replay/stagger/native distance, approved Arabic mapping/attribute refresh, ending/route owners; scoped Night paint |
| `npm run check:private` | Real Worker HTTP/SQLite authorization, expiry/revocation/rate limits/Range/empty cases and actual async gate lifecycle |
| `npm run check:production` | Portable fingerprint negative fixtures, decoded leak checks, allowlisted dependency closure, cache-rule disjointness, owned-output guards and repeated deterministic builds |
| `npm run check:release` | Byte equality with the reviewed 208-file manifest |
| `npm run build:cloudflare` / `npm run check:cloudflare` | Isolated mounted bundle; real HTTP aliases, all public asset HEADs, body preservation, source denials, Range/HEAD, root passthrough, unset503, dummy SQLite sessions and media |

The curated checks include the self-contained approved Arabic after-values and execute the actual capability surface/panel/native-reading owners together. They require no workspace-only copy map, old before snapshots or private archives. Historical uncurated snapshot-chain scripts are not part of `npm run check`: several retain superseded HERO140/TOOLS58 boundaries or an older duplicated surface fixture, so their failures are not represented as current passing evidence. Those exact historical assertions were not weakened to force a pass.

The small DOM fixtures verify shipped owners, not browser rendering. Native browser review remains necessary for layout, motion intermediates, hit testing, actual clipboard behavior and assistive interaction. No local fixture establishes field Core Web Vitals, FPS, CDN behavior or production security configuration.

The CSS compiler has build-only dependencies. Use the lockfile; do not force an audit fix that upgrades Tailwind to v4 or changes generated rules. Review current advisories against the trusted-source build threat model before future releases. Do not claim the build dependency graph is vulnerability-free.

## Repository and release inputs

`tools/repository-allowlist.json` is the explicit review/staging inventory. It retains the 135 pre-existing tracked files, adds the runtime source closure and curated build/tests/docs (380 inputs in this revision, including both current-owner checks and the newly compiled stylesheet; prior tracked inputs are retained), and omits private/local evidence. New legitimate inputs require a reviewed inventory update. Never stage the workspace with an unrestricted add operation. `.gitignore` is convenience; the inventory is authoritative.

The fingerprint contract is `tools/private-text-fingerprints.json`, cross-checked against the existing denylist. It preserves 15 known blocked phrases without their plaintext. A policy update needs reviewed schema/count/checksum, negative tests and private-source equivalence verification performed outside public artifacts. Never regenerate it from an empty private upload folder and thereby erase retired protections.

## Release procedure

1. Install with the README command; run the documented current-owner, private, production, release, repository and mounted checks from a clean checkout.
2. Review source diffs, assets, licensing, localized copy and native UI evidence. If intentional runtime changes exist, update `docs/release-baseline.json` only after review; rerun build/byte checks.
3. Keep the prior approved output/manifest for rollback. Rollback must preserve the server boundary and must never restore retired credentials or experimental payloads.
4. Review the curated Git inventory and push a review branch/draft PR only when authorized. Existing Pages publication from `main:/` is distinct from this branch; a main merge may publish it.
5. For the authorized `pinexen.com/mhalmaghawry/` mount and canonicalizing `www` alias, rebuild/check the isolated Cloudflare target and use only its generated Wrangler config. Never use the source root or the whole `cloudflare/` directory as an asset binding. Review the exact four route patterns, preserve the company origin and keep private bindings unset until separately configured. Verify actual hosted behavior before declaring release complete. Root-mode `dist` remains a separate Pages/local target.
