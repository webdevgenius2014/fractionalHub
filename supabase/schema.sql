-- ============================================
-- FRACTIONAL HUB - SUPABASE SCHEMA
-- ============================================

-- 1. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('candidate', 'company', 'admin')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_photo_url TEXT,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);

-- 2. CANDIDATE PROFILES
CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  headline VARCHAR(255),
  bio TEXT,
  roles JSONB DEFAULT '["CTO"]',
  expertise_areas JSONB DEFAULT '[]',
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  years_experience INTEGER,
  availability_hours_per_week INTEGER DEFAULT 20,
  availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'unavailable', 'limited')),
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  skills JSONB DEFAULT '[]',

  -- Stripe for payouts
  stripe_connected_account_id VARCHAR(255),
  stripe_account_verified BOOLEAN DEFAULT FALSE,

  -- Ratings
  rating_avg DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,

  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_roles ON candidate_profiles USING GIN(roles);
CREATE INDEX idx_candidate_profiles_availability ON candidate_profiles(availability_status);

-- 3. COMPANY PROFILES
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  company_logo_url TEXT,
  company_website TEXT,
  company_size VARCHAR(50),
  industry VARCHAR(100),
  location VARCHAR(255),
  description TEXT,

  -- Stripe for payments
  stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_account_verified BOOLEAN DEFAULT FALSE,
  payment_method_added BOOLEAN DEFAULT FALSE,

  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX idx_company_profiles_stripe_account ON company_profiles(stripe_account_id);

-- 4. JOBS TABLE
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  roles_needed JSONB NOT NULL DEFAULT '["CTO"]',
  required_skills JSONB DEFAULT '[]',
  required_experience_years INTEGER DEFAULT 5,

  engagement_type VARCHAR(50) NOT NULL CHECK (engagement_type IN ('hourly', 'fixed', 'milestone')),
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  fixed_price INTEGER,
  duration_weeks INTEGER,
  hours_per_week INTEGER DEFAULT 20,

  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'draft', 'filled', 'closed', 'archived')),
  is_urgent BOOLEAN DEFAULT FALSE,

  applications_count INTEGER DEFAULT 0,
  accepted_candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_roles_needed ON jobs USING GIN(roles_needed);

-- Auto-increment applications_count on new application
CREATE OR REPLACE FUNCTION increment_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs SET applications_count = applications_count + 1
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_applications
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION increment_applications_count();

-- 5. APPLICATIONS TABLE
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,

  cover_message TEXT,
  proposed_rate INTEGER,

  status VARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interviewing', 'accepted', 'rejected', 'withdrawn', 'completed')),

  -- When accepted
  agreed_rate INTEGER,
  agreed_hours_per_week INTEGER,
  start_date DATE,
  end_date DATE,

  applied_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(job_id, candidate_id)
);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);

-- 6. MESSAGES TABLE (for real-time chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,

  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- 7. TRANSACTIONS TABLE (payments)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,

  -- Amount breakdown (all amounts in cents)
  subtotal_amount INTEGER NOT NULL,
  company_commission_percentage DECIMAL(5,2) DEFAULT 5.00,
  candidate_commission_percentage DECIMAL(5,2) DEFAULT 5.00,
  company_fee_amount INTEGER NOT NULL,
  candidate_fee_amount INTEGER NOT NULL,
  total_platform_fee_amount INTEGER NOT NULL,
  total_charge_amount INTEGER NOT NULL,
  candidate_payout_amount INTEGER NOT NULL,

  -- Status
  status VARCHAR(30) DEFAULT 'pending_charge' CHECK (
    status IN (
      'pending_charge',
      'charge_initiated',
      'charge_succeeded',
      'charge_failed',
      'payout_pending',
      'payout_initiated',
      'payout_succeeded',
      'payout_failed',
      'dispute_raised',
      'refunded'
    )
  ),

  -- Stripe references
  stripe_charge_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),

  -- Timeline
  charge_date TIMESTAMP,
  payout_date TIMESTAMP,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_application_id ON transactions(application_id);
