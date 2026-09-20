/**
 * Athlete & Profile Domain Types
 */

export interface Athlete {
  id: number;
  email: string;
  full_name: string;
  is_verified?: boolean;
  created_at?: string;
}

export interface AthleteProfile {
  id?: number;
  athlete_id?: number;
  sport: string;
  discipline?: string | null;
  role?: string | null;
  primary_role?: string | null;
  secondary_role?: string | null;
  sub_role?: string | null;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite' | string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  wingspan_cm?: number | null;
  dominant_side?: 'left' | 'right' | 'ambidextrous' | string | null;
  dominant_hand?: 'right' | 'left' | 'both' | string | null;
  dominant_foot?: 'right' | 'left' | 'both' | string | null;
  stance?: 'orthodox' | 'southpaw' | 'open' | 'closed' | 'neutral' | string | null;
  surface_preference?: string | null;
  training_environment?: string | null;
  equipment_access?: string[] | null;
  primary_playstyle?: string | null;
  secondary_tendencies?: string[] | null;
  playstyle_profile?: Record<string, any> | null;
  athlete_description?: string | null;
  personal_goals_text?: string | null;
  training_frequency?: number | null;
  session_duration_minutes?: number | null;
  primary_objective?: string | null;
  secondary_objectives?: string[] | null;
  goals?: string[] | null;
  development_objectives?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface SportRoleSubRole {
  id: string;
  name: string;
  sub_roles: string[];
}

export interface SportTaxonomy {
  sport: string;
  name: string;
  icon: string;
  description: string;
  roles: SportRoleSubRole[];
  disciplines?: string[];
}

export interface OnboardingData {
  sport?: string;
  discipline?: string;
  primary_role?: string;
  secondary_role?: string;
  sub_role?: string;
  experience_level?: string;
  height_cm?: number | string;
  weight_kg?: number | string;
  wingspan_cm?: number | string;
  dominant_side?: string;
  dominant_hand?: string;
  dominant_foot?: string;
  stance?: string;
  surface_preference?: string;
  training_environment?: string;
  equipment_access?: string[];
  primary_playstyle?: string;
  secondary_tendencies?: string[];
  playstyle_profile?: Record<string, any>;
  athlete_description?: string;
  personal_goals_text?: string;
  training_frequency?: number | string;
  training_days_per_week?: number | string;
  age?: number | string;
  primary_objective?: string;
  secondary_objectives?: string[];
  goals?: string[];
  development_objectives?: string[];
  full_name?: string;
  email?: string;
  password?: string;
  [key: string]: any;
}

export interface ProfileAttributeItem {
  attribute: string;
  name?: string;
  score: number;
  benchmark?: number;
  gap?: number;
  tier?: 'bottleneck' | 'dev_area' | 'proficient' | 'strength' | string;
  role_relevance_explanation?: string;
  [key: string]: any;
}

export interface DashboardDevelopmentProfile {
  strengths?: ProfileAttributeItem[];
  proficient?: ProfileAttributeItem[];
  development_areas?: ProfileAttributeItem[];
  critical_bottlenecks?: ProfileAttributeItem[];
}

export interface DashboardTrainingStats {
  streak_days?: number;
  total_sessions?: number;
  avg_rpe?: number;
  total_minutes?: number;
}

export interface DashboardRecovery {
  load_context?: {
    strain_status?: string;
    avg_recent_rpe?: number;
    total_weekly_minutes?: number;
  };
  active_recovery_sessions?: Array<{
    session_name: string;
    duration_minutes: number;
    [key: string]: any;
  }>;
  daily_habits?: string[];
}

export interface DashboardResponse {
  development_profile?: DashboardDevelopmentProfile;
  training_stats?: DashboardTrainingStats;
  recovery_recommendation?: DashboardRecovery;
  [key: string]: any;
}

