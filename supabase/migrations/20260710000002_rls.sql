-- ============================================================
-- Migration 002: Row Level Security  (IDEMPOTENT — safe to re-run)
-- Karnataka Study App
-- ============================================================

-- Enable RLS
ALTER TABLE boards               ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades               ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams              ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters             ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics               ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment            ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;

-- is_admin() helper (SECURITY DEFINER bypasses RLS on profiles)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ── boards ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read boards"  ON boards;
DROP POLICY IF EXISTS "Admin insert boards" ON boards;
DROP POLICY IF EXISTS "Admin update boards" ON boards;
DROP POLICY IF EXISTS "Admin delete boards" ON boards;

CREATE POLICY "Public read boards"
  ON boards FOR SELECT USING (true);
CREATE POLICY "Admin insert boards"
  ON boards FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update boards"
  ON boards FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete boards"
  ON boards FOR DELETE TO authenticated USING (is_admin());

-- ── grades ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read grades"  ON grades;
DROP POLICY IF EXISTS "Admin insert grades" ON grades;
DROP POLICY IF EXISTS "Admin update grades" ON grades;
DROP POLICY IF EXISTS "Admin delete grades" ON grades;

CREATE POLICY "Public read grades"  ON grades FOR SELECT USING (true);
CREATE POLICY "Admin insert grades" ON grades FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update grades" ON grades FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete grades" ON grades FOR DELETE TO authenticated USING (is_admin());

-- ── streams ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read streams"  ON streams;
DROP POLICY IF EXISTS "Admin insert streams" ON streams;
DROP POLICY IF EXISTS "Admin update streams" ON streams;
DROP POLICY IF EXISTS "Admin delete streams" ON streams;

CREATE POLICY "Public read streams"  ON streams FOR SELECT USING (true);
CREATE POLICY "Admin insert streams" ON streams FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update streams" ON streams FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete streams" ON streams FOR DELETE TO authenticated USING (is_admin());

-- ── subjects ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read subjects"  ON subjects;
DROP POLICY IF EXISTS "Admin insert subjects" ON subjects;
DROP POLICY IF EXISTS "Admin update subjects" ON subjects;
DROP POLICY IF EXISTS "Admin delete subjects" ON subjects;

CREATE POLICY "Public read subjects"  ON subjects FOR SELECT USING (true);
CREATE POLICY "Admin insert subjects" ON subjects FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update subjects" ON subjects FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete subjects" ON subjects FOR DELETE TO authenticated USING (is_admin());

-- ── chapters ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read chapters"  ON chapters;
DROP POLICY IF EXISTS "Admin insert chapters" ON chapters;
DROP POLICY IF EXISTS "Admin update chapters" ON chapters;
DROP POLICY IF EXISTS "Admin delete chapters" ON chapters;

CREATE POLICY "Public read chapters"  ON chapters FOR SELECT USING (true);
CREATE POLICY "Admin insert chapters" ON chapters FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update chapters" ON chapters FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete chapters" ON chapters FOR DELETE TO authenticated USING (is_admin());

-- ── topics ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read topics"  ON topics;
DROP POLICY IF EXISTS "Admin insert topics" ON topics;
DROP POLICY IF EXISTS "Admin update topics" ON topics;
DROP POLICY IF EXISTS "Admin delete topics" ON topics;

CREATE POLICY "Public read topics"  ON topics FOR SELECT USING (true);
CREATE POLICY "Admin insert topics" ON topics FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update topics" ON topics FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete topics" ON topics FOR DELETE TO authenticated USING (is_admin());

-- ── study_materials ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read study_materials"  ON study_materials;
DROP POLICY IF EXISTS "Admin insert study_materials" ON study_materials;
DROP POLICY IF EXISTS "Admin update study_materials" ON study_materials;
DROP POLICY IF EXISTS "Admin delete study_materials" ON study_materials;

CREATE POLICY "Public read study_materials"  ON study_materials FOR SELECT USING (true);
CREATE POLICY "Admin insert study_materials" ON study_materials FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update study_materials" ON study_materials FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete study_materials" ON study_materials FOR DELETE TO authenticated USING (is_admin());

-- ── equipment ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read equipment"  ON equipment;
DROP POLICY IF EXISTS "Admin insert equipment" ON equipment;
DROP POLICY IF EXISTS "Admin update equipment" ON equipment;
DROP POLICY IF EXISTS "Admin delete equipment" ON equipment;

CREATE POLICY "Public read equipment"  ON equipment FOR SELECT USING (true);
CREATE POLICY "Admin insert equipment" ON equipment FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update equipment" ON equipment FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete equipment" ON equipment FOR DELETE TO authenticated USING (is_admin());

-- ── experiments ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read experiments"  ON experiments;
DROP POLICY IF EXISTS "Admin insert experiments" ON experiments;
DROP POLICY IF EXISTS "Admin update experiments" ON experiments;
DROP POLICY IF EXISTS "Admin delete experiments" ON experiments;

CREATE POLICY "Public read experiments"  ON experiments FOR SELECT USING (true);
CREATE POLICY "Admin insert experiments" ON experiments FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update experiments" ON experiments FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete experiments" ON experiments FOR DELETE TO authenticated USING (is_admin());

-- ── experiment_equipment ────────────────────────────────────────
DROP POLICY IF EXISTS "Public read experiment_equipment"  ON experiment_equipment;
DROP POLICY IF EXISTS "Admin insert experiment_equipment" ON experiment_equipment;
DROP POLICY IF EXISTS "Admin update experiment_equipment" ON experiment_equipment;
DROP POLICY IF EXISTS "Admin delete experiment_equipment" ON experiment_equipment;

CREATE POLICY "Public read experiment_equipment"  ON experiment_equipment FOR SELECT USING (true);
CREATE POLICY "Admin insert experiment_equipment" ON experiment_equipment FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update experiment_equipment" ON experiment_equipment FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete experiment_equipment" ON experiment_equipment FOR DELETE TO authenticated USING (is_admin());

-- ── profiles: own-row only ──────────────────────────────────────
DROP POLICY IF EXISTS "Users read own profile"        ON profiles;
DROP POLICY IF EXISTS "Users update own profile"      ON profiles;
DROP POLICY IF EXISTS "Service role bypass profiles"  ON profiles;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

-- Non-admins cannot flip is_admin to true on their own row
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      is_admin()
      OR NOT is_admin   -- is_admin here is the COLUMN (new value must be false)
    )
  );

-- Service role bypass (for triggers and admin tooling)
CREATE POLICY "Service role bypass profiles"
  ON profiles FOR ALL USING (auth.role() = 'service_role');
