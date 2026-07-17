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
  
  // 1. Get a chapter (e.g. from SSLC Physics)
  const chaptersRes = await client.query(`
    SELECT c.id 
    FROM chapters c
    JOIN subjects s ON c.subject_id = s.id
    WHERE s.name = 'Physics'
    LIMIT 1;
  `);
  
  if (chaptersRes.rowCount === 0) {
    console.log('No Physics chapter found.');
    return;
  }
  
  const chapterId = chaptersRes.rows[0].id;

  // 2. Insert Equipment
  const equipRes = await client.query(`
    INSERT INTO equipment (name, description, thumbnail_url, model_glb_url)
    VALUES 
      ('Glass Prism', 'A triangular glass prism for light dispersion experiments', 'https://images.unsplash.com/photo-1549646452-fbc21d6086f6?auto=format&fit=crop&q=80&w=200&h=200', '/models/prism.glb'),
      ('Laser Pointer', 'Red light laser pointer', 'https://images.unsplash.com/photo-1517520025737-1428a8d598b0?auto=format&fit=crop&q=80&w=200&h=200', '/models/laser.glb')
    RETURNING id;
  `);

  const prismId = equipRes.rows[0].id;
  const laserId = equipRes.rows[1].id;

  // 3. Insert Experiment
  const expRes = await client.query(`
    INSERT INTO experiments (chapter_id, title, objective, difficulty, video_url, procedure)
    VALUES (
      $1,
      'Dispersion of Light through a Prism',
      'To observe the dispersion of white light into its component colors using a glass prism.',
      'medium',
      'https://www.youtube.com/watch?v=9eOtFGAgiE4',
      '# Procedure\\n\\n1. **Setup the Prism**: Place the glass prism on a white sheet of paper on a flat table.\\n2. **Align the Light Source**: Direct a narrow beam of white light (or a laser) at one of the rectangular faces of the prism.\\n3. **Observe the Spectrum**: Observe the light emerging from the other face of the prism on a screen or the paper.\\n\\n> **Note**: You will see a band of seven colors (VIBGYOR). The red light bends the least, and violet bends the most.\\n\\n### Expected Results\\n- A clear spectrum of seven colors is formed.\\n- This proves that white light consists of multiple wavelengths.'
    )
    RETURNING id;
  `, [chapterId]);

  const expId = expRes.rows[0].id;

  // 4. Link Experiment and Equipment
  await client.query(`
    INSERT INTO experiment_equipment (experiment_id, equipment_id)
    VALUES 
      ($1, $2),
      ($1, $3);
  `, [expId, prismId, laserId]);

  console.log('Successfully inserted mock experiment and equipment!');
  await client.end();
}

main().catch(console.error);
