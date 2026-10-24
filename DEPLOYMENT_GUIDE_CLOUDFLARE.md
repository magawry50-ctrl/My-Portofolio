# Cloudflare release — scoped portfolio mount

The authorized target is **https://pinexen.com/mhalmaghawry/**. The bare `/mhalmaghawry`, `/founder` and `/founder/` normalize to that address with the query retained. Hash navigation and language queries continue within the mount.

## Current hosting handover — MOB184 bounded acceptance approved

The operator published source commit **`7f8d89e`** as Worker **`pinexen-portfolio`**, version **`f91ad5e7-01eb-493f-ba1a-b350befa36c2`**. Root manifest: `a3bc6aa5571111b8c498369071547fb06de189e07b1bd78e3089342535e50cb3`; mounted manifest: `da142fcbe65997addc02f1993314a98b3d45b04a411607e222e06fba53a6b8d9`. The deployment uploaded two changed static files (index and Interests CSS) and reused 201 unchanged assets.

The baseline mobile audit recorded 96 anchor checkpoints and one confirmed clipped-arrow defect. All eight 320/390px EN/AR Day/Night final combinations passed header wrapping/button bounds and the measured 6px focus reserve; desktop nowrap was unchanged. Existing current-owner checks and the 380-input staged/exported install/build/release gate passed. Independent read-only hosted QA approved both changed files by exact byte length/SHA256, plus canonical queried www and founder redirects. Operator live native review passed all eight 320/390px EN/AR Day/Night states: 44px buttons and their full 6px focus paint remain inside the section, the navigation fits and there is no horizontal overflow. The 201 unchanged assets were not individually fetched again, and the prior Range/private/HEAD matrix was not rerun for this unchanged server/route boundary. These bounded viewport checks do not establish physical Safari behavior, field Core Web Vitals, uptime or configured private authentication.

## Previous AR179–COL183 hosting handover — bounded acceptance approved

The operator published source commit **`114c815`** as Worker **`pinexen-portfolio`**, version **`9c1452be-e25f-4e83-a734-b1a16edf1d6f`**. The mounted manifest is `1336cf39c7c1db8f97eafd6d45b33c507e6a131d95a4cf6dcfb2c31565aca084`; the root-mode manifest is `56a796f0b1f609331ed9cbe920494cc85fb311df57cafbe8937691f3c88f4ce0`. The 380-input source closure and public/private boundary are unchanged by this documentation update. Independent hosted QA and the bounded operator native review approved this version. Publication does not establish field Core Web Vitals, uptime or configured private-authentication success.

Independent hosted verification passed:

- **Six changed public files** return 200 and match the reviewed clean export exactly: index, 404, capabilities CSS, mobile-reading CSS, Night CSS and hashed main utility CSS. The **197 unchanged public assets** match the manifest and were not individually fetched again.
- **Sixteen aliases across HTTP/HTTPS and apex/www**, plus the explicit trailing www mount, canonicalize with query values retained.
- **Three media cases** pass: exact bytes 1–9 with 206/Content-Range, unsatisfiable 416 with total length, and bodyless HEAD 200 with full length/Accept-Ranges.
- **Six private API checks** intentionally return 503/no-store across three identities and GET/HEAD; **three source/control paths** remain 404.
- **Two company-origin baselines** retain apex 301→www and the unchanged www 200 body.

Operator native review loaded the exact requested www URL through canonicalization and verified both bare 32px collaboration header icons, no header arrows, own metadata/footer actions, Arabic RTL and Day/Night switching. No horizontal overflow or console warnings/errors was observed in that bounded pass. This is not a universal rendering, field performance or uptime claim. Private bindings remain unset; no configured-authentication success is claimed.

## Previous hosting handover — bounded hosted acceptance approved

The operator deployed Worker **`pinexen-portfolio`**, version **`99f74d2a-7d5d-4c2d-ba8b-01c91d4e8a15`**. The deployed bundle is the reviewed mounted manifest `4bf5733024db3ea31340ca46a53798397a0f160f173133265f65c25a7971a9b0`.

