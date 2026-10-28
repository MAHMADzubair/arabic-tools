# QEMLO — Owner Sign In (MFA)

**Production access is fail-closed until a private owner identity, password, authenticator seed and database are configured and verified.**

## User experience

- Public navigation has **no admin link**; public user profile remains informational.
- Owner-only entry URL: `/owner-access` (bookmark the exact URL privately).
- Legacy `/admin/login` redirects to `/owner-access` for existing bookmarks.
- The URL itself is not a secret or an authorization boundary; email, password, MFA, database-backed sessions and rate limits remain mandatory.
- The login form requires **owner email + secret password + 6-digit TOTP from an authenticator app**.
- Successful sign-in creates the existing server-side Supabase admin session (HttpOnly cookie); unsuccessful and rate-limited requests do not.
- Public calculators remain registration-free. Knowledge of the URL is not sufficient for access.

## Owner-only secrets (never commit, paste in a chat, screenshot or logs)

Configure server-only environment variables with appropriate Vercel environment scoping (test in protected preview first):

| Variable | Requirement |
| --- | --- |
| `ADMIN_LOGIN_EMAIL` | The private owner email address |
| `ADMIN_SECRET` | NEW unique randomly generated password of at least 24 characters; rotate prior compromised value |
| `ADMIN_TOTP_SECRET` | 20 or more random bytes encoded as RFC 4648 Base32 (at least 32 chars) |
| `ADMIN_MFA_ENABLED` | Exactly `true` **only after** enrollment and QA |
| `SUPABASE_URL` | Correct dedicated Supabase project endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Correct server-only Supabase service-role key, never `NEXT_PUBLIC_` |

Do not use a staging service key in production, or production secrets in a preview environment.

### Generating the authenticator seed locally

Use a trusted local terminal, offline if preferred, with Node.js. Avoid command history entries containing actual secret values.

```javascript
// Save to a private temporary .mjs file outside the repo; delete it securely afterwards.
import { randomBytes } from "node:crypto";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const bytes = randomBytes(20);
let bits = 0, buffer = 0, base32 = "";
for (const byte of bytes) {
  buffer = (buffer << 8) | byte;
  bits += 8;
  while (bits >= 5) {
    bits -= 5;
    base32 += alphabet[(buffer >>> bits) & 31];
  }
}
if (bits) base32 += alphabet[(buffer << (5 - bits)) & 31];
process.stdout.write(base32 + "\n");
```

The resulting 32-character seed must be added as a **time-based setup key** to the owner's authenticator application and also stored in `ADMIN_TOTP_SECRET` on the appropriate server environment. Label the account "QEMLO Owner". Store a recovery copy of the setup key in an encrypted password manager, never in GitHub.

Generate a separate random 32+ character admin password with a password manager or cryptographically secure local generator. The old value previously reported in chat must not be reused.

### Database prerequisites

The existing migration `supabase/migrations/002_admin_sessions.sql` defines the session table and atomic login-rate-limit RPC. Verify the schema and service-role permissions in an isolated staging database, including session expiry, revocation and rate limiting. This guide **does not authorize executing migration scripts against production**.

### Pre-activation QA

Test through a protected Vercel preview with separately configured staging secrets and database:
- The owner bookmark opens `/owner-access`, and the public profile/mobile menu contains no admin link.
- Invalid email, password or authenticator code is rejected.
- Missing MFA config returns an unavailable status; no session cookie issued.
- Valid email + password + TOTP creates a session and reaches `/admin`.
- Expired or revoked sessions cannot open any protected route.
- Five attempts per 15-minute window enforce atomic rate limiting.
- Logout revokes the DB session and clears the cookie.
- Public website, calculator pages, SEO, and ad tags remain unchanged; private login metadata is noindex.
- Secure, HttpOnly, SameSite cookies; no secrets in logs or client bundles.

Only after this verification should the owner enable the production environment variables, including `ADMIN_MFA_ENABLED=true`, and authorize production access. Redeploy if Vercel requires it for changed environment variables. A successful build alone does not prove authenticated browser behavior.

## Emergency access

Do not create a password-only fallback. If the authenticator device is lost, deny access and use the hosting provider's securely authenticated account controls to rotate the TOTP seed and enroll a new authenticator after verifying ownership. Back up seed material securely beforehand.

**No production secrets or migrations are created by this change.**

## Preview rollout — private owner link

Changes remain in draft PR #21 until reviewed. Validate the new `/owner-access` route in the latest feature-branch Preview deployment before merging. The feature intentionally does not create a separate Vercel project or configure `admin.qemlo.com` DNS. If a dedicated subdomain is wanted, add it separately through Vercel Domains + DNS after staging auth QA. A new URL does not fix missing/invalid Preview environment variables; keep the server-side MFA readiness gate fail-closed.
