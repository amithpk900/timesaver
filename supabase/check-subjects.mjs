import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vkwwpuyvzmqqrqejkuvg.supabase.co';
// We just need the anon key or service role to check data. 
// I'll just use a pg query since I have pg.
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
  const res = await client.query(`
    SELECT p.id, p.full_name, p.grade_id, p.stream_id, g.name as grade_name, 
           (SELECT count(*) FROM subjects s WHERE s.grade_id = p.grade_id AND s.stream_id IS NOT DISTINCT FROM p.stream_id) as matching_subjects,
           (SELECT count(*) FROM subjects) as total_subjects
    FROM profiles p 
    JOIN grades g ON p.grade_id = g.id
    WHERE p.full_name = 'Verification Student';
  `);
  console.log(res.rows);
  
  const subjects = await client.query('SELECT * FROM subjects');
  console.log("All subjects:", subjects.rows);
  
  await client.end();
}
main().catch(console.error);
