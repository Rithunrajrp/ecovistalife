-- ============================================
-- CRM Portal Database Migration
-- ============================================

-- ============================================
-- 1. ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE lead_source AS ENUM ('website_form', 'phone', 'email', 'referral', 'social', 'other');
CREATE TYPE lead_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE deal_stage AS ENUM ('qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task', 'site_visit', 'follow_up');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'other');
CREATE TYPE document_category AS ENUM ('contract', 'proposal', 'invoice', 'identity', 'property', 'legal', 'brochure', 'other');

-- ============================================
-- 2. DEPARTMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  head_id UUID, -- Will be set after profiles table exists
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to departments for head_id
ALTER TABLE departments ADD CONSTRAINT fk_departments_head
  FOREIGN KEY (head_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================
-- 4. PORTAL INVITATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS portal_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. LEADS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact Information
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,

  -- Lead Details
  source lead_source NOT NULL DEFAULT 'website_form',
  status lead_status NOT NULL DEFAULT 'new',
  priority lead_priority DEFAULT 'medium',
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),

  -- Assignment
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Interest
  interested_in_project UUID REFERENCES projects(id) ON DELETE SET NULL,
  budget_range TEXT,
  initial_message TEXT,

  -- Tags & Custom Data
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',

  -- Tracking
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. DEALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Deal Information
  title TEXT NOT NULL,
  description TEXT,
  stage deal_stage NOT NULL DEFAULT 'qualification',

  -- Financial
  deal_value DECIMAL(15, 2),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),

  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timeline
  expected_close_date DATE,
  actual_close_date DATE,

  -- Tracking
  loss_reason TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update leads table with deal reference
ALTER TABLE leads ADD COLUMN converted_to_deal_id UUID REFERENCES deals(id) ON DELETE SET NULL;

-- ============================================
-- 7. ACTIVITIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Polymorphic relationship
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,

  -- Activity Details
  type activity_type NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,

  -- Timing
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,

  -- Task-specific fields
  due_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Ownership
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure at least one parent reference
  CONSTRAINT activity_has_parent CHECK (lead_id IS NOT NULL OR deal_id IS NOT NULL)
);

-- ============================================
-- 8. INVOICES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,

  -- Relationships
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,

  -- Invoice Details
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,

  -- Line items: [{description, quantity, unit_price, tax_rate, amount}]
  line_items JSONB NOT NULL DEFAULT '[]',

  -- Amounts
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15, 2) DEFAULT 0,

  -- Notes
  notes TEXT,
  terms TEXT,

  -- Ownership
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_number TEXT UNIQUE NOT NULL,

  -- Relationships
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,

  -- Payment Details
  amount DECIMAL(15, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',

  -- Transaction Info
  reference_number TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Payer Info
  payer_name TEXT,

  -- Tracking
  processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- File Information
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  description TEXT,

  -- Storage
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'documents',
  public_url TEXT,

  -- File Metadata
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,

  -- Classification
  category document_category NOT NULL DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',

  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Access Control
  is_confidential BOOLEAN DEFAULT FALSE,

  -- Ownership
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 11. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Notification Details
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,

  -- Reference
  reference_type TEXT,
  reference_id UUID,
  action_url TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 12. INDEXES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_department ON profiles(department_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Departments
CREATE INDEX idx_departments_head ON departments(head_id);

-- Portal Invitations
CREATE INDEX idx_portal_invitations_token ON portal_invitations(token);
CREATE INDEX idx_portal_invitations_email ON portal_invitations(email);

-- Leads
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_by ON leads(created_by);
CREATE INDEX idx_leads_project ON leads(interested_in_project);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);

-- Deals
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_lead ON deals(lead_id);
CREATE INDEX idx_deals_project ON deals(project_id);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);

