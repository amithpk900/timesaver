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
  const emails = ['verify_student_opt@gmail.com', 'verify_student_opt_2@gmail.com'];
  for (const email of emails) {
    console.log(`Confirming user: ${email}...`);
    const res = await client.query(
      `UPDATE auth.users 
       SET email_confirmed_at = now(), 
           last_sign_in_at = now()
       WHERE email = $1`,
      [email]
    );
    console.log(`Updated ${res.rowCount} row(s).`);
  }
  await client.end();
}

main().catch(console.error);
