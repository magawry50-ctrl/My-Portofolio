# Maintenance and release review

## Current FOLDER204 interaction contract

FOLDER204 is published as Worker `8b5e84dc-9635-48af-94b3-a7f7a6dae2ee`. Source/native and predeployment gates pass; fresh hosted native review confirms direct one-click To-Get.me details with no full-unfold stage. Final independent hosted T8 verdict: Approved. The earlier MOTION203 acceptance below remains historical evidence for its unchanged boundaries.

Primary Concepts folder activation opens details immediately, without a full-unfold intermediate state. Preserve the existing half-open hover/focus effect and MOTION203 grid/disclosure behavior. Only the explicit More → Open Folder action unfolds files. A locked primary opens OTP and resumes details once; the explicit unfold action resumes separately. Test both continuations and deny expired/invalid authorization at activation time.

The primary button is a dialog opener, not a disclosure. COPY-0613 alone changes to “Open project details” / “فتح تفاصيل المشروع”, pinned under `folder204.actionLabelOverrides` in the existing UI-delta fixture. Do not rewrite the original COPY202 fixture or relax other unit checks. Native review must include single click/tap, Enter/Space, hover preservation, optional menu/file actions and locked-preview denial.

## Editing

Keep English/Arabic keys and fallback markup synchronized. Preserve exact brand spellings and original asset identity. Test both directions, Night/Day, phone/desktop, reduced motion, keyboard focus and interrupted interactions. Do not normalize existing runtime bytes merely to change line endings. The inventory checker also rejects Windows-reserved device basenames, invalid filename characters and trailing dots/spaces; do not bypass Git filename safety settings.

Layout, rendering, routing and reveal owners are described in ARCHITECTURE.md. Extend the owner of a behavior instead of adding competing observers or scroll controllers. Every finite animation needs stale-completion protection and cleanup for view, breakpoint, hidden-page and disposal changes. Hidden content must be noninteractive without trapping focus.

MOTION203 adds two maintenance lessons:

1. Test motion with its real paint owner. Sample original icon geometry/color before cancelling the previous animation, then move the original icons and pill on one finite timeline. Author `!important` colors can override Web Animations color frames; duplicate foreground glyphs can hide a mismatched selection. Verify rapid reversal and final paint in the browser as well as the owner fixture.
2. Test disclosure changes through the outer layout owner and real pointer hit targets. Concepts must remain flow-only in the section-stack owner, not merely lose its inner carousel. Measure the 1/2/4-column grid at the shared 768px/1280px breakpoints, verify the next section cannot cover the disclosure, and keep closed files inert. On user-triggered collapse, preserve the focused button's viewport top with one guarded instant correction; expansion must leave the new rows in reading context. Route/locale/visibility/disposal and replacement input must cancel stale corrections.

The Night palette is recorded in `night-palette.json`; active/focus/hover roles are separate. Recent explicit preferences include half-alpha selected strokes and an ivory moon. Do not infer that a decorative stroke provides a universal contrast guarantee.

## Checks

| Command | Evidence |
|---|---|
| `npm run check` | Exact COPY202 units/fallbacks, separately pinned MOTION203 UI delta and FOLDER204 primary action label; actual desktop/phone navigation and original-icon paint, responsive reading, capability replay/native distance, localized attributes, ending/route owners, Night paint and Interests carousel lifecycle; direct Concepts primary activation, optional menu/file gates, flow/disclosure, shared breakpoints and one-shot collapse anchoring |
| `npm run check:private` | Real Worker HTTP/SQLite authorization, expiry/revocation/rate limits/Range/empty cases and actual async gate lifecycle |
| `npm run check:production` | Portable fingerprint negative fixtures, decoded leak checks, allowlisted dependency closure, cache-rule disjointness, owned-output guards and repeated deterministic builds |
| `npm run check:release` | Byte equality with the reviewed 209-file manifest |
| `npm run build:cloudflare` / `npm run check:cloudflare` | Isolated mounted bundle; four actual 404 inline-script locale cases (root/mounted EN/AR); real HTTP aliases, all public asset HEADs, body preservation, source denials, Range/HEAD, root passthrough, unset503, dummy SQLite sessions and media |

