import { supabase } from '@/lib/supabase'

export const authService = {
  async getSubscription(): Promise<any | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('profile_id', user.id)
      .in('status', ['active', 'past_due'])
      .maybeSingle()

    if (error) throw error
    return data
  },

  async createCheckoutSession(tier: 'monthly' | 'yearly'): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tier })
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to create checkout session')
    }

    const { url } = await response.json()
    return url
  },

  async activateDemoSubscription(tier: 'monthly' | 'yearly'): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Try RPC first
    try {
      const { data, error } = await supabase.rpc('activate_demo_subscription', {
        tier_input: tier
      })
      if (!error && data) {
        return data
      }
    } catch (rpcErr) {
      console.warn('RPC activate_demo_subscription error, falling back to direct query', rpcErr)
    }

    // Direct table fallback
    const endDate = new Date(
      tier === 'yearly' 
        ? Date.now() + 365 * 24 * 60 * 60 * 1000 
        : Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingSub) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          tier,
          current_period_end: endDate,
          stripe_customer_id: `demo_cust_${user.id.slice(0, 8)}`,
          stripe_subscription_id: `demo_sub_${user.id.slice(0, 8)}_${Date.now()}`
        })
        .eq('id', existingSub.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          profile_id: user.id,
          status: 'active',
          tier,
          current_period_end: endDate,
          stripe_customer_id: `demo_cust_${user.id.slice(0, 8)}`,
          stripe_subscription_id: `demo_sub_${user.id.slice(0, 8)}_${Date.now()}`
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  }
}
