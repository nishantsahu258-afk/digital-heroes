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
  }
}
