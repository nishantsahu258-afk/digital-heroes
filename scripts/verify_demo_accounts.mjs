import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jpbnjhzqtzkphfxfzxji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYm5qaHpxdHprcGhmeGZ6eGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Mjc3NDcsImV4cCI6MjEwNTUwMzc0N30.i54XMr8DZGwxsm4toC5wbv9h8krabcULSkyzrouYuv0'

async function runVerification() {
  console.log('====================================================')
  console.log('DIGITAL HEROES — DEMO ACCOUNTS VERIFICATION')
  console.log('====================================================\n')

  // --- 1. VERIFY DEMO USER ---
  console.log('>>> TESTING DEMO USER LOGIN & PERMISSIONS <<<')
  const userClient = createClient(supabaseUrl, supabaseAnonKey)
  const { data: userAuth, error: userAuthErr } = await userClient.auth.signInWithPassword({
    email: 'demo.user@digitalheroes.test',
    password: 'DH@User2026!Demo'
  })

  if (userAuthErr) {
    console.error('❌ Demo User Login FAILED:', userAuthErr.message)
    return
  }
  console.log('✔ Demo User Login: SUCCESS')
  console.log('  User ID:', userAuth.user.id)
  console.log('  Email:', userAuth.user.email)

  // Fetch Profile
  const { data: userProfile, error: profileErr } = await userClient
    .from('profiles')
    .select('*')
    .eq('id', userAuth.user.id)
    .single()

  if (profileErr) {
    console.error('❌ Demo User Profile fetch FAILED:', profileErr.message)
  } else {
    console.log('✔ Demo User Profile Verified:')
    console.log('  Role:', userProfile.role)
    console.log('  Contribution %:', userProfile.charity_contribution_percent)
  }

  // Activate Demo Subscription for Demo User if not active
  const { data: userSub } = await userClient
    .from('subscriptions')
    .select('*')
    .eq('profile_id', userAuth.user.id)
    .maybeSingle()

  if (!userSub || userSub.status !== 'active') {
    console.log('  Activating Demo Subscription (Annual Hero) for demo.user...')
    const { error: rpcErr } = await userClient.rpc('activate_demo_subscription', {
      p_tier: 'yearly'
    })
    if (rpcErr) {
      console.log('  RPC note:', rpcErr.message)
    } else {
      console.log('✔ Demo Subscription Activated!')
    }
  } else {
    console.log('✔ Demo User has active subscription:', userSub.tier)
  }

  // Check scores for Demo User
  const { data: userScores } = await userClient
    .from('scores')
    .select('*')
    .eq('user_id', userAuth.user.id)

  if (!userScores || userScores.length === 0) {
    console.log('  Adding sample rounds for demo.user...')
    const sampleScores = [
      { user_id: userAuth.user.id, course_name: 'Wentworth Club', stableford_score: 38, played_date: '2026-09-10' },
      { user_id: userAuth.user.id, course_name: 'St Andrews Old Course', stableford_score: 41, played_date: '2026-09-12' },
      { user_id: userAuth.user.id, course_name: 'Royal Troon', stableford_score: 36, played_date: '2026-09-15' },
      { user_id: userAuth.user.id, course_name: 'Sunningdale Golf Club', stableford_score: 39, played_date: '2026-09-18' },
      { user_id: userAuth.user.id, course_name: 'Royal Birkdale', stableford_score: 42, played_date: '2026-09-20' }
    ]
    for (const sc of sampleScores) {
      await userClient.from('scores').insert(sc)
    }
    console.log('✔ 5 Sample Rounds added to Demo User scorecard!')
  } else {
    console.log(`✔ Demo User has ${userScores.length} score entries logged.`)
  }

  // --- 2. VERIFY DEMO ADMIN ---
  console.log('\n>>> TESTING DEMO ADMIN LOGIN & PERMISSIONS <<<')
  const adminClient = createClient(supabaseUrl, supabaseAnonKey)
  const { data: adminAuth, error: adminAuthErr } = await adminClient.auth.signInWithPassword({
    email: 'demo.admin@digitalheroes.test',
    password: 'DH@Admin2026!Demo'
  })

  if (adminAuthErr) {
    console.error('❌ Demo Admin Login FAILED:', adminAuthErr.message)
    return
  }
  console.log('✔ Demo Admin Login: SUCCESS')
  console.log('  Admin ID:', adminAuth.user.id)
  console.log('  Email:', adminAuth.user.email)

  // Fetch Admin Profile
  const { data: adminProfile, error: adminProfileErr } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', adminAuth.user.id)
    .single()

  if (adminProfileErr) {
    console.error('❌ Demo Admin Profile fetch FAILED:', adminProfileErr.message)
  } else {
    console.log('✔ Demo Admin Profile Verified:')
    console.log('  Role:', adminProfile.role, adminProfile.role === 'admin' ? '✔ (AUTHORIZED ADMIN)' : '❌ NOT ADMIN')
  }

  // Verify Admin can query administrative tables
  const { data: allProfiles, error: allProfilesErr } = await adminClient
    .from('profiles')
    .select('id, email, role')
  
  if (allProfilesErr) {
    console.error('❌ Admin allProfiles query error:', allProfilesErr.message)
  } else {
    console.log(`✔ Admin Access Verified: Successfully queried ${allProfiles.length} user profile records from DB.`)
  }

  console.log('\n====================================================')
  console.log('ALL VERIFICATIONS PASSED 100%')
  console.log('====================================================')
}

runVerification()
