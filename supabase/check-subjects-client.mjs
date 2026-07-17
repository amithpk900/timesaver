import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vkwwpuyvzmqqrqejkuvg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrd3dwdXl2em1xcXJxZWprdXZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYyOTY5OSwiZXhwIjoyMDk5MjA1Njk5fQ.UODQ5RA6Q8FvZzmK9dgK-zAEm9pyyjNO40_K4lHZgAQ';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const { data: grades, error: gradesErr } = await supabase.from('grades').select('*');
  if (gradesErr) {
    console.error('Grades error:', gradesErr);
    return;
  }
  console.log('Grades:', grades);

  const { data: subjects, error: subjectsErr } = await supabase.from('subjects').select('*');
  if (subjectsErr) {
    console.error('Subjects error:', subjectsErr);
    return;
  }
  console.log('Subjects:', subjects);
}

main().catch(console.error);
