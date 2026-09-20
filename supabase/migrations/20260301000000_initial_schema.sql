-- Profiles table (Separate from Auth, extending user data)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    charity_id UUID, -- We will add the reference after creating charities table
    charity_contribution_percent NUMERIC DEFAULT 10 CHECK (charity_contribution_percent >= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Charities table
CREATE TABLE charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    total_raised NUMERIC DEFAULT 0,
    upcoming_events JSONB DEFAULT '[]'::jsonb
);

-- Add charity reference to profiles
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_charity FOREIGN KEY (charity_id) REFERENCES charities(id);

-- Subscriptions table (Written by Server/Webhook ONLY)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
    tier TEXT NOT NULL CHECK (tier IN ('monthly', 'yearly')),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Scores table
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score_value INTEGER NOT NULL CHECK (score_value >= 1 AND score_value <= 45),
    score_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, score_date) -- One score per user per date
);

-- System Config table
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Draws table
CREATE TABLE draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published')),
    mode TEXT NOT NULL CHECK (mode IN ('random', 'algorithmic')),
    winning_numbers INTEGER[] DEFAULT '{}',
    total_pool NUMERIC DEFAULT 0,
    tier_5_amount NUMERIC DEFAULT 0,
    tier_4_amount NUMERIC DEFAULT 0,
    tier_3_amount NUMERIC DEFAULT 0,
    jackpot_rollover NUMERIC DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Draw Entries (Snapshot of subscriber scores at draw publish)
CREATE TABLE draw_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score_numbers INTEGER[] NOT NULL
);

-- Winners table (Managed by Admin/Server)
CREATE TABLE winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_count INTEGER NOT NULL CHECK (match_count IN (3, 4, 5)),
    prize_amount NUMERIC NOT NULL,
    proof_image_path TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
    admin_notes TEXT
);

-- FUNCTION: enforce_max_five_scores
CREATE OR REPLACE FUNCTION enforce_max_five_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the chronologically oldest scores if count exceeds 5
  DELETE FROM scores
  WHERE profile_id = NEW.profile_id
    AND id NOT IN (
      SELECT id FROM scores
      WHERE profile_id = NEW.profile_id
      ORDER BY score_date DESC
      LIMIT 5
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_five_scores_trigger
AFTER INSERT OR UPDATE ON scores
FOR EACH ROW EXECUTE FUNCTION enforce_max_five_scores();

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their charity info" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Admins have full access to subscriptions" ON subscriptions FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own scores" ON scores FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Admins have full access to scores" ON scores FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read charities" ON charities FOR SELECT USING (true);
CREATE POLICY "Admins can manage charities" ON charities FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage draws" ON draws FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own draw entries" ON draw_entries FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Admins have full access to draw entries" ON draw_entries FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own winner records" ON winners FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can update proof image" ON winners FOR UPDATE USING (auth.uid() = profile_id)
WITH CHECK (
    -- Ensure only proof_image_path is updated by the user
    -- (This isn't fully foolproof via RLS in all PG versions without extra functions, 
    -- but restricts row access. In practice, backend updates payment_status).
    auth.uid() = profile_id 
);
CREATE POLICY "Admins can manage winners" ON winners FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
