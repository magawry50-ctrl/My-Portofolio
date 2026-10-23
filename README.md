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

`dist/` is the root-mode Pages/local-review output: **208 runtime files**, manifest SHA256 `b078c71ee44370259b7d16456f228d6d6749583f4d8932e75c3c2237268a177b`. The authorized Cloudflare target is instead the isolated Workers Assets package for `https://pinexen.com/mhalmaghawry/`:

```sh
npm run build:cloudflare
npm run check:cloudflare
npm run preview:cloudflare
```

The preview is `http://127.0.0.1:4180/mhalmaghawry/`. Its company-root passthrough is represented by a local 404 marker. The generated `cloudflare/public/` contains only 203 public runtime assets; the Worker/config and bundle manifest sit outside that asset binding. Deploy through the generated config, never by treating the entire repository or bundle directory as public assets. See the deployment guide before any external action.

The builders also refresh hashed utility CSS, its license notice, index/404 stylesheet links, `tools/styles-manifest.json` and local reports. Owned-output cleanup/refusal is restricted to their verified `dist/` and `cloudflare/` paths. Repeated builds must be deterministic. Generated outputs, dependencies, local secrets, experimental archives and historical UI evidence are not repository inputs. `.gitattributes` preserves exact bytes across Git checkouts, including existing line endings.

## Documentation

- [Architecture and ownership](docs/ARCHITECTURE.md)
- [Maintenance, checks and release review](docs/MAINTENANCE.md)
- [Current release changes](docs/CHANGELOG.md)
- [Private-preview configuration](server/PRIVATE_PREVIEW_SETUP.md)
- [Cloudflare mount and release](DEPLOYMENT_GUIDE_CLOUDFLARE.md)

The three locked project identities are public, but their previews are intentionally empty. The server boundary is future-ready; missing bindings/secrets deny access. No real private payload or usable credential belongs in this public repository. Known retired experimental text is blocked by a portable fingerprint policy, not uploaded as build input. This does not claim historical Git data has been scrubbed.

## Publication and rights

This update is maintained on `codex/portfolio-performance-arabic`. The existing repository has legacy GitHub Pages publication from `main:/`; merging to that branch may publish the root. A source push remains separate from Cloudflare deployment. Worker `pinexen-portfolio` version `99f74d2a-7d5d-4c2d-ba8b-01c91d4e8a15` is deployed for `pinexen.com/mhalmaghawry/`, with `/founder` aliases and canonicalizing `www` routes. Independent bounded hosted QA approved the exact bundle, including203 public asset HEADs,7 edge Range cases, aliases/company-origin preservation, source denials, private503/no-store and HTML identity. See the hosting handover for exact scope; this is not a field performance or uptime guarantee. No automatic deployment workflow is included. Private bindings/secrets remain deliberately unconfigured.

No project-wide reuse license is granted here. Photos, logos, user-supplied artwork and third-party assets have their respective rights; public visibility does not grant permission to reuse them. Existing font/icon/Tailwind license notices are retained beside their assets.
