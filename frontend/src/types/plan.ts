/**
 * Training Plan, Exercises & Recovery Domain Types
 */

export interface Exercise {
  id: string;
  name: string;
  target_muscle?: string;
  category?: string;
  sets?: number;
  reps?: number | string;
  duration_sec?: number;
  rest_sec?: number;
  tempo?: string;
  notes?: string;
  intensity?: 'low' | 'moderate' | 'high' | string;
  video_demo_url?: string;
}

export interface DailyWorkout {
  day: string;
  focus: string;
  warm_up: Exercise[];
  main_circuit: Exercise[];
  cooldown: Exercise[];
  target_bottleneck?: string;
  duration_minutes?: number;
}

export interface PlanExerciseItem {
  name: string;
  sets?: number | string;
  reps?: number | string;
  rest_seconds?: number;
  targets_bottleneck?: string;
  coaching_cue?: string;
}

export interface PlanSessionItem {
  day?: number;
  session_name: string;
  type?: string;
  duration_minutes?: number;
  target_rpe?: string;
  warmup?: string[];
  main_exercises?: PlanExerciseItem[];
  finisher?: string[];
  cooldown?: string[];
}

export interface PlanWeekItem {
  week_number: number;
  week_theme?: string;
  target_rpe?: string;
  focus_summary?: string;
  sessions?: PlanSessionItem[];
}


export interface TrainingPlanData {
  plan_title?: string;
  plan_summary?: string;
  weeks?: PlanWeekItem[];
  [key: string]: any;
}


export interface RecoveryProtocol {
  id: string;
  title: string;
  category: 'mobility' | 'myofascial' | 'active_recovery' | 'sleep_hygiene' | string;
  frequency: string;
  instructions: string[];
  duration_minutes?: number;
}

export interface ActiveRecoverySession {
  name: string;
  duration_minutes: number;
  exercises?: string[];
  when?: string;
}

export interface RecoveryLoadContext {
  strain_status?: string;
  avg_recent_rpe?: number;
  total_weekly_minutes?: number;
}

export interface RecoveryPlanData {
  load_context?: RecoveryLoadContext;
  daily_habits?: string[];
  active_recovery_sessions?: ActiveRecoverySession[];
  weekly_recovery_schedule?: Record<string, string>;
  injury_prevention_focus?: string;
}

export interface TrainingPlan {
  id: number;
  athlete_id: number;
  title: string;
  objective: string;
  duration_weeks: number;
  weekly_schedule?: DailyWorkout[];
  recovery_protocols?: RecoveryProtocol[];
  ai_rationale?: string;
  created_at: string;
  plan_data?: TrainingPlanData;
}

export interface TrainingLogItem {
  id?: number;
  session_date: string;
  session_type: string;
  duration_minutes: number;
  perceived_exertion: number;
  notes?: string;
  workload_index?: number;
  completed?: boolean;
  [key: string]: any;
}

export interface MetricDeltaItem {
  name?: string;
  previous_score: number;
  current_score: number;
  delta: number;
}

export interface ReassessmentData {
  overall_trajectory?: string;
  average_delta?: number;
  metric_deltas?: Record<string, MetricDeltaItem>;
  resolved_bottlenecks?: Array<{
    attribute: string;
    name?: string;
    new_score: number;
    [key: string]: any;
  }>;
  emerging_priorities?: Array<{
    attribute: string;
    name?: string;
    gap: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}


