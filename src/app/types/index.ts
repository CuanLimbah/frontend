export type UserRole = 'admin' | 'user' | 'driver';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  full_name: string;
  business_name?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  avatar_url?: string;
  phone_number?: string;
  vehicle_number?: string;
}

export type WasteType = 'food' | 'oil';

export type QualityGrade = 'A' | 'B' | 'C';

export type ContaminationLevel = 'none' | 'low' | 'medium' | 'high';

export type QualityGradeSource = 'ai' | 'admin';

export type QualityFeedbackTag =
  | 'photo_unclear'
  | 'visual_missed_sediment'
  | 'visual_missed_water'
  | 'visual_missed_food_residue'
  | 'visual_missed_non_organic_contamination'
  | 'wrong_waste_type_detected'
  | 'sop_mismatch'
  | 'rag_context_insufficient'
  | 'fallback_sop_used'
  | 'vision_fallback_used'
  | 'ai_too_optimistic'
  | 'ai_too_conservative'
  | 'admin_manual_inspection'
  | 'pricing_sensitive_case'
  | 'other';

export type QualityFeedbackSeverity = 'low' | 'medium' | 'high';

export interface QualityFeedback {
  tags: QualityFeedbackTag[];
  primaryReason?: QualityFeedbackTag;
  severity?: QualityFeedbackSeverity;
  note?: string;
  created_at: string;
  created_by?: string;
}

export type ImageQuality = 'clear' | 'blurry' | 'dark' | 'unclear' | 'invalid';

export type SedimentLevel = 'none' | 'low' | 'medium' | 'high' | 'unknown';

export interface AiVisualObservations {
  imageQuality: ImageQuality;
  isWasteVisible: boolean;
  detectedWasteType: WasteType | 'unknown';
  color?: string;
  clarity?: string;
  sedimentLevel?: SedimentLevel;
  waterVisible?: boolean;
  foodResidueVisible?: boolean;
  nonOrganicContaminationVisible?: boolean;
  containerCondition?: string;
  visualObservation: string;
  visionConfidence: number;
}

export type SubmissionStatus = 'pending' | 'verified' | 'completed' | 'rejected';

export interface WasteSubmission {
  id: string;
  user_id: string;
  waste_type: WasteType;
  estimated_weight: number;
  actual_weight?: number;
  image_url?: string;
  status: SubmissionStatus;
  created_at: string;
  verified_at?: string;
  completed_at?: string;
  notes?: string;
  earnings?: number;
  price_snapshot_per_kg?: number;
  quality_grade?: QualityGrade;
  final_price_per_kg?: number;
  pricing_model_version?: string;
  pricing_breakdown?: unknown;
  pricing_explanation?: string;
  ai_quality_grade?: QualityGrade;
  ai_quality_confidence?: number;
  ai_contamination_level?: ContaminationLevel;
  ai_quality_reason?: string;
  ai_quality_tips?: string;
  ai_quality_matched_criteria?: string[];
  ai_quality_checked_at?: string;
  ai_quality_model?: string;
  ai_quality_source?: 'rag' | 'fallback_sop' | 'llm';
  ai_quality_rag_source?: 'rag' | 'fallback_sop';
  ai_visual_observations?: AiVisualObservations;
  ai_visual_checked_at?: string;
  ai_visual_model?: string;
  ai_visual_source?: 'vision_llm' | 'fallback';
  quality_grade_source?: QualityGradeSource;
  admin_quality_notes?: string;
  quality_feedback?: QualityFeedback;
  override_reason_tags?: QualityFeedbackTag[];
  override_primary_reason?: QualityFeedbackTag;
  override_feedback_severity?: QualityFeedbackSeverity;
}

export interface QualityCheckResult {
  submissionId: string;
  wasteType: WasteType;
  recommendedGrade: QualityGrade;
  confidence: number;
  contaminationLevel: ContaminationLevel;
  reason: string;
  matchedCriteria: string[];
  tips: string;
  requiresAdminReview: boolean;
  modelProvider: string;
  modelVersion: string;
  ragSource: 'rag' | 'fallback_sop';
  visualObservation?: AiVisualObservations;
}

