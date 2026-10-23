# Cloudflare release — scoped portfolio mount

The authorized target is **https://pinexen.com/mhalmaghawry/**. The bare `/mhalmaghawry`, `/founder` and `/founder/` normalize to that address with the query retained. Hash navigation and language queries continue within the mount.

## Hosting handover — bounded hosted acceptance approved

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

The original `dist/` remains the separate root-mode Pages/local build. Its 208-file reviewed manifest is `b078c71ee44370259b7d16456f228d6d6749583f4d8932e75c3c2237268a177b`. The mounted bundle has its own manifest at `cloudflare/bundle-manifest.json`. Both are deterministic; neither generated folder is committed.

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

Keep the deployed version above and both reviewed manifests as the release reference. For a future regression, the operator can select a previously approved Worker deployment; for this initial publication, removing **only the four portfolio routes** restores origin handling. Do not create a root catch-all or substitute the source repository as an asset directory. A failed future release should roll back to a known approved version, never to retired credentials or experimental bodies. Preserve company-origin ownership; a proxy-mode reversal is an operator decision after checking other dependencies.

The public Git repository has legacy GitHub Pages publication from `main:/`; that remains independent and cannot execute this Workers setup. No automatic deployment workflow is added. Current-source cleanup does not claim old Git history was scrubbed.
