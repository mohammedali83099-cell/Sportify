/**
 * Assessment, Kinematics & Computer Vision Domain Types
 */

export interface Landmark3D {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface JointAngles {
  [jointName: string]: number;
}

export interface QualityReport {
  is_valid: boolean;
  message: string;
  fps?: number;
  landmark_coverage?: number;
  confidence?: number;
  issues?: string[];
}

export type BottleneckSeverity = 'critical' | 'development' | 'proficient' | 'strength';

export interface Bottleneck {
  id: string;
  title: string;
  category: string;
  severity: BottleneckSeverity;
  description: string;
  impact: string;
  corrective_focus: string;
  priority: number;
  measured_value?: number | string;
  benchmark_value?: number | string;
}

export interface RadarCategoryScores {
  stability?: number;
  mobility?: number;
  symmetry?: number;
  posture?: number;
  explosiveness?: number;
  balance?: number;
  [category: string]: number | undefined;
}

export interface Assessment {
  id: number;
  athlete_id: number;
  protocol: string;
  activity_type?: string;
  overall_score: number;
  radar_scores: RadarCategoryScores;
  bottlenecks: Bottleneck[];
  joint_angles?: JointAngles;
  video_url?: string | null;
  quality_report?: QualityReport;
  created_at: string;
}

export interface ProtocolMetadata {
  id: string;
  name: string;
  sport: string;
  description: string;
  primary_joints: string[];
  camera_angle: string;
  ideal_distance_meters: number;
}

export interface TechniqueTip {
  title: string;
  detail: string;
}

export interface CoachingData {
  technique_tips?: TechniqueTip[];
  corrective_drills?: any[];
  [key: string]: any;
}

export interface AssessmentAnalysisResult {
  id?: number;
  athlete_id?: number;
  protocol_id?: string;
  protocol_name?: string;
  overall_movement_quality?: number;
  movement_scores?: Record<string, number>;
  metric_details?: Record<string, any>;
  movement_feedback?: string[];
  coaching?: CoachingData;
  bottlenecks?: Bottleneck[] | any[];
  created_at?: string;
  [key: string]: any;
}

