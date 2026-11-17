# Deploying Circuit Bench (Cloudflare Pages + D1)

Folder layout:

    circuit-bench/
      wrangler.toml          Pages config + D1 binding
      functions/api/sync.js  the sync API (runs on Cloudflare, same origin as the site)
      public/                everything that gets served (index.html, sw.js, py-worker.js, manifest, icons)

## One-time setup (PowerShell, inside the circuit-bench folder)

1. Create the database:

       npx wrangler d1 create circuit-bench

   Copy the `database_id` it prints into `wrangler.toml`.

2. Deploy:

       npx wrangler pages deploy

   (`wrangler.toml` tells it the project name, that `public` is the site, and to bind the database as `DB`.
   The table is created automatically on the first sync.)

If your Pages project has a different name, change `name` in `wrangler.toml` to match.

## Every update after that

       npx wrangler pages deploy

## Notes

- Sync and offline mode need https, so test them on the deployed site, not by opening the file locally.
- If you'd rather click than type: Pages project → Settings → Bindings → add a D1 binding named `DB`.
- D1 free tier: 5 million reads and 100,000 writes per day. Sync batches changes, so normal use is a few hundred writes a day at most.
