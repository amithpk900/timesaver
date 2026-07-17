import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Fetch profile
  const { data: profile } = await (supabase.from('profiles') as any).select('*').eq('id', user.id).single();
  
  if (!profile?.grade_id) redirect('/onboarding');

  // Fetch subjects for this grade/stream
  let query = (supabase.from('subjects') as any).select('id, name').eq('grade_id', profile.grade_id);
  if (profile.stream_id) {
    query = query.eq('stream_id', profile.stream_id);
  } else {
    query = query.is('stream_id', null);
  }
  const { data: subjects } = await query;

  // Fetch recent experiments with videos
  const { data: experiments } = await (supabase.from('experiments') as any)
    .select('id, title, video_url, chapter_id(subject_id(name))')
    .not('video_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(2);

  const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'Student';

  return (
    <DashboardContent 
      firstName={firstName}
      subjects={subjects ?? []}
      experiments={experiments ?? []}
    />
  );
}
