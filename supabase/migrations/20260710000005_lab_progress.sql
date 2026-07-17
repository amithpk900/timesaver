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
