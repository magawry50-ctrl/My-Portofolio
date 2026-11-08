# Cloudflare private-preview setup — configuration pending

This is a setup contract, not a deployment record. Do not publish while `server/private-preview-policy.json` is pending or the final QA gate has not passed. Never upload the repository, historical baselines or private sibling folder as public static assets.

## Required bindings and settings

Use Cloudflare Pages advanced mode. The final verified public output includes `_worker.js` and `_routes.json`; the latter sends `/api/previews/*` through the Worker. The code uses:

| Binding / setting | Required value |
|---|---|
| `PRIVATE_PREVIEWS` | Private R2 bucket binding; disable r2.dev/public bucket access |
| `PREVIEW_DB` | D1 database binding with `private-preview-schema.sql` applied |
| `PREVIEW_SESSION_SECRET` | Newly generated high-entropy secret, at least 32 characters; use random bytes rather than a phrase |
| `PREVIEW_CODE_CLASSIFIED_VAULT` | Newly issued six-digit server secret |
| `PREVIEW_CODE_CLASSIFIED_VAULT_EXPIRES_AT` | Absolute UTC ISO timestamp, unexpired and no more than 30 minutes away when unlocking |
| `PREVIEW_CODE_VSCCD` | Newly issued six-digit server secret |
| `PREVIEW_CODE_VSCCD_EXPIRES_AT` | Same short-window rule, scoped to VSCCD |
| `PREVIEW_CODE_LB_127` | Newly issued six-digit server secret |
| `PREVIEW_CODE_LB_127_EXPIRES_AT` | Same short-window rule, scoped to LB 127 |

Provision these through runtime secret/settings management; never place values in HTML, JavaScript, `.env` committed to Git, shell output, reports or screenshots. Never reuse the retired client code. These are short-lived bearer preview codes, not person identity authentication or an authenticator-generated OTP system. When the code window ends, issue a fresh code and expiry through the server configuration if another viewing session is needed.

`server/private-preview-schema.sql` defines `preview_attempts` and `preview_sessions`, including the credential-version column. Apply it to a fresh configured database. If an earlier test schema exists, migrate/recreate that test database deliberately; do not overwrite a real database blindly. All SQL uses bound parameters in the Worker.

## Private objects

The user clarified that **all three previews are empty** and the former authored material was experimental. The current content contract is three `authored:false` JSON shells, zero localized values and zero media references. Experimental originals are local-only archival material and are not repository/build inputs. The committed fingerprint policy retains their known-text deny protection without carrying the prose. No real private content needs uploading now. Missing runtime configuration intentionally keeps the gate unavailable.

If preview access is configured later, upload the three empty objects as `previews/<allowlisted-project-id>/content.json` to the private binding. An `authored:false` object always returns generic unavailable content, ignoring any stale strings, result fields or media associations. All eight public cases and their media remain unchanged. Future authored private media may use the tested logical aliases `video-preview.mp4`, `video-preview.webm`, `video-detail.mp4`, `video-detail.webm`, `video-poster.webp`; those are capabilities, not existing private uploads. Configure correct object Content-Type metadata and verify authenticated seeking after any future real upload. Never make R2 publicly reachable.

## Revoke / rotate / verify

- Revoke every existing preview session with `DELETE FROM preview_sessions;` in the correct configured D1 database when required. This is an administrative instruction, not an action already performed.
- Changing a project's code or expiry, or the common session secret, changes its authorization version. Requests observing the new version delete incompatible sessions. Expired/revoked sessions cannot be restored by reusing their old cookie. Do not roll back to an old access secret as a deployment rollback shortcut.
- IP/project five and global twenty attempts per 15 minutes are strict, transactional limits. Global exhaustion temporarily denies legitimate visitors too; this availability trade-off is intentional.
- Verify unauthorized, expired, wrong-project and revoked content/media requests are denied with no-store headers; verify valid access after real bindings exist. Confirm the five media aliases and byte-range behavior, current six-input focus/paste/close, and neutral empty-case messaging. Do not record an actual access value or session cookie in evidence.
- Dashboard drag-and-drop and Wrangler Direct Upload can include an advanced-mode `_worker.js`; that does not configure secrets, D1 or R2 by itself. Upload **only the final verified dist**. No deployment is authorized by this document.

References: [Pages advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/), [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Direct Upload Worker support](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Pages headers](https://developers.cloudflare.com/pages/configuration/headers/).
