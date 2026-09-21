import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/layouts/Navbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, useReducedMotion } from 'framer-motion'
import { charityService } from '@/services/charityService'
import type { Charity } from '@/types'

export default function Signup() {
  const navigate = useNavigate()
  const { user, profile, isLoading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [handicap, setHandicap] = useState('')
  const [charity, setCharity] = useState('')
  const [charitiesList, setCharitiesList] = useState<Charity[]>([])
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const shakeAnimation = error && !prefersReducedMotion ? { x: [-2, 2, -2, 2, 0] } : {}

  useEffect(() => {
    async function fetchCharities() {
      try {
        const data = await charityService.getCharities()
        setCharitiesList(data)
        if (data.length > 0) {
          setCharity(data[0].id)
        }
      } catch (err) {
        console.error("Failed to load charities", err)
      }
    }
    fetchCharities()
  }, [])

  useEffect(() => {
    if (!isLoading && user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, profile, isLoading, navigate])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError("You must agree to the Terms of Service to continue.")
      return
    }
    setLoading(true)
    setError(null)
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          handicap: handicap,
          charity_id: charity
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-[600px] shadow-xl shadow-black/5 border-foreground/5 py-4">
          <CardHeader className="pb-8">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-serif text-foreground mb-2">Create Your Account</CardTitle>
                <CardDescription className="text-base text-foreground/60">Join the premium community of Digital Heroes</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2">Step 1 of 3</div>
                <div className="flex gap-1">
                  <div className="w-8 h-1 bg-primary rounded-full"></div>
                  <div className="w-8 h-1 bg-foreground/10 rounded-full"></div>
                  <div className="w-8 h-1 bg-foreground/10 rounded-full"></div>
                </div>
              </div>
            </div>
          </CardHeader>
          <motion.form animate={shakeAnimation} transition={{ duration: 0.3 }} onSubmit={handleSignup}>
            <CardContent className="space-y-6 pt-6">
              {error && <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md">{error}</div>}
              
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-xs font-bold text-foreground">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="Sarah Jenkins" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-bold text-foreground">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="sarah@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="handicap" className="text-xs font-bold text-foreground">Handicap (Optional)</Label>
                  <Input 
                    id="handicap" 
                    placeholder="14.2" 
                    value={handicap}
                    onChange={(e) => setHandicap(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-xs font-bold text-foreground">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <div className="absolute right-3 top-3 text-foreground/40">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-foreground">Primary Charity Preference</Label>
                <Select value={charity} onValueChange={setCharity}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a charity" />
                  </SelectTrigger>
                  <SelectContent>
                    {charitiesList.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold text-foreground">Select Plan</Label>
                <div className="flex bg-foreground/5 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPlan('monthly')}
                    className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors ${plan === 'monthly' ? 'bg-white shadow-sm text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
                  >
                    Monthly Supporter (£9.99/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan('annual')}
                    className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors ${plan === 'annual' ? 'bg-white shadow-sm text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
                  >
                    Annual Hero (£99.99/yr)
                  </button>
                </div>
              </div>

              <div className="bg-foreground/5 rounded-lg p-6 space-y-3">
                <div className="text-xs font-bold text-foreground mb-4">Subscription Summary</div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Membership Fee</span>
                  <span className="font-medium text-foreground">{plan === 'monthly' ? '£9.99' : '£99.99'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">10% Allocated to Charity</span>
                  <span className="font-medium text-foreground">{plan === 'monthly' ? '£1.00' : '£10.00'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 border-foreground/20 text-primary focus:ring-primary rounded" 
                />
                <Label htmlFor="terms" className="text-xs text-foreground/70 leading-relaxed font-normal">
                  I agree to the Terms of Service, Privacy Policy, and understand 10% of my fee goes directly to our certified charity pool.
                </Label>
              </div>

            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-2">
              <Button type="submit" className="w-full h-14 text-lg font-medium rounded-md bg-primary text-white hover:bg-primary/90" disabled={loading}>
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  'Create Account & Pay'
                )}
              </Button>
              <div className="text-sm text-center text-foreground/50">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
              </div>
            </CardFooter>
          </motion.form>
        </Card>
      </div>
    </div>
  )
}
