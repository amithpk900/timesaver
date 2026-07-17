-- ============================================================
-- Migration 001: Schema  (IDEMPOTENT — safe to re-run)
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
