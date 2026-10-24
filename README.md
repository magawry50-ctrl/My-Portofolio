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

`dist/` is the root-mode Pages/local-review output: **209 runtime files**, manifest SHA256 `1d9ed7dab2ee88a9dbaac23a287990ec7b20e6ff8b410fd942ad6f47e007c2c1`. The authorized Cloudflare target is instead the isolated Workers Assets package for `https://pinexen.com/mhalmaghawry/`:

```sh
npm run build:cloudflare
npm run check:cloudflare
npm run preview:cloudflare
```

The preview is `http://127.0.0.1:4180/mhalmaghawry/`. Its company-root passthrough is represented by a local 404 marker. The generated `cloudflare/public/` contains only 204 public runtime assets; the Worker/config and bundle manifest sit outside that asset binding. Deploy through the generated config, never by treating the entire repository or bundle directory as public assets. See the deployment guide before any external action.

MOT186/TYPE187, source commit `77cabe2064c90e61032a08168998ef4b802bf193`, is published as Worker version `5b5e7be9-a17a-4335-8b85-2389cad2cf87`. The operator uploaded two static files (index and typography CSS) and reused 202 unchanged assets. Explicit Concepts/Interests controls use a finite owner-local glide while native vertical scrolling stays direct; English text consistently uses the existing Inter variable font, Arabic retains Almarai, ordinary offer text has a 16px floor and footer actions have 44px targets. Independent source/lifecycle and bounded prepublication native review approved the release candidate. That native pass retained one-line desktop offer headers, confirmed readable profile leading/settled weight and checked phone layout/end-card navigation. Reflow at 720px was measured; actual 200% browser zoom was not established, and no FPS or field Core Web Vitals result is claimed. The root manifest is `1d9ed7dab2ee88a9dbaac23a287990ec7b20e6ff8b410fd942ad6f47e007c2c1`; the mounted manifest is `4aa0847ae51e30b5d0963d2fea519a5834a47104cc214dc22d4c9a4d2afdb84a` (204 public assets/208 bundle files). The source inventory retains all 381 previous inputs and adds only the typography stylesheet and actual-owner carousel test, for 383 inputs. The new stylesheet has the same mutable-CSS revalidation policy in root headers and the mounted owner. The exact 383-input locked-install export passed all ten current suites and the 204-asset local mounted HTTP gate, with no source-byte drift. Independent bounded hosted QA approved both changed files by exact mounted-export bytes/SHA256 and revalidation policy, both queried www/founder 308 aliases and unchanged company-origin baselines. Published native review passed EN Day at 1440px and AR Night at 320px: correct existing font families, 16–17.76px narrative, 44px actions, one-line desktop offer headers and no horizontal overflow. Published Concepts samples moved continuously through offsets 392→582→676.5→731.5→765.5 with matching page progress, moving→idle state and no overflow; browser warnings/errors were empty. The 202 unchanged assets were not individually fetched again, and prior server/Range/private matrices were not rerun for this unchanged boundary. These bounded checks do not establish physical Safari behavior, actual 200% zoom, FPS, field Core Web Vitals, uptime or universal rendering.

COL185, source commit `5822a71`, is published as Worker version `b108ffac-dfc0-4f08-9671-af53cce97bb0`. It gives both collaboration headers the full card width while preserving the body measure. Its mounted manifest is `73005de304c96530ba5c78a68ba76cc5b1cd2c1b099f55d0f63ed513e2b0a6d1` (203 public assets/207 bundle files). Existing current-owner checks and the 381-input clean-export install/build/release gate passed. Independent bounded hosted QA approved exact served bytes for both changed files (mounted HTML and utility CSS), queried www/founder canonical 308 redirects and both company-origin baselines. Operator live review verified both titles and their own metadata on one line in EN Day at 1440px and 1024px and AR Night at 1440px, with no horizontal overflow; the original body widths of 300.4375px and 221.84375px were retained. The 201 unchanged assets were not individually fetched again, and earlier server/Range/private matrices were not rerun. These checks do not establish physical Safari behavior, field Core Web Vitals, universal rendering or uptime.

