# Future Cloudflare release — not deployed

The current candidate is **208 runtime files / 97,434,877 bytes**, manifest SHA256 `8e1456a91f969cad5f699b3ffbda41cecec8d82626e6463c63b00b195cdb2452`. The future domain and Cloudflare resources/secrets are not configured. Existing metadata is preserved pending the actual domain; it is not certified as the final address.

The repository is public. Its legacy GitHub Pages source is `main:/`; merging there may publish the repository root. This review branch/draft PR is not a Cloudflare deployment, and GitHub Pages cannot execute the private Pages Worker. No deployment workflow is included.

## Build and inspect locally

Use Node 24+ (verified 24.18.0):

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm run check:private
npm run check:production
npm run check:release
node tools/serve-protected-preview.cjs 4179 dist
```

The portable fingerprint contract is a committed, checksummed build input; no experimental archive or private upload folder is required. `dist` is builder-owned and ignored by Git. Unknown/modified output files cause a refusal, not a broad cleanup. The complete tree must equal its manifest; every asset is below 25MiB and external rendering dependencies are absent. Local HTTP checks do not emulate Cloudflare compression, TLS, headers or redirects.

## Choose hosting only after authorization

For a later Git-integrated Pages project, explicitly select the repository root, a Node 24-compatible build environment, the reviewed check/build command and **dist** as output. Do not point hosting at the source root. Git integration can publish pushes after it is configured; control production/preview branches deliberately. See [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).

Alternatively, build locally and use Direct Upload. The future command is shown for review only and has not been run:

```sh
npx wrangler pages deploy dist --project-name <pages-project> --branch <review-branch>
```

Wrangler and dashboard drag-and-drop both support an output `_worker.js`; dashboard upload does not compile a `functions` directory. Explicitly supply the branch rather than inheriting Git context. The current documented per-file limit is 25MiB. [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [limits](https://developers.cloudflare.com/pages/platform/limits/).

## Server boundary

The builder emits the module Worker and `_routes.json` for `/api/previews/*`. Advanced mode requires public asset fallback through `env.ASSETS.fetch`, which the Worker implements. [Advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/).

The three public restricted identities are empty. Unset configuration intentionally returns 503; there is no client-valid credential or authored case payload. Before enabling later private access, provision private R2, D1/schema and fresh expiring project codes/session secret as described in [PRIVATE_PREVIEW_SETUP.md](server/PRIVATE_PREVIEW_SETUP.md). Configure both production and preview bindings deliberately; do not put secret values in Git, commands, logs or evidence. Uploading a Worker does not configure its resources. [Bindings](https://developers.cloudflare.com/pages/functions/bindings/).

## Hosted verification and rollback

Verify the actual domain/HTTPS, public 404, MIME/media seeking, configured auth denial and success, expiry/revocation/rate limits, range authorization, security headers and real cache responses. Private responses must remain no-store. Only hashed generated assets use immutable caching; mutable paths revalidate and the local effective-pattern test rejects overlapping cache rules. Host configuration files are instructions, not proof of applied headers. [Headers](https://developers.cloudflare.com/pages/configuration/headers/).

Keep the last approved output and manifest for rollback. Never roll back to retired credentials or formerly public experimental bodies. Current-source cleanup does not claim old Git history was scrubbed. A release requires independent QA and explicit deployment authorization; neither these instructions nor a source upload authorizes deployment.
