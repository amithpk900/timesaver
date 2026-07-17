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
  
  // Find the user by email
  const { rows } = await client.query(`
    SELECT id FROM auth.users WHERE email = 'verify_student_opt_2@gmail.com';
  `);
  
  if (rows.length === 0) {
    console.log('Test user not found.');
  } else {
    const userId = rows[0].id;
    await client.query(`
      UPDATE profiles SET is_admin = true WHERE id = $1;
    `, [userId]);
    console.log('Successfully updated is_admin to true for user: verify_student_opt_2@gmail.com');
  }

  await client.end();
}

main().catch(console.error);
