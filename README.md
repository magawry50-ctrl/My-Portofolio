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

`dist/` is the only deployable output. The build also refreshes hashed utility CSS, its license notice, the index/404 stylesheet links, `tools/styles-manifest.json` and a local build report. Owned-output cleanup/refusal is restricted to `dist/`. Its reviewed baseline contains **208 runtime files**, manifest SHA256 `8e1456a91f969cad5f699b3ffbda41cecec8d82626e6463c63b00b195cdb2452`. Repeat builds must be deterministic. `dist`, dependencies, local secrets, experimental archives and historical UI evidence are not repository inputs. `.gitattributes` preserves exact bytes across Git checkouts, including existing line endings.

## Documentation

- [Architecture and ownership](docs/ARCHITECTURE.md)
- [Maintenance, checks and release review](docs/MAINTENANCE.md)
- [Current release changes](docs/CHANGELOG.md)
- [Private-preview configuration](server/PRIVATE_PREVIEW_SETUP.md)
- [Future Cloudflare release](DEPLOYMENT_GUIDE_CLOUDFLARE.md)

The three locked project identities are public, but their previews are intentionally empty. The server boundary is future-ready; missing bindings/secrets deny access. No real private payload or usable credential belongs in this public repository. Known retired experimental text is blocked by a portable fingerprint policy, not uploaded as build input. This does not claim historical Git data has been scrubbed.

## Publication and rights

This update is prepared on `codex/portfolio-performance-arabic` for review. The existing repository has legacy GitHub Pages publication from `main:/`; merging to that branch may publish the root. Do not treat a source push or draft PR as a Cloudflare deployment. The future domain and Cloudflare configuration remain pending; no deployment workflow is included.

No project-wide reuse license is granted here. Photos, logos, user-supplied artwork and third-party assets have their respective rights; public visibility does not grant permission to reuse them. Existing font/icon/Tailwind license notices are retained beside their assets.
