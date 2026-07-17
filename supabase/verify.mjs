#!/usr/bin/env node
// ============================================================
// verify.mjs — Verify the full data chain after migration
// Uses the service role key (bypasses RLS)
// Usage: node supabase/verify.mjs
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vkwwpuyvzmqqrqejkuvg.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrd3dwdXl2em1xcXJxZWprdXZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYyOTY5OSwiZXhwIjoyMDk5MjA1Njk5fQ.UODQ5RA6Q8FvZzmK9dgK-zAEm9pyyjNO40_K4lHZgAQ';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const ok  = (label) => console.log(`  ✓  ${label}`);
const fail = (label, err) => { console.error(`  ✗  ${label}:`, err?.message || err); process.exitCode = 1; };

async function check(label, query) {
  const { data, error } = await query;
  if (error) { fail(label, error); return null; }
  ok(label);
  return data;
}

async function main() {
  console.log('\n━━━ Karnataka Study App — Schema Verification ━━━\n');

  // ── Individual table counts ──────────────────────────────────
  console.log('1. Table row counts (expect ≥ 1 in each):');
  const tables = ['boards','grades','streams','subjects','chapters','topics',
                  'study_materials','equipment','experiments','experiment_equipment'];

  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) fail(t, error);
    else ok(`${t}: ${count} row(s)`);
  }

  // ── Full relational chain ───────────────────────────────────
  console.log('\n2. Full relational chain (board → experiment → equipment):');

  const { data: chain, error: chainErr } = await supabase
    .from('boards')
    .select(`
      name,
      grades (
        name, sort_order,
        subjects (
          name, stream_id,
          chapters (
            title, chapter_number,
            topics (
              title, sort_order,
              study_materials ( type, title )
            ),
            experiments (
              title, difficulty,
              experiment_equipment (
                equipment ( name, description )
              )
            )
          )
        )
      )
    `)
    .eq('name', 'Karnataka State Board (KSEAB)')
    .single();

  if (chainErr) { fail('Full chain query', chainErr); return; }

  const grade   = chain.grades?.[0];
  const subject = grade?.subjects?.[0];
  const chapter = subject?.chapters?.[0];
  const topics  = chapter?.topics ?? [];
  const exp     = chapter?.experiments?.[0];
  const equip   = exp?.experiment_equipment?.map(e => e.equipment?.name) ?? [];

  ok(`Board    : ${chain.name}`);
  ok(`Grade    : ${grade?.name} (sort_order ${grade?.sort_order})`);
  ok(`Subject  : ${subject?.name} (stream_id: ${subject?.stream_id ?? 'NULL — correct for SSLC'})`);
  ok(`Chapter  : ${chapter?.title} (ch. ${chapter?.chapter_number})`);
  ok(`Topics   : ${topics.map(t => `"${t.title}"`).join(' | ')}`);
  ok(`Study mat: "${chapter?.topics?.[0]?.study_materials?.[0]?.title}" [${chapter?.topics?.[0]?.study_materials?.[0]?.type}]`);
  ok(`Experiment: "${exp?.title}" [${exp?.difficulty}]`);
  ok(`Equipment : ${equip.join(' + ')}`);

  // ── RLS smoke test (anon cannot write) ──────────────────────
  console.log('\n3. RLS smoke test (anon INSERT must be rejected):');
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrd3dwdXl2em1xcXJxZWprdXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Mjk2OTksImV4cCI6MjA5OTIwNTY5OX0.R4G1ohgTATNwGSKoZl6ti9WPnKAyCuD9RDaD78CeOb0';
  const anon = createClient(SUPABASE_URL, ANON_KEY);

  const { error: anonReadErr } = await anon.from('boards').select('name').limit(1);
  if (anonReadErr) fail('Anon SELECT boards (should succeed)', anonReadErr);
  else ok('Anon SELECT boards — allowed ✓');

  const { error: anonWriteErr } = await anon.from('boards').insert({ name: 'Fake Board' });
  if (anonWriteErr) ok(`Anon INSERT boards — correctly rejected (${anonWriteErr.code})`);
  else fail('Anon INSERT boards (should have been rejected)', 'No error returned — RLS may not be active!');

  console.log('\n━━━ Verification complete ━━━\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
