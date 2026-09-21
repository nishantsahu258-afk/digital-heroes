-- ============================================================
-- DEMO PAYMENT & SUBSCRIPTION MODE SUPPORT
-- ============================================================

-- 1. Policies allowing users to insert/update their own subscription row (fallback)
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions 
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions 
  FOR UPDATE USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- 2. Secure RPC to activate demo subscription
CREATE OR REPLACE FUNCTION public.activate_demo_subscription(tier_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_tier text;
  v_end_date timestamptz;
  v_existing_id uuid;
  v_sub record;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF tier_input NOT IN ('monthly', 'yearly') THEN
    RAISE EXCEPTION 'Invalid tier: must be monthly or yearly';
  END IF;

  v_tier := tier_input;

  IF v_tier = 'yearly' THEN
    v_end_date := timezone('utc'::text, now()) + interval '1 year';
  ELSE
    v_end_date := timezone('utc'::text, now()) + interval '1 month';
  END IF;

  SELECT id INTO v_existing_id
  FROM public.subscriptions
  WHERE profile_id = v_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.subscriptions
    SET
      status = 'active',
      tier = v_tier,
      current_period_end = v_end_date,
      stripe_customer_id = 'demo_cust_' || substr(v_user_id::text, 1, 8),
      stripe_subscription_id = 'demo_sub_' || substr(v_user_id::text, 1, 8) || '_' || extract(epoch from now())::bigint
    WHERE id = v_existing_id
    RETURNING * INTO v_sub;
  ELSE
    INSERT INTO public.subscriptions (
      profile_id,
      status,
      tier,
      current_period_end,
      stripe_customer_id,
      stripe_subscription_id
    )
    VALUES (
      v_user_id,
      'active',
      v_tier,
      v_end_date,
      'demo_cust_' || substr(v_user_id::text, 1, 8),
      'demo_sub_' || substr(v_user_id::text, 1, 8) || '_' || extract(epoch from now())::bigint
    )
    RETURNING * INTO v_sub;
  END IF;

  RETURN row_to_json(v_sub);
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_demo_subscription(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_demo_subscription(text) TO service_role;

-- 3. Secure RPC to record a demo donation
CREATE OR REPLACE FUNCTION public.record_demo_donation(charity_id_input uuid, amount_input numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_charity record;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF amount_input IS NULL OR amount_input <= 0 THEN
    RAISE EXCEPTION 'Invalid donation amount';
  END IF;

  UPDATE public.charities
  SET total_raised = COALESCE(total_raised, 0) + amount_input
  WHERE id = charity_id_input
  RETURNING * INTO v_charity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Charity not found';
  END IF;

  RETURN row_to_json(v_charity);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_demo_donation(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_demo_donation(uuid, numeric) TO service_role;
