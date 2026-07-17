import { createClient } from '@/lib/supabase/server';
import LabClient from './LabClient';
import { redirect } from 'next/navigation';

export default async function LabPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Fetch experiments with their chapter and subject info
  const { data: experiments } = await (supabase.from('experiments') as any).select(`
    *,
    chapter:chapters (
      title,
      subject:subjects (
        name
      )
    )
  `);

  // Fetch equipment relationships
  const { data: expEquipment } = await (supabase.from('experiment_equipment') as any).select(`
    experiment_id,
    equipment (*)
  `);

  // Fetch progress for this user
  const { data: progress } = await supabase.from('lab_progress').select('*').eq('user_id', user.id);

  // Group equipment by experiment
  const equipmentByExperiment: Record<string, any[]> = {};
  if (expEquipment) {
    for (const row of expEquipment) {
      if (!equipmentByExperiment[row.experiment_id]) {
        equipmentByExperiment[row.experiment_id] = [];
      }
      if (row.equipment) {
        equipmentByExperiment[row.experiment_id].push(row.equipment);
      }
    }
  }

  // Sort experiments by chapter title then experiment title
  const sortedExperiments = (experiments ?? []).sort((a: any, b: any) => {
    const chA = a.chapter?.title || '';
    const chB = b.chapter?.title || '';
    if (chA !== chB) return chA.localeCompare(chB);
    return a.title.localeCompare(b.title);
  });

  return (
    <LabClient 
      experiments={sortedExperiments} 
      equipmentMap={equipmentByExperiment}
      progress={progress ?? []}
      userId={user.id}
    />
  );
}
