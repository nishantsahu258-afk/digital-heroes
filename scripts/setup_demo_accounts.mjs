import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jpbnjhzqtzkphfxfzxji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYm5qaHpxdHprcGhmeGZ6eGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Mjc3NDcsImV4cCI6MjEwNTUwMzc0N30.i54XMr8DZGwxsm4toC5wbv9h8krabcULSkyzrouYuv0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupAccounts() {
  console.log('--- Setting up Demo Accounts ---')
  
  const userAccount = {
    email: 'demo.user@digitalheroes.test',
    password: 'DH@User2026!Demo',
    role: 'user'
  }

  const adminAccount = {
    email: 'demo.admin@digitalheroes.test',
    password: 'DH@Admin2026!Demo',
    role: 'admin'
  }

  for (const acc of [userAccount, adminAccount]) {
    console.log(`\nProcessing ${acc.email}...`)
    
    // Attempt sign in first
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password
    })

    if (signInError) {
      console.log(`SignIn failed (${signInError.message}). Attempting signUp...`)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: acc.email,
        password: acc.password,
        options: {
          data: {
            role: acc.role
          }
        }
      })

      if (signUpError) {
        console.error(`SignUp error for ${acc.email}:`, signUpError.message)
      } else {
        console.log(`SignUp successful for ${acc.email}. User ID:`, signUpData.user?.id)
        if (signUpData.session) {
          console.log(`Session established immediately (Email auto-confirmed)!`)
        } else {
          console.log(`Session not returned. Email confirmation might be required in project settings.`)
        }
      }

      // Try sign in again
      const retrySignIn = await supabase.auth.signInWithPassword({
        email: acc.email,
        password: acc.password
      })
      if (retrySignIn.error) {
        console.error(`Retry SignIn error:`, retrySignIn.error.message)
      } else {
        console.log(`Retry SignIn SUCCESS for ${acc.email}!`)
        signInData = retrySignIn.data
      }
    } else {
      console.log(`SignIn SUCCESS for ${acc.email}! User ID:`, signInData?.user?.id)
    }

    // Now verify / update profile role
    if (signInData?.user) {
      const userId = signInData.user.id
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log(`Current profile for ${acc.email}:`, profileData, profileErr ? `Error: ${profileErr.message}` : '')

      if (acc.role === 'admin' && profileData?.role !== 'admin') {
        console.log(`Updating ${acc.email} profile role to 'admin'...`)
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId)
        
        if (updateErr) {
          console.error(`Failed to update profile role:`, updateErr.message)
        } else {
          console.log(`Successfully updated ${acc.email} to role 'admin'!`)
        }
      }
    }
  }
}

setupAccounts().then(() => console.log('\nFinished account setup.'))
