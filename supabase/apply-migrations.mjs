#!/usr/bin/env node
// ============================================================
// apply-migrations.mjs
// Applies all SQL migrations to Supabase via direct Postgres connection.
// Usage:  node supabase/apply-migrations.mjs <DB_PASSWORD>
//     or: SUPABASE_DB_PASSWORD=xxx node supabase/apply-migrations.mjs
// ============================================================

import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const { Client } = pg;

const PROJECT_REF = 'vkwwpuyvzmqqrqejkuvg';
const DB_PASSWORD  = process.env.SUPABASE_DB_PASSWORD || process.argv[2];

if (!DB_PASSWORD) {
  console.error('\nUsage:  node supabase/apply-migrations.mjs <DB_PASSWORD>');
  console.error('  or:   SUPABASE_DB_PASSWORD=xxx node supabase/apply-migrations.mjs\n');
  console.error('Find your DB password in:');
  console.error('  Supabase Dashboard → Project Settings → Database → Connection string\n');
  process.exit(1);
}

const __dir = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS = [
  '20260710000001_schema.sql',
  '20260710000002_rls.sql',
  '20260710000003_seed.sql',
];

const client = new Client({
  host:     `db.${PROJECT_REF}.supabase.co`,
  port:     5432,
  database: 'postgres',
  user:     'postgres',
  password: DB_PASSWORD,
  ssl:      { rejectUnauthorized: false },
});

async function run() {
  console.log(`\n━━━ Karnataka Study App — Applying Migrations ━━━`);
  console.log(`→ Connecting to db.${PROJECT_REF}.supabase.co …`);

  await client.connect();
  console.log('✓ Connected\n');

  for (const file of MIGRATIONS) {
    const path = join(__dir, 'migrations', file);
    const sql  = readFileSync(path, 'utf-8');
    process.stdout.write(`→ ${file} … `);
    try {
      await client.query(sql);
      console.log('✓ done');
    } catch (err) {
      console.error(`\n✗ FAILED: ${err.message}`);
      await client.end();
      process.exit(1);
    }
  }

  console.log('\n✅ All migrations applied successfully!\n');
  await client.end();
}

run().catch(async (err) => {
  console.error('Fatal connection error:', err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