export interface QualityAiAnalytics {
  totalQualityChecks: number;
  totalAdminDecisions: number;
  aiAcceptedCount: number;
  adminOverrideCount: number;
  overrideRate: number;
  agreementRate: number;
  averageConfidence: number | null;
  lowConfidenceReviewCount: number;
  ragUsage: {
    rag: number;
    fallback_sop: number;
    unknown: number;
  };
  visionUsage: {
    vision_llm: number;
    fallback: number;
    unknown: number;
  };
  gradeDistribution: {
    ai: Record<QualityGrade, number>;
    admin: Record<QualityGrade, number>;
  };
  overrideMatrix: Record<string, number>;
  feedbackTagCounts?: Record<string, number>;
  primaryOverrideReasons?: Record<string, number>;
  aiErrorPatterns?: Record<string, number>;
  byWasteType: Record<
    WasteType,
    {
      totalQualityChecks: number;
      adminOverrideCount: number;
      averageConfidence: number | null;
    }
  >;
  recentOverrides: Array<{
    submission_id: string;
    waste_type: WasteType;
    ai_quality_grade?: QualityGrade;
    final_quality_grade?: QualityGrade;
    ai_quality_confidence?: number;
    admin_quality_notes?: string;
    created_at: string;
  }>;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  completed_at?: string;
  submission_id?: string;
  withdrawal_method?: WithdrawalMethod;
  withdrawal_account?: string;
  notes?: string;
}

export type WithdrawalMethod = 'gopay' | 'ovo' | 'dana' | 'bank';

export interface WastePrice {
  id: string;
  waste_type: WasteType;
  price_per_kg: number;
  updated_at: string;
  updated_by: string;
}

export interface DropPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  operating_hours: string;
  contact: string;
}

export interface UserStats {
  total_submissions: number;
  total_weight: number;
  total_earnings: number;
  current_balance: number;
  pending_submissions: number;
}

export interface AdminStats {
  total_users: number;
  total_waste_collected: number;
  total_cuan_distributed: number;
  pending_verifications: number;
  pending_withdrawals: number;
  user_growth: Array<{ date: string; users: number }>;
  waste_by_type: Array<{ type: WasteType; weight: number }>;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  redirectTo: string;
}

export interface UserDashboardData {
  user: User;
  stats: UserStats;
  waste_prices: WastePrice[];
  submissions: WasteSubmission[];
  transactions: Transaction[];
  drop_points: DropPoint[];
}

export interface AdminUser extends User {
  display_name: string;
  total_submissions: number;
  total_weight: number;
  total_earnings: number;
  joined_at: string;
}

export interface AdminWithdrawalRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: number;
  method: string;
  account: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  completed_at?: string;
  notes?: string;
}

export interface AdminWithdrawals {
  pending: AdminWithdrawalRequest[];
  processed: AdminWithdrawalRequest[];
}

export interface AdminDashboardData {
  stats: AdminStats;
  prices: WastePrice[];
  pending_submissions: WasteSubmission[];
  users: AdminUser[];
  drivers: User[];
  pickup_routes: PickupRoute[];
  payments: PaymentRecord[];
  withdrawals: AdminWithdrawals;
}

export type PickupRouteStatus =
  | 'assigned'
  | 'on_the_way'
  | 'picked_up'
  | 'completed'
  | 'cancelled';

export interface PickupRoute {
  id: string;
  submission_id: string;
  user_id: string;
  driver_id: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  scheduled_at: string;
  status: PickupRouteStatus;
  created_at: string;
  started_at?: string;
  picked_up_at?: string;
  completed_at?: string;
  notes?: string;
  user_name?: string;
  user_email?: string;
  driver_name?: string;
  driver_email?: string;
  driver_vehicle?: string;
  submission?: WasteSubmission;
}

export type PaymentMethod = 'qris' | 'virtual_account' | 'ewallet';

export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'failed';

export interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  purpose: string;
  checkout_url: string;
  external_reference?: string;
  created_at: string;
  paid_at?: string;
  expires_at?: string;
  notes?: string;
}

export interface DriverDashboardData {
  driver: User;
  routes: PickupRoute[];
  stats: {
    assigned: number;
    active: number;
    completed: number;
  };
}
