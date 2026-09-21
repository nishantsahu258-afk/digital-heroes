import { supabase } from '@/lib/supabase'
import type { Charity } from '@/types'

export const charityService = {
  async getCharities(): Promise<Charity[]> {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  async getFeaturedCharity(): Promise<Charity | null> {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('is_featured', true)
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getCharityById(id: string): Promise<Charity | null> {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async updateProfileCharity(charityId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ charity_id: charityId })
      .eq('id', user.id)

    if (error) throw error
  },

  async recordDemoDonation(charityId: string, amount: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Try RPC first
    try {
      const { data, error } = await supabase.rpc('record_demo_donation', {
        charity_id_input: charityId,
        amount_input: amount
      })
      if (!error && data) return
    } catch (rpcErr) {
      console.warn('RPC record_demo_donation error, trying direct update', rpcErr)
    }

    // Direct fallback
    const { data: charity, error: fetchErr } = await supabase
      .from('charities')
      .select('total_raised')
      .eq('id', charityId)
      .single()

    if (fetchErr) throw fetchErr

    const newTotal = (charity?.total_raised || 0) + amount
    const { error: updateErr } = await supabase
      .from('charities')
      .update({ total_raised: newTotal })
      .eq('id', charityId)

    if (updateErr) throw updateErr
  }
}