CREATE INDEX idx_transactions_company_id ON transactions(company_id);
CREATE INDEX idx_transactions_candidate_id ON transactions(candidate_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- 8. COMMISSION CONFIG TABLE (for flexible rates)
CREATE TABLE commission_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  company_commission_percentage DECIMAL(5,2) DEFAULT 5.00,
  candidate_commission_percentage DECIMAL(5,2) DEFAULT 5.00,

  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_commission_config_is_active ON commission_config(is_active);

-- Insert default commission
INSERT INTO commission_config (company_commission_percentage, candidate_commission_percentage, is_active)
VALUES (5.00, 5.00, TRUE);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  related_entity_type VARCHAR(50),
  related_entity_id UUID,

  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- 10. REVIEWS TABLE
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_type VARCHAR(20) NOT NULL CHECK (reviewer_type IN ('company', 'candidate')),

  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,

  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),

  is_verified_purchase BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_application_id ON reviews(application_id);

-- Update candidate rating after new review
CREATE OR REPLACE FUNCTION update_candidate_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE candidate_profiles
  SET
    rating_avg = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM reviews
      WHERE reviewed_user_id = (
        SELECT user_id FROM candidate_profiles WHERE id = candidate_profiles.id
      )
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewed_user_id = (
        SELECT user_id FROM candidate_profiles WHERE id = candidate_profiles.id
      )
    )
  WHERE user_id = NEW.reviewed_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_candidate_rating
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_candidate_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_config ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- CANDIDATE PROFILES policies
CREATE POLICY "Candidates can manage their own profile"
  ON candidate_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view candidate profiles"
  ON candidate_profiles FOR SELECT
  USING (true);

-- COMPANY PROFILES policies
CREATE POLICY "Companies can manage their own profile"
  ON company_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view company profiles"
  ON company_profiles FOR SELECT
  USING (true);

-- JOBS policies
CREATE POLICY "Jobs are viewable by all"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Companies can insert their own jobs"
  ON jobs FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Companies can update their own jobs"
  ON jobs FOR UPDATE
  USING (company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Companies can delete their own jobs"
  ON jobs FOR DELETE
  USING (company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid()));

-- APPLICATIONS policies
CREATE POLICY "Candidates can view their own applications"
  ON applications FOR SELECT
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Companies can view applications to their jobs"
  ON applications FOR SELECT
  USING (job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Candidates can insert applications"
  ON applications FOR INSERT
  WITH CHECK (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Candidates can update their own applications"
  ON applications FOR UPDATE
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Companies can update applications to their jobs"
  ON applications FOR UPDATE
  USING (job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid())));

-- MESSAGES policies
CREATE POLICY "Messages are viewable by sender or recipient"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Messages can be inserted by authenticated users"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can mark messages as read"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid());

-- TRANSACTIONS policies
CREATE POLICY "Companies can view their own transactions"
  ON transactions FOR SELECT
  USING (company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Candidates can view their own transactions"
  ON transactions FOR SELECT
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- NOTIFICATIONS policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- REVIEWS policies
CREATE POLICY "Reviews are publicly viewable"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

-- COMMISSION CONFIG policies
CREATE POLICY "Commission config is publicly readable"
  ON commission_config FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify commission config"
  ON commission_config FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE user_type = 'admin'));

-- ============================================
-- ENABLE REALTIME
-- ============================================
-- Run this in the Supabase Dashboard → Database → Replication
-- OR run SQL:

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View: Active jobs with company info
CREATE OR REPLACE VIEW active_jobs AS
SELECT
  j.*,
  cp.company_name,
  cp.company_logo_url,
  cp.industry,
  cp.location AS company_location
FROM jobs j
JOIN company_profiles cp ON j.company_id = cp.id
WHERE j.status = 'open'
ORDER BY j.created_at DESC;

-- View: Platform revenue summary
CREATE OR REPLACE VIEW revenue_summary AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS transaction_count,
  SUM(total_charge_amount) AS total_charged,
  SUM(total_platform_fee_amount) AS platform_revenue,
  SUM(candidate_payout_amount) AS total_payouts
FROM transactions
WHERE status IN ('charge_succeeded', 'payout_succeeded')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- ============================================
-- END SCHEMA
-- ============================================
