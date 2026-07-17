import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host:     'db.vkwwpuyvzmqqrqejkuvg.supabase.co',
  port:     5432,
  database: 'postgres',
  user:     'postgres',
  password: '9090amithpk!',
  ssl:      { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase DB');
  
  const sqlFile = path.join(process.cwd(), 'supabase', 'migrations', '20260710000004_storage.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  try {
    await client.query(sql);
    console.log('Successfully applied storage migration!');
  } catch (e) {
    console.error('Failed to apply migration:', e);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
