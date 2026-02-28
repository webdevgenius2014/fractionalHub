export type UserType = "candidate" | "company" | "admin";
export type AvailabilityStatus = "available" | "unavailable" | "limited";
export type JobStatus = "open" | "draft" | "filled" | "closed" | "archived";
export type EngagementType = "hourly" | "fixed" | "milestone";
export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "interviewing"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "completed";
export type TransactionStatus =
  | "pending_charge"
  | "charge_initiated"
  | "charge_succeeded"
  | "charge_failed"
  | "payout_pending"
  | "payout_initiated"
  | "payout_succeeded"
  | "payout_failed"
  | "dispute_raised"
  | "refunded";
export type ReviewerType = "company" | "candidate";

export interface User {
  id: string;
  email: string;
  user_type: UserType;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  is_email_verified: boolean;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  headline?: string;
  bio?: string;
  roles: string[];
  expertise_areas: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  years_experience?: number;
  availability_hours_per_week: number;
  availability_status: AvailabilityStatus;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  skills: string[];
  stripe_connected_account_id?: string;
  stripe_account_verified: boolean;
  rating_avg: number;
  total_reviews: number;
  total_jobs_completed: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_logo_url?: string;
  company_website?: string;
  company_size?: string;
  industry?: string;
  location?: string;
  description?: string;
  stripe_account_id: string;
  stripe_account_verified: boolean;
  payment_method_added: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  roles_needed: string[];
  required_skills: string[];
  required_experience_years: number;
  engagement_type: EngagementType;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  fixed_price?: number;
  duration_weeks?: number;
  hours_per_week: number;
  status: JobStatus;
  is_urgent: boolean;
  applications_count: number;
  accepted_candidate_id?: string;
  created_at: string;
  expires_at?: string;
  updated_at: string;
  company?: CompanyProfile;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  cover_message?: string;
  proposed_rate?: number;
  status: ApplicationStatus;
  agreed_rate?: number;
  agreed_hours_per_week?: number;
  start_date?: string;
  end_date?: string;
  applied_at: string;
  accepted_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  candidate?: CandidateProfile;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  application_id?: string;
  message_text: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender?: User;
  recipient?: User;
}

export interface Transaction {
  id: string;
  application_id: string;
  company_id: string;
  candidate_id: string;
  subtotal_amount: number;
  company_commission_percentage: number;
  candidate_commission_percentage: number;
  company_fee_amount: number;
  candidate_fee_amount: number;
  total_platform_fee_amount: number;
  total_charge_amount: number;
  candidate_payout_amount: number;
  status: TransactionStatus;
  stripe_charge_id?: string;
  stripe_payment_intent_id?: string;
  stripe_transfer_id?: string;
  charge_date?: string;
  payout_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  application?: Application;
  company?: CompanyProfile;
  candidate?: CandidateProfile;
}

export interface CommissionConfig {
  id: string;
  company_commission_percentage: number;
  candidate_commission_percentage: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  reviewer_type: ReviewerType;
  application_id: string;
  rating: number;
  review_text?: string;
  communication_rating?: number;
  quality_rating?: number;
  reliability_rating?: number;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  reviewer?: User;
}

export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, "id" | "created_at" | "updated_at">; Update: Partial<User> };
      candidate_profiles: { Row: CandidateProfile; Insert: Omit<CandidateProfile, "id" | "created_at" | "updated_at">; Update: Partial<CandidateProfile> };
      company_profiles: { Row: CompanyProfile; Insert: Omit<CompanyProfile, "id" | "created_at" | "updated_at">; Update: Partial<CompanyProfile> };
      jobs: { Row: Job; Insert: Omit<Job, "id" | "created_at" | "updated_at">; Update: Partial<Job> };
      applications: { Row: Application; Insert: Omit<Application, "id" | "created_at" | "updated_at">; Update: Partial<Application> };
      messages: { Row: Message; Insert: Omit<Message, "id" | "created_at" | "updated_at">; Update: Partial<Message> };
      transactions: { Row: Transaction; Insert: Omit<Transaction, "id" | "created_at" | "updated_at">; Update: Partial<Transaction> };
      commission_config: { Row: CommissionConfig; Insert: Omit<CommissionConfig, "id" | "created_at" | "updated_at">; Update: Partial<CommissionConfig> };
      notifications: { Row: Notification; Insert: Omit<Notification, "id" | "created_at" | "updated_at">; Update: Partial<Notification> };
      reviews: { Row: Review; Insert: Omit<Review, "id" | "created_at" | "updated_at">; Update: Partial<Review> };
    };
  };
}
