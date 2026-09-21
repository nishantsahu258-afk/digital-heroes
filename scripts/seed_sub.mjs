import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jpbnjhzqtzkphfxfzxji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYm5qaHpxdHprcGhmeGZ6eGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Mjc3NDcsImV4cCI6MjEwNTUwMzc0N30.i54XMr8DZGwxsm4toC5wbv9h8krabcULSkyzrouYuv0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedUserSubscription() {
  const { data: userAuth } = await supabase.auth.signInWithPassword({
    email: 'demo.user@digitalheroes.test',
    password: 'DH@User2026!Demo'
  })

  if (userAuth?.user) {
    const userId = userAuth.user.id
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle()

    if (!existingSub) {
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      
      const { error } = await supabase.from('subscriptions').insert({
        profile_id: userId,
        status: 'active',
        tier: 'yearly',
        current_period_end: nextYear.toISOString()
      })
      console.log('Inserted active annual subscription for demo.user:', error ? error.message : 'SUCCESS')
    } else {
      console.log('Subscription already exists:', existingSub)
    }
  }
}

seedUserSubscription()
