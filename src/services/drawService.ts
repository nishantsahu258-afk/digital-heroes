import { supabase } from '@/lib/supabase'
import type { Draw, DrawEntry, Winner } from '@/types'

export const drawService = {
  async getLatestPublishedDraw(): Promise<Draw | null> {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getDraws(): Promise<Draw[]> {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getMyDrawEntry(drawId: string): Promise<DrawEntry | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('draw_entries')
      .select('*')
      .eq('draw_id', drawId)
      .eq('profile_id', user.id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getMyWinnings(drawId: string): Promise<Winner | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('winners')
      .select('*')
      .eq('draw_id', drawId)
      .eq('profile_id', user.id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async generateDrawAsAdmin(mode: 'random' | 'algorithmic' = 'random'): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-draw`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'simulate', mode })
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to generate draw')
    }

    return await response.json()
  },

  async getUserWinnings(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('winners')
      .select('*, draws(period_end, mode, winning_numbers)')
      .eq('profile_id', user.id)

    if (error) throw error
    // Sort manually by draw period end
    const sorted = (data || []).sort((a, b) => {
      if (!a.draws || !b.draws) return 0;
      return new Date(b.draws.period_end).getTime() - new Date(a.draws.period_end).getTime();
    });
    return sorted;
  }
}
