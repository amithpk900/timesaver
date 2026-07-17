import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NavigationShell from '@/components/NavigationShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await (supabase.from('profiles') as any).select('*').eq('id', user.id).single();
  
  if (!profile?.grade_id) redirect('/onboarding');

  const { data: grades } = await supabase.from('grades').select('*');
  const { data: streams } = await supabase.from('streams').select('*');

  const userGrade = grades?.find(g => g.id === profile.grade_id);
  const userStream = streams?.find(s => s.id === profile.stream_id);

  function getShortGrade(name: string) {
    if (name.includes('SSLC')) return 'SSLC';
    if (name.includes('1st')) return '1st PUC';
    if (name.includes('2nd')) return '2nd PUC';
    return name;
  }

  return (
    <NavigationShell 
      userFullName={profile.full_name || 'Student'} 
      gradeName={userGrade ? getShortGrade(userGrade.name) : ''} 
      streamName={userStream?.name}
    >
      {children}
    </NavigationShell>
  );
}
