import { useState, useEffect } from 'react'
import { Navbar } from '@/layouts/Navbar'
import { Footer } from '@/layouts/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { authService } from '@/services/authService'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Subscription() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'cancelled') {
      setError('Checkout was cancelled. Please try again.')
    }
    if (params.get('checkout') === 'success') {
      setSuccess('Subscription successful! Welcome to the premium tier.')
    }
  }, [])

  const handleSubscribe = async (tier: 'monthly' | 'yearly') => {
    if (!user) {
      navigate('/login?redirect=subscription')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const url = await authService.createCheckoutSession(tier)
      window.location.href = url
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24">
        
        {/* Header */}
        <section className="px-4 py-20 text-center max-w-3xl mx-auto">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">
            Become a Digital Hero
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6 leading-tight">
            Play, Win, and Give Back
          </h1>
          <p className="text-foreground/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Choose your impact level. Verified members gain access to premium monthly draws while actively contributing to verified charity partners.
          </p>

          {error && <div className="mb-6 p-4 text-sm bg-destructive/10 text-destructive rounded">{error}</div>}
          {success && <div className="mb-6 p-4 text-sm bg-primary/10 text-primary rounded">{success}</div>}

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-foreground' : 'text-foreground/50'}`}>Billed Monthly</span>
            <button 
              type="button"
              onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-12 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center px-1"
            >
              <motion.div 
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-4 h-4 rounded-full shadow-sm ${billing === 'monthly' ? 'bg-foreground/50' : 'bg-primary'}`}
                style={{ marginLeft: billing === 'yearly' ? 'auto' : 0 }}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${billing === 'yearly' ? 'text-foreground' : 'text-foreground/50'}`}>Billed Annually</span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-accent/10 text-accent-foreground px-2 py-0.5 rounded text-accent">Save 17%</span>
            </div>
          </div>
        </section>

        <section className="px-4 max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-32">
          {/* Monthly Card */}
          <Card className={`border-2 shadow-sm relative ${billing === 'monthly' ? 'border-primary' : 'border-foreground/5'}`}>
            <CardContent className="p-10">
              <h2 className="text-2xl font-serif text-foreground mb-2">Monthly Supporter</h2>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-serif text-foreground">£9.99</span>
                <span className="text-foreground/50 text-sm">/ mo</span>
              </div>
              <p className="text-sm text-foreground/70 mb-10 leading-relaxed">
                Join the platform on a flexible monthly basis. Support verified campaigns and enter our draws.
              </p>
              
              <ul className="space-y-6 mb-10">
                <li className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground/80">1 Entry into the Premium Monthly Draw</span>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground/80">Stableford & Handicap Score Tracking</span>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground/80">10% of monthly fee allocated to charity pool</span>
                </li>
                <li className="flex gap-4 opacity-50">
                  <div className="mt-1 w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                    <span className="text-foreground/40 text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground/80">Access to official partner charity directory</span>
                </li>
              </ul>
              
              <Button 
                disabled={loading}
                onClick={() => handleSubscribe('monthly')}
                className={`w-full h-12 text-base font-medium rounded-md ${billing === 'monthly' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-foreground/5 text-foreground hover:bg-foreground/10'}`}>
                {loading && billing === 'monthly' ? 'Processing...' : 'Get Started Monthly'}
              </Button>
            </CardContent>
          </Card>

          {/* Annual Card */}
          <Card className={`border-2 shadow-lg relative ${billing === 'yearly' ? 'border-primary' : 'border-foreground/5'}`}>
            <div className="absolute top-8 right-8 text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent-foreground px-3 py-1 rounded">
              Best Value
            </div>
            <CardContent className="p-10">
              <h2 className="text-2xl font-serif text-foreground mb-2">Annual Hero</h2>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-serif text-foreground">£99.99</span>
                <span className="text-foreground/50 text-sm">/ year</span>
              </div>
              <p className="text-sm text-foreground/70 mb-10 leading-relaxed">
                Our most popular tier. Commit to a year of playing and giving back, unlocking premium benefits.
              </p>
              
              <ul className="space-y-6 mb-10">
                <li className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground/80">Double Draw Entries (2x Entries Monthly)</span>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground/80">Stableford & Handicap Score Tracking</span>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground/80">10% of annual fee goes instantly to charity</span>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground/80">Priority Draw Verification & Payout</span>
                </li>
              </ul>
              
              <Button 
                disabled={loading}
                onClick={() => handleSubscribe('yearly')}
                className={`w-full h-12 text-base font-medium rounded-md ${billing === 'yearly' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-foreground/5 text-foreground hover:bg-foreground/10'}`}>
                {loading && billing === 'yearly' ? 'Processing...' : 'Get Started Annually'}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="px-4 max-w-3xl mx-auto mb-32 text-center">
          <h2 className="text-2xl font-serif text-foreground mb-4">Independent Donation Option</h2>
          <p className="text-foreground/70 text-sm mb-6 max-w-xl mx-auto">
            Not ready to subscribe? You can still make a difference. 100% of independent donations go directly to the verified charity pool without participating in the monthly draw.
          </p>
          <Button onClick={() => setError('Direct donation checkout is currently unavailable until payment processing is configured.')} variant="outline" className="h-10 text-sm font-medium rounded-md border-primary text-primary hover:bg-primary/5">
            Make a Direct Donation
          </Button>
        </section>

        <section className="px-4 max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif text-center text-foreground mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="shadow-sm border-foreground/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-bold text-sm text-foreground">How is the 10% charity donation verified?</h3>
                  <span className="text-foreground/40 text-xl">-</span>
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Every contribution is handled via our licensed integration partner and directly sent to registered charity escrow accounts. Statements are updated in real-time.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-foreground/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="font-bold text-sm text-foreground">What score formats do you support?</h3>
                  <span className="text-foreground/40 text-xl">+</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