-- Activities
CREATE INDEX idx_activities_lead ON activities(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_activities_deal ON activities(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_performed_by ON activities(performed_by);
CREATE INDEX idx_activities_date ON activities(activity_date DESC);
CREATE INDEX idx_activities_due_date ON activities(due_date) WHERE type = 'task' AND is_completed = FALSE;

-- Invoices
CREATE INDEX idx_invoices_deal ON invoices(deal_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Payments
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);

-- Documents
CREATE INDEX idx_documents_lead ON documents(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_documents_deal ON documents(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_documents_project ON documents(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 13. HELPER FUNCTIONS
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM profiles WHERE id = auth.uid() AND is_active = TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is manager or admin
CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role IN ('admin', 'manager') FROM profiles WHERE id = auth.uid() AND is_active = TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT := TO_CHAR(CURRENT_DATE, 'YY');
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
  INTO next_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_suffix || '-%';

  NEW.invoice_number := 'INV-' || year_suffix || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT := TO_CHAR(CURRENT_DATE, 'YY');
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 8) AS INTEGER)), 0) + 1
  INTO next_num
  FROM payments
  WHERE payment_number LIKE 'PAY-' || year_suffix || '-%';

  NEW.payment_number := 'PAY-' || year_suffix || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 14. TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate invoice number
CREATE TRIGGER before_invoice_insert
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- Auto-generate payment number
CREATE TRIGGER before_payment_insert
  BEFORE INSERT ON payments
  FOR EACH ROW
  WHEN (NEW.payment_number IS NULL)
  EXECUTE FUNCTION generate_payment_number();

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 15. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
  USING (is_active = TRUE OR id = auth.uid() OR is_admin());

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "profiles_admin_all" ON profiles FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DEPARTMENTS POLICIES
CREATE POLICY "departments_select" ON departments FOR SELECT TO authenticated
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "departments_admin" ON departments FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- PORTAL INVITATIONS POLICIES
CREATE POLICY "invitations_admin" ON portal_invitations FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- LEADS POLICIES
CREATE POLICY "leads_select" ON leads FOR SELECT TO authenticated
  USING (
    is_admin()
    OR is_manager_or_above()
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  );

CREATE POLICY "leads_insert" ON leads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "leads_update" ON leads FOR UPDATE TO authenticated
  USING (
    is_admin()
    OR is_manager_or_above()
    OR assigned_to = auth.uid()
  );

CREATE POLICY "leads_delete" ON leads FOR DELETE TO authenticated
  USING (is_admin());

-- DEALS POLICIES
CREATE POLICY "deals_select" ON deals FOR SELECT TO authenticated
  USING (
    is_admin()
    OR is_manager_or_above()
    OR owner_id = auth.uid()
    OR created_by = auth.uid()
  );

CREATE POLICY "deals_insert" ON deals FOR INSERT TO authenticated
  WITH CHECK (is_manager_or_above() OR owner_id = auth.uid());

CREATE POLICY "deals_update" ON deals FOR UPDATE TO authenticated
  USING (
    is_admin()
    OR is_manager_or_above()
    OR owner_id = auth.uid()
  );

CREATE POLICY "deals_delete" ON deals FOR DELETE TO authenticated
  USING (is_admin());

-- ACTIVITIES POLICIES
CREATE POLICY "activities_select" ON activities FOR SELECT TO authenticated
  USING (
    is_admin()
    OR performed_by = auth.uid()
    OR (lead_id IS NOT NULL AND EXISTS (SELECT 1 FROM leads WHERE leads.id = activities.lead_id))
    OR (deal_id IS NOT NULL AND EXISTS (SELECT 1 FROM deals WHERE deals.id = activities.deal_id))
  );

CREATE POLICY "activities_insert" ON activities FOR INSERT TO authenticated
  WITH CHECK (performed_by = auth.uid());

CREATE POLICY "activities_update" ON activities FOR UPDATE TO authenticated
  USING (performed_by = auth.uid() OR is_admin());

CREATE POLICY "activities_delete" ON activities FOR DELETE TO authenticated
  USING (performed_by = auth.uid() OR is_admin());

-- INVOICES POLICIES
CREATE POLICY "invoices_select" ON invoices FOR SELECT TO authenticated
  USING (
    is_manager_or_above()
    OR created_by = auth.uid()
    OR (deal_id IS NOT NULL AND EXISTS (SELECT 1 FROM deals WHERE deals.id = invoices.deal_id AND deals.owner_id = auth.uid()))
  );

CREATE POLICY "invoices_insert" ON invoices FOR INSERT TO authenticated
  WITH CHECK (is_manager_or_above());

CREATE POLICY "invoices_update" ON invoices FOR UPDATE TO authenticated
  USING (is_admin() OR (is_manager_or_above() AND created_by = auth.uid()));

CREATE POLICY "invoices_delete" ON invoices FOR DELETE TO authenticated
  USING (is_admin());

-- PAYMENTS POLICIES
CREATE POLICY "payments_select" ON payments FOR SELECT TO authenticated
  USING (
    is_manager_or_above()
    OR (invoice_id IS NOT NULL AND EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id))
  );

CREATE POLICY "payments_insert" ON payments FOR INSERT TO authenticated
  WITH CHECK (is_manager_or_above());

CREATE POLICY "payments_update" ON payments FOR UPDATE TO authenticated
  USING (is_admin());

CREATE POLICY "payments_delete" ON payments FOR DELETE TO authenticated
  USING (is_admin());

-- DOCUMENTS POLICIES
CREATE POLICY "documents_select" ON documents FOR SELECT TO authenticated
  USING (
    is_admin()
    OR uploaded_by = auth.uid()
    OR (NOT is_confidential AND (
      (lead_id IS NOT NULL AND EXISTS (SELECT 1 FROM leads WHERE leads.id = documents.lead_id))
      OR (deal_id IS NOT NULL AND EXISTS (SELECT 1 FROM deals WHERE deals.id = documents.deal_id))
      OR project_id IS NOT NULL
    ))
  );

CREATE POLICY "documents_insert" ON documents FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "documents_update" ON documents FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR is_admin());

CREATE POLICY "documents_delete" ON documents FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR is_admin());

-- NOTIFICATIONS POLICIES
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_delete" ON notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 16. MIGRATE ENQUIRIES TO LEADS (BACKUP FIRST)
-- ============================================

-- Create backup of enquiries
CREATE TABLE IF NOT EXISTS enquiries_backup AS SELECT * FROM enquiries;

-- Migrate enquiries to leads
INSERT INTO leads (first_name, email, phone, source, status, initial_message, created_at)
SELECT
  name,
  email,
  phone,
  'website_form'::lead_source,
  CASE WHEN status = 'contacted' THEN 'contacted'::lead_status ELSE 'new'::lead_status END,
  message,
  created_at
FROM enquiries
ON CONFLICT DO NOTHING;

-- ============================================
-- 17. SEED DEFAULT DEPARTMENT
-- ============================================

INSERT INTO departments (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sales', 'Sales and Business Development')
ON CONFLICT DO NOTHING;