The apex portfolio path has returned200 and its founder alias308 after deployment. Natural propagation completed for `www.pinexen.com`; the operator observed its canonical308 and the exact user URL loading the portfolio in a native browser. After the streaming correction was deployed, `brom-detail.mp4` Range`bytes=1-9` returned206,9bytes and `Content-Range: bytes 1-9/18538626`; an out-of-bounds range returned416,0bytes and `Content-Range: bytes */18538626`.

Independent hosted QA approved this exact version/bundle: **203/203 public asset HEADs,7 actual edge Range cases,16 aliases across both hosts,2 company-origin baselines,9 source/control404s,6 private503/no-store responses, and exact hosted HTML hash** passed. Native review also observed the portfolio through the requested `www` URL. This is bounded release acceptance, not a field Core Web Vitals, universal performance, uptime or configured-private-authentication claim.

The local checks below independently passed against the exact staged/exported bundle. They establish reproducibility and owner behavior, not edge propagation, hosted rendering, TLS/cache policy or complete production acceptance. Private resources and access values remain unconfigured; private API503 remains intentional.

## Build and review

Use Node 24+ (verified 24.18.0):

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build:cloudflare
npm run check:cloudflare
npm run check:private
npm run check:release
npm run preview:cloudflare
```

Review `http://127.0.0.1:4180/mhalmaghawry/`. The adapter executes the actual mounted Worker and private handler. It substitutes a local 404 marker for company-origin passthrough and leaves private bindings unset. It does not prove Cloudflare TLS, compression, caching, DNS or production authorization.

`cloudflare/public/` contains 203 allowlisted runtime assets. The generated `worker.mjs`, `mount-worker.mjs`, byte-identical private handler, `wrangler.jsonc` and bundle manifest stay **outside** the asset directory. The public binding excludes `_worker.js`, `_routes.json`, `_headers`, `_redirects`, robots, build manifests, source, tools, docs and private policy. Deploy using the generated config; do not upload the whole repository/bundle as static assets. The builder scans all output for retired confidential fingerprints and verifies the complete owned tree. Unknown/modified output files cause refusal. Every file is below 25 MiB; no external rendering dependency is introduced.

The original `dist/` remains the separate root-mode Pages/local build. The next COL185 candidate has root manifest `a17c93917de276a2c7f2cb9bd8da123d76bd1f6f4232dacb30b1644af4ff5b30` (208 files) and mounted manifest `73005de304c96530ba5c78a68ba76cc5b1cd2c1b099f55d0f63ed513e2b0a6d1`, at `cloudflare/bundle-manifest.json` (203 public assets/207 bundle files). It changes only collaboration-header/body structure and the generated stylesheet's obsolete-nowrap removal, and awaits native confirmation/publication. The current MOB184 publication and its bounded final approval are identified above. Both build targets are deterministic; neither generated folder is committed.

## Worker and route configuration

The generated config names `pinexen-portfolio` in the selected account, with an `ASSETS` binding to `./public`, `run_worker_first: true`, `html_handling: none`, and `not_found_handling: none`. `workers.dev` and preview URLs are disabled. The four routes are:

```text
pinexen.com/mhalmaghawry*
pinexen.com/founder*
www.pinexen.com/mhalmaghawry*
www.pinexen.com/founder*
```

