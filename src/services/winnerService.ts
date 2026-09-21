import { supabase } from '@/lib/supabase'
import type { Winner } from '@/types'

export const winnerService = {
  async getLatestWinnerRecordForUser(): Promise<{ winner: Winner; draw: any } | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('winners')
        .select('*, draws(id, period_start, period_end, status, winning_numbers, total_pool)')
        .eq('profile_id', user.id)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.warn('Could not query winners table, returning fallback demo winner:', error)
        return null
      }
      if (!data) return null
      return {
        winner: data as Winner,
        draw: data.draws
      }
    } catch {
      return null
    }
  },

  async uploadProofImage(file: File, drawId?: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${drawId || 'demo'}-${Date.now()}.${fileExt}`

    try {
      await supabase.storage
        .from('winner-proofs')
        .upload(filePath, file, { upsert: true })
    } catch (e) {
      console.warn('Storage upload fallback:', e)
    }

    // Try updating DB if winner row exists
    if (drawId) {
      try {
        await supabase
          .from('winners')
          .update({ 
            proof_image_path: filePath,
            verification_status: 'pending'
          })
          .eq('draw_id', drawId)
          .eq('profile_id', user.id)
      } catch (e) {
        console.warn('Winner row update fallback:', e)
      }
    }

    return filePath
  },

  async getSignedProofUrl(filePath: string): Promise<string | null> {
    if (!filePath) return null
    try {
      if (filePath.startsWith('http')) return filePath
      
      const { data, error } = await supabase.storage
        .from('winner-proofs')
        .createSignedUrl(filePath, 3600)

      if (error || !data) return null
      return data.signedUrl
    } catch {
      return null
    }
  },

  async getAllWinnersAdmin(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select('*, profiles(email), draws(period_end, winning_numbers)')
      if (error) return []
      return data || []
    } catch {
      return []
    }
  },

  async reviewWinnerAdmin(winnerId: string, verification_status: 'approved' | 'rejected', admin_notes?: string): Promise<void> {
    const { error } = await supabase
      .from('winners')
      .update({
        verification_status,
        admin_notes: admin_notes || null
      })
      .eq('id', winnerId)
    if (error) throw error
  },

  async updatePayoutAdmin(winnerId: string, payment_status: 'pending' | 'paid'): Promise<void> {
    const { error } = await supabase
      .from('winners')
      .update({ payment_status })
      .eq('id', winnerId)
    if (error) throw error
  }
}
