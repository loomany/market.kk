/**
 * Apply supabase/migrations/*.sql to production DB (DATABASE_URL matching NEXT_PUBLIC_SUPABASE_URL).
 * One-off ops script — not part of app runtime.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const key = t.slice(0, eq);
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function resolveDatabaseUrl(env) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const ref = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) throw new Error("NEXT_PUBLIC_SUPABASE_URL missing or invalid");

  // Parse all DATABASE_URL lines from .env.local (last duplicate may point at another project)
  const envPath = path.join(root, ".env.local");
  const dbUrls = [];
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      if (line.startsWith("DATABASE_URL=")) {
        let val = line.slice("DATABASE_URL=".length).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (val && !val.includes("[YOUR-PASSWORD]")) dbUrls.push(val);
      }
    }
  }
  const matchingUrl = dbUrls.find((u) => u.includes(ref));
  if (matchingUrl) return matchingUrl;

  const host = env.DB_HOST?.includes(ref)
    ? env.DB_HOST
    : `db.${ref}.supabase.co`;
  const user = env.DB_USER || "postgres";
  const password = env.DB_PASSWORD;
  const port = env.DB_PORT || "5432";
  const db = env.DB_NAME || "postgres";
  if (password) {
    const enc = encodeURIComponent(password);
    return `postgresql://${user}:${enc}@${host}:${port}/${db}`;
  }

  throw new Error(
    `No DATABASE_URL for project ref ${ref}. Set DATABASE_URL or DB_PASSWORD in .env.local`
  );
}

async function main() {
  const env = loadEnvLocal();
  const databaseUrl = resolveDatabaseUrl(env);
  const ref = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  console.log(`Project ref: ${ref}`);

  const pg = (await import("pg")).default;
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const diag = await client.query(`
    select
      exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'profiles') as profiles,
      exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'user_token_balances') as user_token_balances,
      exists (select 1 from pg_proc where proname = 'credit_purchased_tokens') as credit_purchased_tokens;
  `);
  console.log("Before:", diag.rows[0]);

  const migrationsDir = path.join(root, "supabase/migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let hasHistory = false;
  try {
    await client.query(
      "select 1 from supabase_migrations.schema_migrations limit 1"
    );
    hasHistory = true;
  } catch {
    hasHistory = false;
  }

  for (const file of files) {
    const version = file.replace(/^(\d+).*/, "$1");
    const name = file.replace(/^\d+_/, "").replace(/\.sql$/, "");

    if (hasHistory) {
      const { rows } = await client.query(
        "select 1 from supabase_migrations.schema_migrations where version = $1",
        [version]
      );
      if (rows.length > 0) {
        console.log(`Skip (already in schema_migrations): ${file}`);
        continue;
      }
    }

    const sqlPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log(`Applying: ${file} ...`);
    try {
      await client.query(sql);
      if (hasHistory) {
        await client.query(
          `insert into supabase_migrations.schema_migrations (version, name)
           values ($1, $2) on conflict (version) do nothing`,
          [version, name]
        );
      }
      console.log(`OK: ${file}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists") && file.includes("stage2")) {
        console.warn(`Partial ${file} (objects exist) — recording migration if possible`);
        if (hasHistory) {
          await client.query(
            `insert into supabase_migrations.schema_migrations (version, name)
             values ($1, $2) on conflict (version) do nothing`,
            [version, name]
          );
        }
      } else {
        throw err;
      }
    }
  }

  const after = await client.query(`
    select
      exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'profiles') as profiles,
      exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'user_token_balances') as user_token_balances,
      exists (select 1 from pg_proc where proname = 'credit_purchased_tokens') as credit_purchased_tokens;
  `);
  console.log("After:", after.rows[0]);

  if (hasHistory) {
    const hist = await client.query(
      "select version, name from supabase_migrations.schema_migrations order by version"
    );
    console.log("schema_migrations:", hist.rows);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