The published MOB184 release, source commit `7f8d89e`, fixes only phone Interests-header wrapping/focus-paint space; its mounted manifest is `da142fcbe65997addc02f1993314a98b3d45b04a411607e222e06fba53a6b8d9`. The operator published Worker version `f91ad5e7-01eb-493f-ba1a-b350befa36c2`, uploading two static files and reusing 201 unchanged assets. The baseline audit recorded 96 anchor checkpoints and one confirmed arrow-clipping defect; all eight 320/390px EN/AR Day/Night confirmation combinations passed, including the measured 6px focus-paint reserve. Current-owner checks and the 380-input clean-export gate passed. Independent bounded hosted QA approved both changed files by exact served bytes and canonical www/founder queries; operator live review passed all eight phone states with 44px controls, full 6px focus paint, fitting navigation and no horizontal overflow. The 201 unchanged assets were not individually fetched again, and the prior Range/private matrix was not rerun; these viewport checks do not establish physical Safari behavior or field Core Web Vitals.

The preceding published UI release from source commit `114c815` has mounted manifest `1336cf39c7c1db8f97eafd6d45b33c507e6a131d95a4cf6dcfb2c31565aca084`. It includes the approved Arabic review, phone readability/hit-target repairs, activation-scoped capability replay, sampled Identity-card materials and matching collaboration-card headers. The operator published it as Worker version `9c1452be-e25f-4e83-a734-b1a16edf1d6f`. Independent bounded hosted QA approved this version: all six changed public files exactly match the reviewed export; the 197 unchanged public assets were checked by manifest comparison and were not fetched individually again. Alias, media Range/HEAD, source-denial, private503 and company-origin checks passed. Operator native review passed the requested www route, Arabic RTL, Day/Night switching and collaboration-card layout without horizontal overflow or console warnings/errors.

The builders also refresh hashed utility CSS, its license notice, index/404 stylesheet links, `tools/styles-manifest.json` and local reports. Owned-output cleanup/refusal is restricted to their verified `dist/` and `cloudflare/` paths. Repeated builds must be deterministic. Generated outputs, dependencies, local secrets, experimental archives and historical UI evidence are not repository inputs. `.gitattributes` preserves exact bytes across Git checkouts, including existing line endings.

## Documentation

- [Architecture and ownership](docs/ARCHITECTURE.md)
- [Maintenance, checks and release review](docs/MAINTENANCE.md)
- [Current release changes](docs/CHANGELOG.md)
- [Private-preview configuration](server/PRIVATE_PREVIEW_SETUP.md)
- [Cloudflare mount and release](DEPLOYMENT_GUIDE_CLOUDFLARE.md)

The three locked project identities are public, but their previews are intentionally empty. The server boundary is future-ready; missing bindings/secrets deny access. No real private payload or usable credential belongs in this public repository. Known retired experimental text is blocked by a portable fingerprint policy, not uploaded as build input. This does not claim historical Git data has been scrubbed.

## Publication and rights

This update is maintained on `codex/portfolio-performance-arabic`. The existing repository has legacy GitHub Pages publication from `main:/`; merging to that branch may publish the root. A source push remains separate from Cloudflare deployment. Worker `pinexen-portfolio` version `5b5e7be9-a17a-4335-8b85-2389cad2cf87` is deployed for `pinexen.com/mhalmaghawry/`, with `/founder` aliases and canonicalizing `www` routes. Its published source and mounted identity are recorded in the MOT186/TYPE187 checkpoint above. Independent bounded hosted QA and operator published native review approved this exact version as recorded above. The prior COL185 version `b108ffac-dfc0-4f08-9671-af53cce97bb0` retains its separately recorded bounded approval. The prior MOB184 version `f91ad5e7-01eb-493f-ba1a-b350befa36c2` retains its separate bounded approval. The earlier versions `9c1452be-e25f-4e83-a734-b1a16edf1d6f` and `99f74d2a-7d5d-4c2d-ba8b-01c91d4e8a15` have separate bounded acceptance recorded in the deployment guide; those results are not reused as proof for the new release. This is not a field performance or uptime guarantee. No automatic deployment workflow is included. Private bindings/secrets remain deliberately unconfigured.

No project-wide reuse license is granted here. Photos, logos, user-supplied artwork and third-party assets have their respective rights; public visibility does not grant permission to reuse them. Existing font/icon/Tailwind license notices are retained beside their assets.
