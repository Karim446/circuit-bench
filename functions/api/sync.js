// Cloudflare Pages Function: POST /api/sync
// Stores one JSON document per sync id (a SHA-256 hash of the user's sync code) in D1.
// Each section ({ts, data}) is merged last-write-wins by timestamp.
const SECTIONS = new Set(["stats", "progress", "py", "wb"]);
const MAX_BODY = 1_500_000;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function ensureTable(db) {
  await db
    .prepare("CREATE TABLE IF NOT EXISTS sync (id TEXT PRIMARY KEY, doc TEXT NOT NULL, updated INTEGER NOT NULL)")
    .run();
}

async function load(db, id) {
  try {
    return await db.prepare("SELECT doc FROM sync WHERE id = ?").bind(id).first();
  } catch (e) {
    if (!/no such table/i.test(String(e))) throw e;
    await ensureTable(db);
    return null;
  }
}

export async function onRequestPost({ request, env }) {
  const db = env.DB;
  if (!db) return json({ error: "Sync storage isn't configured: add a D1 binding named DB." }, 500);

  const text = await request.text();
  if (text.length > MAX_BODY) return json({ error: "Too much data to sync (the whiteboard is probably very large)." }, 413);

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "Bad request." }, 400);
  }
  const id = String(body.id || "");
  if (!/^[0-9a-f]{64}$/.test(id)) return json({ error: "Bad sync id." }, 400);

  const row = await load(db, id);
  const stored = row ? JSON.parse(row.doc) : {};
  let changed = false;

  for (const [key, val] of Object.entries(body.sections || {})) {
    if (!SECTIONS.has(key) || !val || typeof val.ts !== "number") continue;
    if (!stored[key] || val.ts > stored[key].ts) {
      stored[key] = { ts: val.ts, data: val.data };
      changed = true;
    }
  }

  if (changed) {
    await ensureTable(db);
    await db
      .prepare(
        "INSERT INTO sync (id, doc, updated) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET doc = excluded.doc, updated = excluded.updated"
      )
      .bind(id, JSON.stringify(stored), Date.now())
      .run();
  }
  return json({ sections: stored });
}

export function onRequestGet() {
  return json({ ok: true, info: "POST your sync document here." });
}
