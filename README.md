# Mohamed Al Maghawry — portfolio

Bilingual English/Arabic portfolio with Identity, Impact and Opportunities views. The site uses native HTML/CSS/JavaScript, local fonts and media, and a pinned Tailwind 3 build. There is no client framework or external rendering dependency.

## Run and verify

Use Node **24 or newer**; the security fixtures use Node's SQLite module. The verified development runtime is Node 24.18.0.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm run check:private
npm run check:production
npm run check:release
npm run preview:production
```

The last command serves the clean build at `http://127.0.0.1:4179`. Private API configuration is deliberately unset there: unavailable 503 responses are expected. For source UI development, use `npm run preview:source` at port 4175. These local servers do not prove Cloudflare TLS, caching or configured authorization.

`dist/` is the root-mode Pages/local-review output: **208 runtime files**, manifest SHA256 `56a796f0b1f609331ed9cbe920494cc85fb311df57cafbe8937691f3c88f4ce0`. The authorized Cloudflare target is instead the isolated Workers Assets package for `https://pinexen.com/mhalmaghawry/`:

```sh
npm run build:cloudflare
npm run check:cloudflare
npm run preview:cloudflare
```

The preview is `http://127.0.0.1:4180/mhalmaghawry/`. Its company-root passthrough is represented by a local 404 marker. The generated `cloudflare/public/` contains only 203 public runtime assets; the Worker/config and bundle manifest sit outside that asset binding. Deploy through the generated config, never by treating the entire repository or bundle directory as public assets. See the deployment guide before any external action.

The published UI release from source commit `114c815` has mounted manifest `1336cf39c7c1db8f97eafd6d45b33c507e6a131d95a4cf6dcfb2c31565aca084`. It includes the approved Arabic review, phone readability/hit-target repairs, activation-scoped capability replay, sampled Identity-card materials and matching collaboration-card headers. The operator published it as Worker version `9c1452be-e25f-4e83-a734-b1a16edf1d6f`. Independent bounded hosted QA approved this version: all six changed public files exactly match the reviewed export; the 197 unchanged public assets were checked by manifest comparison and were not fetched individually again. Alias, media Range/HEAD, source-denial, private503 and company-origin checks passed. Operator native review passed the requested www route, Arabic RTL, Day/Night switching and collaboration-card layout without horizontal overflow or console warnings/errors.

The builders also refresh hashed utility CSS, its license notice, index/404 stylesheet links, `tools/styles-manifest.json` and local reports. Owned-output cleanup/refusal is restricted to their verified `dist/` and `cloudflare/` paths. Repeated builds must be deterministic. Generated outputs, dependencies, local secrets, experimental archives and historical UI evidence are not repository inputs. `.gitattributes` preserves exact bytes across Git checkouts, including existing line endings.

## Documentation

- [Architecture and ownership](docs/ARCHITECTURE.md)
- [Maintenance, checks and release review](docs/MAINTENANCE.md)
- [Current release changes](docs/CHANGELOG.md)
- [Private-preview configuration](server/PRIVATE_PREVIEW_SETUP.md)
- [Cloudflare mount and release](DEPLOYMENT_GUIDE_CLOUDFLARE.md)

The three locked project identities are public, but their previews are intentionally empty. The server boundary is future-ready; missing bindings/secrets deny access. No real private payload or usable credential belongs in this public repository. Known retired experimental text is blocked by a portable fingerprint policy, not uploaded as build input. This does not claim historical Git data has been scrubbed.

## Publication and rights

This update is maintained on `codex/portfolio-performance-arabic`. The existing repository has legacy GitHub Pages publication from `main:/`; merging to that branch may publish the root. A source push remains separate from Cloudflare deployment. Worker `pinexen-portfolio` version `9c1452be-e25f-4e83-a734-b1a16edf1d6f` is deployed for `pinexen.com/mhalmaghawry/`, with `/founder` aliases and canonicalizing `www` routes. Its root and mounted manifest identities are recorded above. Independent hosted QA and the bounded operator native review approved this exact release. The earlier version `99f74d2a-7d5d-4c2d-ba8b-01c91d4e8a15` has separate bounded acceptance recorded in the deployment guide; those results are not reused as proof for the new release. This is not a field performance or uptime guarantee. No automatic deployment workflow is included. Private bindings/secrets remain deliberately unconfigured.

No project-wide reuse license is granted here. Photos, logos, user-supplied artwork and third-party assets have their respective rights; public visibility does not grant permission to reuse them. Existing font/icon/Tailwind license notices are retained beside their assets.
