import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Root page: server-side redirect based on auth + profile state
export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Check if onboarding is complete
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('grade_id')
    .eq('id', user.id)
    .single();

  if (!profile?.grade_id) redirect('/onboarding');

  redirect('/browse');
}
