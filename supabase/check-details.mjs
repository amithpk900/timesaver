import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vkwwpuyvzmqqrqejkuvg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrd3dwdXl2em1xcXJxZWprdXZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYyOTY5OSwiZXhwIjoyMDk5MjA1Njk5fQ.UODQ5RA6Q8FvZzmK9dgK-zAEm9pyyjNO40_K4lHZgAQ';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const { data: chapters } = await supabase.from('chapters').select('*');
  console.log('Existing chapters:', chapters);

  const { data: topics } = await supabase.from('topics').select('*');
  console.log('Existing topics:', topics);
}

main().catch(console.error);
