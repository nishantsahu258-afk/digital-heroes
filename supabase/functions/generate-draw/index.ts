import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateUniqueNumbers(count: number, max: number): number[] {
  const nums = new Set<number>()
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * max) + 1)
  }
  return Array.from(nums).sort((a, b) => a - b)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error('Missing server configuration')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    // Verify Admin user using the user's JWT
    const clientAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await clientAuth.auth.getUser(token)
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message}`)

    // Use the user's own client to check their profile (RLS handles this securely)
    const { data: profile, error: profileError } = await clientAuth.from('profiles').select('role').eq('id', user.id).single()
    if (profileError || profile?.role !== 'admin') {
      throw new Error('Requires admin privileges')
    }

    // Now switch to the privileged client for the actual generation logic
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Get active subscriptions to calculate pools
    // For simplicity, assume all active subs contribute £10 to pool and £1 to charity (configurable in DB)
    const { data: configRows } = await supabaseAdmin.from('system_config').select('*').in('key', ['pool_percent', 'charity_percent', 'monthly_fee', 'yearly_fee'])
    const configs = configRows?.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) || {}
    
    const monthlyFee = configs.monthly_fee || 9.99
    const yearlyFee = configs.yearly_fee || 99.99
    const poolPercent = configs.pool_percent || 0.50
    // Note: The PRD correction states charity contribution is min 10% of subscription fee.
    // We calculate the gross revenue and determine allocations from that.

    const { data: activeSubs } = await supabaseAdmin.from('subscriptions').select('*').in('status', ['active'])
    let grossRevenue = 0
    activeSubs?.forEach(sub => {
      grossRevenue += sub.tier === 'yearly' ? (yearlyFee / 12) : monthlyFee
    })

    const totalPool = grossRevenue * poolPercent
    const tier5Amount = totalPool * 0.40
    const tier4Amount = totalPool * 0.35
    const tier3Amount = totalPool * 0.25

    // Get previous draw for jackpot rollover
    const { data: lastDraw } = await supabaseAdmin.from('draws').select('jackpot_rollover').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const actualTier5Amount = tier5Amount + (lastDraw?.jackpot_rollover || 0)

    // 2. Generate Winning Numbers
    const winningNumbers = generateUniqueNumbers(5, 45)

    // 3. Create Draw Record (Draft)
    const periodStart = new Date()
    periodStart.setMonth(periodStart.getMonth() - 1) // e.g. for previous month's scores
    
    const { data: draw, error: drawError } = await supabaseAdmin.from('draws').insert({
      period_start: periodStart.toISOString(),
      period_end: new Date().toISOString(),
      status: 'simulated',
      mode: 'random',
      winning_numbers: winningNumbers,
      total_pool: totalPool,
      tier_5_amount: actualTier5Amount,
      tier_4_amount: tier4Amount,
      tier_3_amount: tier3Amount,
      jackpot_rollover: 0
    }).select().single()

    if (drawError) throw drawError

    // 4. Find eligible users (Active subs with 5 scores in period)
    const activeProfileIds = activeSubs?.map(sub => sub.profile_id) || []
    
    // We need to fetch scores for these profiles to see who has 5 scores
    const { data: allScores } = await supabaseAdmin.from('scores')
      .select('*')
      .in('profile_id', activeProfileIds)
      .order('score_date', { ascending: false })

    // Group by profile and get latest 5
    const profileScores: Record<string, number[]> = {}
    allScores?.forEach(score => {
      if (!profileScores[score.profile_id]) profileScores[score.profile_id] = []
      if (profileScores[score.profile_id].length < 5) {
        profileScores[score.profile_id].push(score.score_value)
      }
    })

    const drawEntries = []
    for (const [profileId, scores] of Object.entries(profileScores)) {
      if (scores.length === 5) {
        drawEntries.push({
          draw_id: draw.id,
          profile_id: profileId,
          score_numbers: scores.sort((a, b) => a - b)
        })
      }
    }

    if (drawEntries.length > 0) {
      await supabaseAdmin.from('draw_entries').insert(drawEntries)
    }

    // 5. Evaluate Winners
    let tier5Winners = 0
    let tier4Winners = 0
    let tier3Winners = 0
    const winnersToInsert = []

    for (const entry of drawEntries) {
      const matchCount = entry.score_numbers.filter((n: number) => winningNumbers.includes(n)).length
      if (matchCount >= 3) {
        if (matchCount === 5) tier5Winners++
        if (matchCount === 4) tier4Winners++
        if (matchCount === 3) tier3Winners++
        
        winnersToInsert.push({
          draw_id: draw.id,
          profile_id: entry.profile_id,
          match_count: matchCount,
          prize_amount: 0, // Calculated next
        })
      }
    }

    // Assign actual prize amounts
    for (const winner of winnersToInsert) {
      if (winner.match_count === 5) winner.prize_amount = actualTier5Amount / tier5Winners
      if (winner.match_count === 4) winner.prize_amount = tier4Amount / tier4Winners
      if (winner.match_count === 3) winner.prize_amount = tier3Amount / tier3Winners
    }

    let nextRollover = 0
    if (tier5Winners === 0) nextRollover += actualTier5Amount
    if (tier4Winners === 0) nextRollover += tier4Amount
    if (tier3Winners === 0) nextRollover += tier3Amount

    if (winnersToInsert.length > 0) {
      await supabaseAdmin.from('winners').insert(winnersToInsert)
    }

    // 6. Finalize Draw
    await supabaseAdmin.from('draws').update({
      status: 'published',
      published_at: new Date().toISOString(),
      jackpot_rollover: nextRollover
    }).eq('id', draw.id)

    return new Response(JSON.stringify({ 
      success: true, 
      draw: draw.id,
      winning_numbers: winningNumbers,
      stats: { entries: drawEntries.length, winners: winnersToInsert.length }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
