-- ============================================================
-- Migration 001: Schema  (IDEMPOTENT â€” safe to re-run)
-- Karnataka Study App
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums: use DO block so re-running is safe
DO $$ BEGIN
  CREATE TYPE study_material_type AS ENUM (
    'notes', 'summary', 'formula_sheet', 'pdf'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END; $$;

DO $$ BEGIN
  CREATE TYPE experiment_difficulty AS ENUM (
    'easy', 'medium', 'hard'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END; $$;

-- Tables (IF NOT EXISTS = safe to re-run)
CREATE TABLE IF NOT EXISTS boards (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS streams (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grades (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id   UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (board_id, name)
);

CREATE TABLE IF NOT EXISTS subjects (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grade_id   UUID NOT NULL REFERENCES grades(id)  ON DELETE CASCADE,
  stream_id  UUID          REFERENCES streams(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (grade_id, stream_id, name)
);

CREATE TABLE IF NOT EXISTS chapters (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id     UUID    NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title          TEXT    NOT NULL,
  chapter_number INTEGER NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topics (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID    NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_materials (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id   UUID                NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  type       study_material_type NOT NULL,
  title      TEXT                NOT NULL,
  body       TEXT,
  file_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT body_or_file CHECK (body IS NOT NULL OR file_url IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS equipment (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  model_glb_url TEXT,
  thumbnail_url TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID                   NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title      TEXT                   NOT NULL,
  objective  TEXT,
  procedure  TEXT,
  video_url  TEXT,
  difficulty experiment_difficulty  NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ            NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiment_equipment (
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  equipment_id  UUID NOT NULL REFERENCES equipment(id)   ON DELETE CASCADE,
  PRIMARY KEY (experiment_id, equipment_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  grade_id   UUID REFERENCES grades(id)  ON DELETE SET NULL,
  stream_id  UUID REFERENCES streams(id) ON DELETE SET NULL,
  is_admin   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grades_board          ON grades(board_id);
CREATE INDEX IF NOT EXISTS idx_subjects_grade        ON subjects(grade_id);
CREATE INDEX IF NOT EXISTS idx_subjects_stream       ON subjects(stream_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject      ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_chapter        ON topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_topic ON study_materials(topic_id);
CREATE INDEX IF NOT EXISTS idx_experiments_chapter   ON experiments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_exp_equip_experiment  ON experiment_equipment(experiment_id);
CREATE INDEX IF NOT EXISTS idx_exp_equip_equipment   ON experiment_equipment(equipment_id);
CREATE INDEX IF NOT EXISTS idx_profiles_grade        ON profiles(grade_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- ============================================================
-- Migration 002: Row Level Security  (IDEMPOTENT â€” safe to re-run)
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

-- â”€â”€ boards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ grades â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP POLICY IF EXISTS "Public read grades"  ON grades;
DROP POLICY IF EXISTS "Admin insert grades" ON grades;
DROP POLICY IF EXISTS "Admin update grades" ON grades;
DROP POLICY IF EXISTS "Admin delete grades" ON grades;

CREATE POLICY "Public read grades"  ON grades FOR SELECT USING (true);
CREATE POLICY "Admin insert grades" ON grades FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update grades" ON grades FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete grades" ON grades FOR DELETE TO authenticated USING (is_admin());

-- â”€â”€ streams â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP POLICY IF EXISTS "Public read streams"  ON streams;
DROP POLICY IF EXISTS "Admin insert streams" ON streams;
DROP POLICY IF EXISTS "Admin update streams" ON streams;
DROP POLICY IF EXISTS "Admin delete streams" ON streams;

CREATE POLICY "Public read streams"  ON streams FOR SELECT USING (true);
CREATE POLICY "Admin insert streams" ON streams FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update streams" ON streams FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete streams" ON streams FOR DELETE TO authenticated USING (is_admin());

-- â”€â”€ subjects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP POLICY IF EXISTS "Public read subjects"  ON subjects;
DROP POLICY IF EXISTS "Admin insert subjects" ON subjects;
DROP POLICY IF EXISTS "Admin update subjects" ON subjects;
DROP POLICY IF EXISTS "Admin delete subjects" ON subjects;

CREATE POLICY "Public read subjects"  ON subjects FOR SELECT USING (true);
CREATE POLICY "Admin insert subjects" ON subjects FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update subjects" ON subjects FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete subjects" ON subjects FOR DELETE TO authenticated USING (is_admin());

-- â”€â”€ chapters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP POLICY IF EXISTS "Public read chapters"  ON chapters;
DROP POLICY IF EXISTS "Admin insert chapters" ON chapters;
DROP POLICY IF EXISTS "Admin update chapters" ON chapters;
DROP POLICY IF EXISTS "Admin delete chapters" ON chapters;

CREATE POLICY "Public read chapters"  ON chapters FOR SELECT USING (true);
CREATE POLICY "Admin insert chapters" ON chapters FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update chapters" ON chapters FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete chapters" ON chapters FOR DELETE TO authenticated USING (is_admin());

-- â”€â”€ topics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP POLICY IF EXISTS "Public read topics"  ON topics;
DROP POLICY IF EXISTS "Admin insert topics" ON topics;
DROP POLICY IF EXISTS "Admin update topics" ON topics;
DROP POLICY IF EXISTS "Admin delete topics" ON topics;

CREATE POLICY "Public read topics"  ON topics FOR SELECT USING (true);
CREATE POLICY "Admin insert topics" ON topics FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update topics" ON topics FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete topics" ON topics FOR DELETE TO authenticated USING (is_admin());

-- â”€â”€ study_materials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP POLICY IF EXISTS "Public read study_materials"  ON study_materials;
DROP POLICY IF EXISTS "Admin insert study_materials" ON study_materials;
DROP POLICY IF EXISTS "Admin update study_materials" ON study_materials;
DROP POLICY IF EXISTS "Admin delete study_materials" ON study_materials;

CREATE POLICY "Public read study_materials"  ON study_materials FOR SELECT USING (true);
CREATE POLICY "Admin insert study_materials" ON study_materials FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update study_materials" ON study_materials FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete study_materials" ON study_materials FOR DELETE TO authenticated USING (is_admin());

-- â”€â”€ equipment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP POLICY IF EXISTS "Public read equipment"  ON equipment;
DROP POLICY IF EXISTS "Admin insert equipment" ON equipment;
DROP POLICY IF EXISTS "Admin update equipment" ON equipment;
DROP POLICY IF EXISTS "Admin delete equipment" ON equipment;

CREATE POLICY "Public read equipment"  ON equipment FOR SELECT USING (true);
CREATE POLICY "Admin insert equipment" ON equipment FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update equipment" ON equipment FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete equipment" ON equipment FOR DELETE TO authenticated USING (is_admin());

-- â”€â”€ experiments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP POLICY IF EXISTS "Public read experiments"  ON experiments;
DROP POLICY IF EXISTS "Admin insert experiments" ON experiments;
DROP POLICY IF EXISTS "Admin update experiments" ON experiments;
DROP POLICY IF EXISTS "Admin delete experiments" ON experiments;

CREATE POLICY "Public read experiments"  ON experiments FOR SELECT USING (true);
CREATE POLICY "Admin insert experiments" ON experiments FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update experiments" ON experiments FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete experiments" ON experiments FOR DELETE TO authenticated USING (is_admin());

-- â”€â”€ experiment_equipment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP POLICY IF EXISTS "Public read experiment_equipment"  ON experiment_equipment;
DROP POLICY IF EXISTS "Admin insert experiment_equipment" ON experiment_equipment;
DROP POLICY IF EXISTS "Admin update experiment_equipment" ON experiment_equipment;
DROP POLICY IF EXISTS "Admin delete experiment_equipment" ON experiment_equipment;

CREATE POLICY "Public read experiment_equipment"  ON experiment_equipment FOR SELECT USING (true);
CREATE POLICY "Admin insert experiment_equipment" ON experiment_equipment FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update experiment_equipment" ON experiment_equipment FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete experiment_equipment" ON experiment_equipment FOR DELETE TO authenticated USING (is_admin());

-- â”€â”€ profiles: own-row only â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
-- ============================================================
-- Migration 003: Seed Data
-- Full worked example:
--   Karnataka State Board (KSEAB)
--   â†’ SSLC (10th) â†’ Physics (no stream, SSLC doesn't use streams)
--   â†’ Chapter: Light â€“ Reflection and Refraction
--   â†’ 2 Topics â†’ 1 Study Material â†’ 1 Experiment â†’ 2 Equipment
-- ============================================================
-- Uses fixed UUIDs so re-running is safe (ON CONFLICT DO NOTHING)

-- â”€â”€â”€ Board â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO boards (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Karnataka State Board (KSEAB)')
ON CONFLICT DO NOTHING;

-- â”€â”€â”€ Grades â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO grades (id, board_id, name, sort_order) VALUES
  ('00000000-0000-0001-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'SSLC (10th)',    1),
  ('00000000-0000-0001-0000-000000000002', '00000000-0000-0000-0000-000000000001', '1st PUC (11th)', 2),
  ('00000000-0000-0001-0000-000000000003', '00000000-0000-0000-0000-000000000001', '2nd PUC (12th)', 3)
ON CONFLICT DO NOTHING;

-- â”€â”€â”€ Streams â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO streams (id, name) VALUES
  ('00000000-0000-0002-0000-000000000001', 'Science'),
  ('00000000-0000-0002-0000-000000000002', 'Commerce'),
  ('00000000-0000-0002-0000-000000000003', 'Arts')
ON CONFLICT DO NOTHING;

-- â”€â”€â”€ Subject: Physics under SSLC (stream_id = NULL) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SSLC is not streamed; subjects belong directly to the grade
INSERT INTO subjects (id, grade_id, stream_id, name) VALUES
  ('00000000-0000-0003-0000-000000000001',
   '00000000-0000-0001-0000-000000000001',   -- SSLC
   NULL,                                      -- no stream
   'Physics')
ON CONFLICT DO NOTHING;

-- â”€â”€â”€ Chapter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO chapters (id, subject_id, title, chapter_number, sort_order) VALUES
  ('00000000-0000-0004-0000-000000000001',
   '00000000-0000-0003-0000-000000000001',
   'Light â€“ Reflection and Refraction',
   10, 1)
ON CONFLICT DO NOTHING;

-- â”€â”€â”€ Topics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO topics (id, chapter_id, title, sort_order) VALUES
  ('00000000-0000-0005-0000-000000000001',
   '00000000-0000-0004-0000-000000000001',
   'Laws of Reflection', 1),

  ('00000000-0000-0005-0000-000000000002',
   '00000000-0000-0004-0000-000000000001',
   'Refraction of Light', 2)
ON CONFLICT DO NOTHING;

-- â”€â”€â”€ Study Material â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO study_materials (id, topic_id, type, title, body) VALUES
  ('00000000-0000-0006-0000-000000000001',
   '00000000-0000-0005-0000-000000000001',  -- Laws of Reflection
   'notes',
   'Laws of Reflection â€“ Study Notes',
   E'# Laws of Reflection\n\n'
   '## First Law\n'
   'The **incident ray**, the **reflected ray**, and the **normal** at the '
   'point of incidence all lie in the **same plane**.\n\n'
   '## Second Law\n'
   'The **angle of incidence (âˆ i)** is always equal to the **angle of '
   'reflection (âˆ r)**.\n\n'
   '> **Formula:** âˆ i = âˆ r\n\n'
   '## Key Terms\n'
   '| Term | Definition |\n'
   '|---|---|\n'
   '| Normal | A perpendicular drawn at the point of incidence |\n'
   '| Angle of incidence | Angle between incident ray and the normal |\n'
   '| Angle of reflection | Angle between reflected ray and the normal |\n'
   '| Regular reflection | Reflection from a smooth surface (e.g. mirror) |\n'
   '| Diffuse reflection | Reflection from a rough surface |\n\n'
   '## Applications\n'
   '- Plane mirrors in periscopes\n'
   '- Rear-view mirrors in vehicles\n'
   '- Solar concentrators')
ON CONFLICT DO NOTHING;

-- â”€â”€â”€ Equipment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO equipment (id, name, description) VALUES
  ('00000000-0000-0007-0000-000000000001',
   'Plane mirror',
   'A flat reflective glass surface used in optics experiments to study laws of reflection. Mounts vertically on a drawing board.'),

  ('00000000-0000-0007-0000-000000000002',
   'Optical pins',
   'Sharp steel pins with coloured heads, used to trace the path of light rays by forming a straight line of sight through them.')
ON CONFLICT DO NOTHING;

-- â”€â”€â”€ Experiment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO experiments (id, chapter_id, title, objective, procedure, difficulty) VALUES
  ('00000000-0000-0008-0000-000000000001',
   '00000000-0000-0004-0000-000000000001',  -- Light chapter
   'Verification of the laws of reflection using a plane mirror',
   'To verify the two laws of reflection of light by using a plane mirror and optical pins, and to confirm that âˆ i = âˆ r.',
   E'# Materials Required\n'
   '- Plane mirror\n'
   '- Optical pins (4)\n'
   '- Drawing board and white paper\n'
   '- Ruler, protractor, pencil\n\n'
   '# Procedure\n\n'
   '1. Fix a sheet of white paper on a drawing board.\n'
   '2. Draw a straight line **MM''** near the centre; this represents the mirror line.\n'
   '3. Place the plane mirror vertically along MM''.\n'
   '4. Draw a normal **ON** perpendicular to MM'' at point O.\n'
   '5. Draw an incident ray at a chosen angle (e.g. 30Â°). Fix pins **Pâ‚** and **Pâ‚‚** on this ray.\n'
   '6. Looking from the other side of the normal, fix pins **Pâ‚ƒ** and **Pâ‚„** such that they appear collinear with the images of Pâ‚ and Pâ‚‚ in the mirror.\n'
   '7. Remove the mirror. Draw the incident ray through Pâ‚Pâ‚‚ and the reflected ray through Pâ‚ƒPâ‚„.\n'
   '8. Measure âˆ i (angle between incident ray and normal) and âˆ r (angle between reflected ray and normal).\n'
   '9. Repeat for two more angles.\n\n'
   '# Observations\n\n'
   '| Trial | âˆ i (Â°) | âˆ r (Â°) | âˆ i = âˆ r? |\n'
   '|---|---|---|---|\n'
   '| 1 | 30 | 30 | âœ“ |\n'
   '| 2 | 45 | 45 | âœ“ |\n'
   '| 3 | 60 | 60 | âœ“ |\n\n'
   '# Result\n'
   'In all trials, âˆ i = âˆ r. The incident ray, reflected ray, and normal are coplanar. '
   'Both laws of reflection are verified.',
   'easy')
ON CONFLICT DO NOTHING;

-- â”€â”€â”€ Experiment â†” Equipment (join) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO experiment_equipment (experiment_id, equipment_id) VALUES
  ('00000000-0000-0008-0000-000000000001',
   '00000000-0000-0007-0000-000000000001'),   -- Plane mirror

  ('00000000-0000-0008-0000-000000000001',
   '00000000-0000-0007-0000-000000000002')    -- Optical pins
ON CONFLICT DO NOTHING;


-- ============================================================
-- Migration 005: Lab Progress
-- Karnataka Study App
-- ============================================================

CREATE TABLE IF NOT EXISTS lab_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, experiment_id, step)
);

ALTER TABLE lab_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lab progress"
  ON lab_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab progress"
  ON lab_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab progress"
  ON lab_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab progress"
  ON lab_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
