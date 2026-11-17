# Deploying Circuit Bench (Cloudflare Pages + D1)

## Normal use: push and it deploys

    git add -A
    git commit -m "what changed"
    git push

GitHub Actions (`.github/workflows/deploy.yml`) runs the tests, then `wrangler pages deploy`.
Watch it under the repo's **Actions** tab; a red X means the tests failed and nothing was deployed.

## One-time setup

1. **Database id.** Put your real D1 `database_id` in `wrangler.toml` (the same one you already
   use locally). To look it up: `npx wrangler d1 list`. First time ever: `npx wrangler d1 create circuit-bench`.
   The id is not a password; it is safe to commit.

2. **Cloudflare API token.** Cloudflare dashboard → My Profile → API Tokens → Create Token →
   Custom token with:
   - Account → Cloudflare Pages → Edit
   - Account → D1 → Edit
   Copy the token (shown once).

3. **Account id.** `npx wrangler whoami` prints it (also on the dashboard's Workers & Pages overview).

4. **GitHub secrets.** Repo → Settings → Secrets and variables → Actions → New repository secret:
   - `CLOUDFLARE_API_TOKEN` = the token from step 2
   - `CLOUDFLARE_ACCOUNT_ID` = the id from step 3

`name` in `wrangler.toml` must match your Pages project name, so the Action updates the existing
site (same address, same database) instead of creating a new one.

## Deploying by hand (still works)

    npx wrangler pages deploy

## Notes

- Sync and offline mode need https, so test them on the deployed site or with `npx wrangler pages dev`.
- The service worker fetches fresh files whenever you are online, so a deploy shows up on the next
  reload. No version number to bump.
- D1 free tier: 5 million reads and 100,000 writes per day. Sync batches changes, so normal use is
  a few hundred writes a day at most.
