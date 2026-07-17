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
  ssl:      { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const sql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '20260710000005_lab_progress.sql'), 'utf-8');
  await client.query(sql);
  console.log('Lab progress migration applied successfully.');
  
  // Update full-migration.sql as well
  const fullSqlPath = path.join(process.cwd(), 'supabase', 'full-migration.sql');
  if (fs.existsSync(fullSqlPath)) {
    fs.appendFileSync(fullSqlPath, '\n\n' + sql);
    console.log('Appended to full-migration.sql');
  }
  
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