The curated checks include the public-only approved bilingual copy fixture and execute the actual locale and capability surface/panel/native-reading owners. They require no workspace-only copy map, old before snapshots or private archives. Composite visual fragments must concatenate to one approved unit; do not fill each fragment with the full sentence. Keep dormant entries dormant. Historical uncurated snapshot-chain scripts are not part of `npm run check`: several retain superseded HERO140/TOOLS58 boundaries or an older duplicated surface fixture, so their failures are not represented as current passing evidence. Those exact historical assertions were not weakened to force a pass.

404 locale scripts must derive return destinations from the authored home anchor before setting language query parameters. A root-relative JavaScript literal can erase the mount applied to HTML at build time; static href checks alone do not detect that failure. Preserve the four actual-script cases and verify both return actions on the hosted site.

Passive desktop scrolling must not acquire rail-opening authority. The 768–1439px logical reading inset is local to affected text regions; preserve phone, larger-desktop and card/art geometry. Review rail/text bounding-box intersections in both directions, since zero document overflow alone does not establish clearance.

The small DOM fixtures verify shipped owners, not browser rendering. Native browser review remains necessary for layout, motion intermediates, hit testing, actual clipboard behavior and assistive interaction. No local fixture establishes field Core Web Vitals, FPS, CDN behavior or production security configuration.

MOTION203 final published QA is Approved after fresh independent HTTP verification and actual published desktop/phone actions: 4→11→4 folders with retained collapse focus/context, the correct exposed-file modal, rapid original-white-icon/pill alignment, no document overflow and clear consoles in the sampled states. Keep these interaction checks in future native review; this release does not establish every-device rendering or field FPS.

The CSS compiler has build-only dependencies. Use the lockfile; do not force an audit fix that upgrades Tailwind to v4 or changes generated rules. Review current advisories against the trusted-source build threat model before future releases. Do not claim the build dependency graph is vulnerability-free.

## Repository and release inputs

`tools/repository-allowlist.json` is the explicit review/staging inventory. It retains the 135 pre-existing tracked files, runtime source closure and curated build/tests/docs: 388 inputs for MOTION203, retaining the 386 COPY202 inputs and adding the actual-owner regression plus the separately pinned public UI-delta fixture. The original 796-unit COPY202 fixture remains unchanged. Private/local evidence is excluded. New legitimate inputs require a reviewed inventory update. Never stage the workspace with an unrestricted add operation. `.gitignore` is convenience; the inventory is authoritative.

The fingerprint contract is `tools/private-text-fingerprints.json`, cross-checked against the existing denylist. It preserves 15 known blocked phrases without their plaintext. A policy update needs reviewed schema/count/checksum, negative tests and private-source equivalence verification performed outside public artifacts. Never regenerate it from an empty private upload folder and thereby erase retired protections.

## Release procedure

1. Install with the README command; run the documented current-owner, private, production, release, repository and mounted checks from a clean checkout.
2. Review source diffs, assets, licensing, localized copy and native UI evidence. If intentional runtime changes exist, update `docs/release-baseline.json` only after review; rerun build/byte checks.
3. Keep the prior approved output/manifest for rollback. Rollback must preserve the server boundary and must never restore retired credentials or experimental payloads.
4. Review the curated Git inventory and push a review branch/draft PR only when authorized. Existing Pages publication from `main:/` is distinct from this branch; a main merge may publish it.
5. For the authorized `pinexen.com/mhalmaghawry/` mount and canonicalizing `www` alias, rebuild/check the isolated Cloudflare target and use only its generated Wrangler config. Never use the source root or the whole `cloudflare/` directory as an asset binding. Review the exact four route patterns, preserve the company origin and keep private bindings unset until separately configured. Verify actual hosted behavior before declaring release complete. Root-mode `dist` remains a separate Pages/local target.
