-- ============================================================
-- Migration 003: Seed Data
-- Full worked example:
--   Karnataka State Board (KSEAB)
--   → SSLC (10th) → Physics (no stream, SSLC doesn't use streams)
--   → Chapter: Light – Reflection and Refraction
--   → 2 Topics → 1 Study Material → 1 Experiment → 2 Equipment
-- ============================================================
-- Uses fixed UUIDs so re-running is safe (ON CONFLICT DO NOTHING)

-- ─── Board ────────────────────────────────────────────────────
INSERT INTO boards (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Karnataka State Board (KSEAB)')
ON CONFLICT DO NOTHING;

-- ─── Grades ───────────────────────────────────────────────────
INSERT INTO grades (id, board_id, name, sort_order) VALUES
  ('00000000-0000-0001-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'SSLC (10th)',    1),
  ('00000000-0000-0001-0000-000000000002', '00000000-0000-0000-0000-000000000001', '1st PUC (11th)', 2),
  ('00000000-0000-0001-0000-000000000003', '00000000-0000-0000-0000-000000000001', '2nd PUC (12th)', 3)
ON CONFLICT DO NOTHING;

-- ─── Streams ──────────────────────────────────────────────────
INSERT INTO streams (id, name) VALUES
  ('00000000-0000-0002-0000-000000000001', 'Science'),
  ('00000000-0000-0002-0000-000000000002', 'Commerce'),
  ('00000000-0000-0002-0000-000000000003', 'Arts')
ON CONFLICT DO NOTHING;

-- ─── Subject: Physics under SSLC (stream_id = NULL) ──────────
-- SSLC is not streamed; subjects belong directly to the grade
INSERT INTO subjects (id, grade_id, stream_id, name) VALUES
  ('00000000-0000-0003-0000-000000000001',
   '00000000-0000-0001-0000-000000000001',   -- SSLC
   NULL,                                      -- no stream
   'Physics')
ON CONFLICT DO NOTHING;

-- ─── Chapter ──────────────────────────────────────────────────
INSERT INTO chapters (id, subject_id, title, chapter_number, sort_order) VALUES
  ('00000000-0000-0004-0000-000000000001',
   '00000000-0000-0003-0000-000000000001',
   'Light – Reflection and Refraction',
   10, 1)
ON CONFLICT DO NOTHING;

-- ─── Topics ───────────────────────────────────────────────────
INSERT INTO topics (id, chapter_id, title, sort_order) VALUES
  ('00000000-0000-0005-0000-000000000001',
   '00000000-0000-0004-0000-000000000001',
   'Laws of Reflection', 1),

  ('00000000-0000-0005-0000-000000000002',
   '00000000-0000-0004-0000-000000000001',
   'Refraction of Light', 2)
ON CONFLICT DO NOTHING;

-- ─── Study Material ───────────────────────────────────────────
INSERT INTO study_materials (id, topic_id, type, title, body) VALUES
  ('00000000-0000-0006-0000-000000000001',
   '00000000-0000-0005-0000-000000000001',  -- Laws of Reflection
   'notes',
   'Laws of Reflection – Study Notes',
   E'# Laws of Reflection\n\n'
   '## First Law\n'
   'The **incident ray**, the **reflected ray**, and the **normal** at the '
   'point of incidence all lie in the **same plane**.\n\n'
   '## Second Law\n'
   'The **angle of incidence (∠i)** is always equal to the **angle of '
   'reflection (∠r)**.\n\n'
   '> **Formula:** ∠i = ∠r\n\n'
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

-- ─── Equipment ────────────────────────────────────────────────
INSERT INTO equipment (id, name, description) VALUES
  ('00000000-0000-0007-0000-000000000001',
   'Plane mirror',
   'A flat reflective glass surface used in optics experiments to study laws of reflection. Mounts vertically on a drawing board.'),

  ('00000000-0000-0007-0000-000000000002',
   'Optical pins',
   'Sharp steel pins with coloured heads, used to trace the path of light rays by forming a straight line of sight through them.')
ON CONFLICT DO NOTHING;

-- ─── Experiment ───────────────────────────────────────────────
INSERT INTO experiments (id, chapter_id, title, objective, procedure, difficulty) VALUES
  ('00000000-0000-0008-0000-000000000001',
   '00000000-0000-0004-0000-000000000001',  -- Light chapter
   'Verification of the laws of reflection using a plane mirror',
   'To verify the two laws of reflection of light by using a plane mirror and optical pins, and to confirm that ∠i = ∠r.',
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
   '5. Draw an incident ray at a chosen angle (e.g. 30°). Fix pins **P₁** and **P₂** on this ray.\n'
   '6. Looking from the other side of the normal, fix pins **P₃** and **P₄** such that they appear collinear with the images of P₁ and P₂ in the mirror.\n'
   '7. Remove the mirror. Draw the incident ray through P₁P₂ and the reflected ray through P₃P₄.\n'
   '8. Measure ∠i (angle between incident ray and normal) and ∠r (angle between reflected ray and normal).\n'
   '9. Repeat for two more angles.\n\n'
   '# Observations\n\n'
   '| Trial | ∠i (°) | ∠r (°) | ∠i = ∠r? |\n'
   '|---|---|---|---|\n'
   '| 1 | 30 | 30 | ✓ |\n'
   '| 2 | 45 | 45 | ✓ |\n'
   '| 3 | 60 | 60 | ✓ |\n\n'
   '# Result\n'
   'In all trials, ∠i = ∠r. The incident ray, reflected ray, and normal are coplanar. '
   'Both laws of reflection are verified.',
   'easy')
ON CONFLICT DO NOTHING;

-- ─── Experiment ↔ Equipment (join) ────────────────────────────
INSERT INTO experiment_equipment (experiment_id, equipment_id) VALUES
  ('00000000-0000-0008-0000-000000000001',
   '00000000-0000-0007-0000-000000000001'),   -- Plane mirror

  ('00000000-0000-0008-0000-000000000001',
   '00000000-0000-0007-0000-000000000002')    -- Optical pins
ON CONFLICT DO NOTHING;
