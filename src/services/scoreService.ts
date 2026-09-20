import { supabase } from '@/lib/supabase'
import type { Score } from '@/types'

export const scoreService = {
  async getScores(): Promise<Score[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('profile_id', user.id)
      .order('score_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getRecentScores(limit: number = 5): Promise<Score[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('profile_id', user.id)
      .order('score_date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async submitScore(scoreValue: number, scoreDate: string): Promise<Score> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('scores')
      .insert({
        profile_id: user.id,
        score_value: scoreValue,
        score_date: scoreDate
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteScore(scoreId: string): Promise<void> {
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)

    if (error) throw error
  }
}
