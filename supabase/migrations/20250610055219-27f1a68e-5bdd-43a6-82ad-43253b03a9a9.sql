
-- Digital Chamas Tables
CREATE TABLE public.chamas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  contribution_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  contribution_amount NUMERIC(12,2) NOT NULL,
  max_members INTEGER DEFAULT 50,
  current_members INTEGER DEFAULT 0,
  total_savings NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.chama_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(20) DEFAULT 'member',
  total_contributed NUMERIC(12,2) DEFAULT 0,
  last_contribution_date TIMESTAMP WITH TIME ZONE,
  auto_debit_enabled BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.chama_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.chama_members(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.chama_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES public.chama_members(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  interest_rate NUMERIC(5,2) DEFAULT 5.0,
  duration_months INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  repaid_amount NUMERIC(12,2) DEFAULT 0,
  due_date DATE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.chama_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  initiated_by UUID REFERENCES public.chama_members(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  vote_type VARCHAR(50) NOT NULL,
  reference_id UUID,
  status VARCHAR(20) DEFAULT 'active',
  yes_votes INTEGER DEFAULT 0,
  no_votes INTEGER DEFAULT 0,
  total_eligible_voters INTEGER DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Micro-Investments Tables
CREATE TABLE public.investment_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  target_amount NUMERIC(12,2) NOT NULL,
  minimum_investment NUMERIC(12,2) DEFAULT 100,
  current_funding NUMERIC(12,2) DEFAULT 0,
  projected_roi NUMERIC(5,2) NOT NULL,
  risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
  duration_months INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  business_owner_id UUID NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  funding_deadline DATE,
  project_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.investment_projects(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL,
  amount_invested NUMERIC(12,2) NOT NULL,
  shares_percentage NUMERIC(8,5) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  returns_earned NUMERIC(12,2) DEFAULT 0,
  last_return_date TIMESTAMP WITH TIME ZONE,
  exit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.investment_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  update_type VARCHAR(50) DEFAULT 'progress',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Education & Tuition Wallets Tables
CREATE TABLE public.student_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  school_name VARCHAR(255),
  class_level VARCHAR(50),
  balance NUMERIC(12,2) DEFAULT 0,
  target_amount NUMERIC(12,2),
  target_deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.tuition_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.student_wallets(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  school_paybill VARCHAR(20),
  receipt_number VARCHAR(100),
  term VARCHAR(20),
  academic_year VARCHAR(10),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.wallet_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.student_wallets(id) ON DELETE CASCADE,
  sponsor_name VARCHAR(255) NOT NULL,
  sponsor_phone VARCHAR(20),
  sponsor_email VARCHAR(255),
  total_contributed NUMERIC(12,2) DEFAULT 0,
  relationship VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.sponsor_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES public.wallet_sponsors(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.chamas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Chamas
CREATE POLICY "Users can view chamas they are members of" ON public.chamas
  FOR SELECT USING (
    id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create chamas" ON public.chamas
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chama admins can update their chamas" ON public.chamas
  FOR UPDATE USING (
    id IN (
      SELECT chama_id FROM public.chama_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'treasurer')
    )
  );

-- RLS Policies for Chama Members
CREATE POLICY "Users can view chama members of their chamas" ON public.chama_members
  FOR SELECT USING (
    chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Chama admins can manage members" ON public.chama_members
  FOR ALL USING (
    chama_id IN (
      SELECT chama_id FROM public.chama_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Investment Projects
CREATE POLICY "Anyone can view active investment projects" ON public.investment_projects
  FOR SELECT USING (status = 'open' OR status = 'funded');

CREATE POLICY "Business owners can manage their projects" ON public.investment_projects
  FOR ALL USING (business_owner_id = auth.uid());

-- RLS Policies for User Investments
CREATE POLICY "Users can view their investments" ON public.user_investments
  FOR SELECT USING (investor_id = auth.uid());

CREATE POLICY "Users can create investments" ON public.user_investments
  FOR INSERT WITH CHECK (investor_id = auth.uid());

-- RLS Policies for Student Wallets
CREATE POLICY "Parents can manage their student wallets" ON public.student_wallets
  FOR ALL USING (parent_id = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_chama_members_user_id ON public.chama_members(user_id);
CREATE INDEX idx_chama_members_chama_id ON public.chama_members(chama_id);
CREATE INDEX idx_user_investments_investor_id ON public.user_investments(investor_id);
CREATE INDEX idx_user_investments_project_id ON public.user_investments(project_id);
CREATE INDEX idx_student_wallets_parent_id ON public.student_wallets(parent_id);