The terminal wildcard is necessary to match query-bearing aliases. The wrapper validates the allowed host and exact mount/slash boundary; suffix lookalikes pass unchanged to the existing origin. Controlled `www` requests and HTTP requests on either production host redirect to the HTTPS apex canonical, preserving path/query; founder/bare aliases normalize to the canonical portfolio root. This HTTPS rule does not affect loopback previews or company/lookalike paths. It does not capture `/`, other company pages or root `/robots.txt`, and has no SPA fallback. Unknown HTTPS apex mounted paths receive the scoped 404. See [Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/), [Assets binding](https://developers.cloudflare.com/workers/static-assets/binding/) and [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).

Routes require the apex and `www` DNS records to be proxied. Preserve their current origin values and unrelated DNS/mail/security settings. Do not create an apex Worker Custom Domain or a catch-all route, which would change company-root ownership. The operator owns account/DNS changes and hosted verification.

For a later approved release, the operator can deploy from the repository using:

```sh
npx wrangler deploy --config cloudflare/wrangler.jsonc
```

This command is provided for the authorized operator; builds and checks never invoke it. The version recorded above was deployed separately by the operator. Validate the installed Wrangler/config against current official documentation before future use. [Wrangler deployment](https://developers.cloudflare.com/workers/wrangler/commands/#deploy), [configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).

## Metadata and company separation

Only mounted output rewrites canonical/OG/Twitter URLs and the approved `@mhalmaghawry` handle. Social images, manifest start/scope/id/icons, sitemap language alternatives and 404 home/font/style links are mount-scoped. Source root-mode previews retain their original routing and design.

The portfolio sitemap is `/mhalmaghawry/sitemap.xml`; the future company-root robots policy may reference it. A robots file under the mount would not replace standard root crawler policy, so no robots file is included in this mounted package. Company-root metadata and future hosting remain separate.

## Private boundary and response policy

The same protected handler owns `/mhalmaghawry/api/previews/*` after internal prefix stripping. The client derives this base from its own loaded script URL; there is no global base tag. Only allowlisted private media fields receive an output prefix. `__Host-preview-*` cookies retain **Path=/**, Secure, HttpOnly and SameSite=Strict; a scoped cookie Path would invalidate the `__Host-` contract.

All three public restricted identities are empty. Missing bindings/secrets intentionally return 503; there is no client-valid credential or authored private payload. This release provisions no R2/D1 resources, codes or secrets. Later configuration requires separate review of [PRIVATE_PREVIEW_SETUP.md](server/PRIVATE_PREVIEW_SETUP.md), including fresh expiring project codes, schema, private storage and sessions. Never put values in Git, commands, logs or evidence. Unset503 is not a claim of successful configured production authentication.

The wrapper applies public security headers and revalidation caching. Only generated content-hashed Tailwind CSS is immutable; mutable URLs revalidate. Private API responses retain their handler's no-store policy. Source `_headers` is not silently treated as a Workers configuration file; actual hosted headers must be checked after deployment.

The public asset wrapper has a streaming single-byte-range fallback when the Assets binding returns a full200 response. Trusted generated file sizes cover missing upstream length metadata. It preserves validators/cache policy, handles valid206 and unsatisfiable416, matches strong/date `If-Range` exactly, cancels unused streams and uses `FixedLengthStream` for known response lengths. It never buffers a complete video. Late ranges must stream/discard preceding chunks if the binding cannot seek; memory stays bounded, but this is not a claim of origin-level random access. Unsupported multipart ranges retain full200 behavior; encoded representations are not sliced using uncompressed sizes. See [Workers streaming](https://developers.cloudflare.com/workers/runtime-apis/streams/), [known response lengths](https://developers.cloudflare.com/workers/runtime-apis/response/#set-the-content-length-header) and [HTTP If-Range semantics](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.5). The measured hosted result above is distinct from the full independent acceptance checklist.

## Acceptance and rollback

Before declaring production complete, verify canonical/alias/query behavior, native hash and language routing, desktop/phone Day/Night layout, loader/media/font loading and media seeking, scoped 404, source/control denials, private503 with focus restoration, root-origin continuity, actual headers and actual cache responses. Local fixtures cannot establish field Core Web Vitals or Cloudflare behavior.

Keep the current MOB184 version/manifests as the approved release reference and retain the prior approved version for rollback. For a future regression, the operator can select a previously approved Worker deployment; for this initial publication, removing **only the four portfolio routes** restores origin handling. Do not create a root catch-all or substitute the source repository as an asset directory. A failed future release should roll back to a known approved version, never to retired credentials or experimental bodies. Preserve company-origin ownership; a proxy-mode reversal is an operator decision after checking other dependencies.

The public Git repository has legacy GitHub Pages publication from `main:/`; that remains independent and cannot execute this Workers setup. No automatic deployment workflow is added. Current-source cleanup does not claim old Git history was scrubbed.
