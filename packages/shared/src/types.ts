// ============================================================
// packages/shared/src/types.ts
// Auto-generated from Karnataka Study App Supabase schema.
// Compatible with createClient<Database>() from @supabase/supabase-js
// ============================================================

// ─── Enums ────────────────────────────────────────────────────
export type StudyMaterialType = 'notes' | 'summary' | 'formula_sheet' | 'pdf';
export type ExperimentDifficulty = 'easy' | 'medium' | 'hard';

// ─── Row types (what you get back from SELECT) ────────────────
export interface Board {
  id: string;
  name: string;
  created_at: string;
}

export interface Grade {
  id: string;
  board_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Stream {
  id: string;
  name: string;
  created_at: string;
}

export interface Subject {
  id: string;
  grade_id: string;
  stream_id: string | null; // null for SSLC
  name: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  chapter_number: number;
  sort_order: number;
  created_at: string;
}

export interface Topic {
  id: string;
  chapter_id: string;
  title: string;
  sort_order: number;
  created_at: string;
}

export interface StudyMaterial {
  id: string;
  topic_id: string;
  type: StudyMaterialType;
  title: string;
  body: string | null;      // markdown body
  file_url: string | null;  // external PDF / file URL
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string | null;
  model_glb_url: string | null; // 3-D model for AR viewer
  thumbnail_url: string | null;
  created_at: string;
}

export interface Experiment {
  id: string;
  chapter_id: string;
  title: string;
  objective: string | null;
  procedure: string | null; // markdown
  video_url: string | null;
  difficulty: ExperimentDifficulty;
  created_at: string;
}

export interface ExperimentEquipment {
  experiment_id: string;
  equipment_id: string;
}

export interface Profile {
  id: string;           // references auth.users
  full_name: string | null;
  grade_id: string | null;
  stream_id: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Insert types (required fields only, rest optional) ───────
export type BoardInsert = Omit<Board, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type GradeInsert = Omit<Grade, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type StreamInsert = Omit<Stream, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type SubjectInsert = Omit<Subject, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type ChapterInsert = Omit<Chapter, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type TopicInsert = Omit<Topic, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type StudyMaterialInsert = Omit<StudyMaterial, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type EquipmentInsert = Omit<Equipment, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type ExperimentInsert = Omit<Experiment, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type ExperimentEquipmentInsert = ExperimentEquipment;
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

// ─── Update types (all fields optional) ───────────────────────
export type BoardUpdate = Partial<BoardInsert>;
export type GradeUpdate = Partial<GradeInsert>;
export type StreamUpdate = Partial<StreamInsert>;
export type SubjectUpdate = Partial<SubjectInsert>;
export type ChapterUpdate = Partial<ChapterInsert>;
export type TopicUpdate = Partial<TopicInsert>;
export type StudyMaterialUpdate = Partial<StudyMaterialInsert>;
export type EquipmentUpdate = Partial<EquipmentInsert>;
export type ExperimentUpdate = Partial<ExperimentInsert>;
export type ProfileUpdate = Partial<ProfileInsert>;

// ─── Database generic type for createClient<Database>() ───────
// Compatible with @supabase/supabase-js v2
export type Database = {
  public: {
    Tables: {
      boards: {
        Row: Board;
        Insert: BoardInsert;
        Update: BoardUpdate;
        Relationships: [];
      };
      grades: {
        Row: Grade;
        Insert: GradeInsert;
        Update: GradeUpdate;
        Relationships: [
          { foreignKeyName: 'grades_board_id_fkey'; columns: ['board_id']; referencedRelation: 'boards'; referencedColumns: ['id'] }
        ];
      };
      streams: {
        Row: Stream;
        Insert: StreamInsert;
        Update: StreamUpdate;
        Relationships: [];
      };
      subjects: {
        Row: Subject;
        Insert: SubjectInsert;
        Update: SubjectUpdate;
        Relationships: [
          { foreignKeyName: 'subjects_grade_id_fkey'; columns: ['grade_id']; referencedRelation: 'grades'; referencedColumns: ['id'] },
          { foreignKeyName: 'subjects_stream_id_fkey'; columns: ['stream_id']; referencedRelation: 'streams'; referencedColumns: ['id'] }
        ];
      };
      chapters: {
        Row: Chapter;
        Insert: ChapterInsert;
        Update: ChapterUpdate;
        Relationships: [
          { foreignKeyName: 'chapters_subject_id_fkey'; columns: ['subject_id']; referencedRelation: 'subjects'; referencedColumns: ['id'] }
        ];
      };
      topics: {
        Row: Topic;
        Insert: TopicInsert;
        Update: TopicUpdate;
        Relationships: [
          { foreignKeyName: 'topics_chapter_id_fkey'; columns: ['chapter_id']; referencedRelation: 'chapters'; referencedColumns: ['id'] }
        ];
      };
      study_materials: {
        Row: StudyMaterial;
        Insert: StudyMaterialInsert;
        Update: StudyMaterialUpdate;
        Relationships: [
          { foreignKeyName: 'study_materials_topic_id_fkey'; columns: ['topic_id']; referencedRelation: 'topics'; referencedColumns: ['id'] }
        ];
      };
      equipment: {
        Row: Equipment;
        Insert: EquipmentInsert;
        Update: EquipmentUpdate;
        Relationships: [];
      };
      experiments: {
        Row: Experiment;
        Insert: ExperimentInsert;
        Update: ExperimentUpdate;
        Relationships: [
          { foreignKeyName: 'experiments_chapter_id_fkey'; columns: ['chapter_id']; referencedRelation: 'chapters'; referencedColumns: ['id'] }
        ];
      };
      experiment_equipment: {
        Row: ExperimentEquipment;
        Insert: ExperimentEquipmentInsert;
        Update: Partial<ExperimentEquipmentInsert>;
        Relationships: [
          { foreignKeyName: 'experiment_equipment_experiment_id_fkey'; columns: ['experiment_id']; referencedRelation: 'experiments'; referencedColumns: ['id'] },
          { foreignKeyName: 'experiment_equipment_equipment_id_fkey'; columns: ['equipment_id']; referencedRelation: 'equipment'; referencedColumns: ['id'] }
        ];
      };
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [
          { foreignKeyName: 'profiles_grade_id_fkey'; columns: ['grade_id']; referencedRelation: 'grades'; referencedColumns: ['id'] },
          { foreignKeyName: 'profiles_stream_id_fkey'; columns: ['stream_id']; referencedRelation: 'streams'; referencedColumns: ['id'] }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      study_material_type: StudyMaterialType;
      experiment_difficulty: ExperimentDifficulty;
    };
    CompositeTypes: Record<string, never>;
  };
};

// ─── Convenience: typed row helpers ───────────────────────────
export type TableName = keyof Database['public']['Tables'];

export type Row<T extends TableName> =
  Database['public']['Tables'][T]['Row'];

// ─── Legacy / connection status type (used in home pages) ─────
export interface ConnectionStatus {
  connected: boolean;
  message: string;
}
