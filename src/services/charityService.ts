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

  async updateProfileCharity(charityId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ charity_id: charityId })
      .eq('id', user.id)

    if (error) throw error
  }
}
