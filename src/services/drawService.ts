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

  async generateDrawAsAdmin(): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-draw`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to generate draw')
    }

    return await response.json()
  }
}
