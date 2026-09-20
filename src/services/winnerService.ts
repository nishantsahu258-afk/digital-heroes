import { supabase } from '@/lib/supabase'

export const winnerService = {
  async uploadProofImage(file: File, drawId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${drawId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(filePath)

    // Update winner record
    const { error: updateError } = await supabase
      .from('winners')
      .update({ 
        proof_image_path: publicUrl,
        verification_status: 'pending'
      })
      .eq('draw_id', drawId)
      .eq('profile_id', user.id)

    if (updateError) throw updateError

    return publicUrl
  }
}
