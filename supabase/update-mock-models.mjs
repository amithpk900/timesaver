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
  
  // Sample models from Khronos glTF-Sample-Models (hosted on modelviewer.dev for CORS friendliness)
  const models = [
    'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb'
  ];

  // Get all equipment
  const { rows: equipment } = await client.query('SELECT id FROM equipment');
  
  if (equipment.length === 0) {
    console.log('No equipment found in the database.');
    return;
  }

  // Update them in a round-robin fashion
  for (let i = 0; i < equipment.length; i++) {
    const url = models[i % models.length];
    await client.query('UPDATE equipment SET model_glb_url = $1 WHERE id = $2', [url, equipment[i].id]);
  }

  console.log(`Successfully updated ${equipment.length} equipment items with mock GLB models.`);
  await client.end();
}

main().catch(console.error);
