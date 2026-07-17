import { createClient } from '@/lib/supabase/server';
import MaterialsDrilldown from './MaterialsDrilldown';

export default async function MaterialsPage() {
  const supabase = await createClient();

  const [{ data: grades }, { data: streams }] = await Promise.all([
    supabase.from('grades').select('*').order('sort_order'),
    supabase.from('streams').select('*').order('name'),
  ]);

  return (
    <div className="flex flex-col h-full bg-background font-inter overflow-hidden">
      <MaterialsDrilldown 
        grades={grades ?? []}
        streams={streams ?? []}
      />
    </div>
  );
}
