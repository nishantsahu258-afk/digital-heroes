import { useState, useEffect } from 'react'
import { Navbar } from '@/layouts/Navbar'
import { Footer } from '@/layouts/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '@/services/authService'
import { charityService } from '@/services/charityService'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import type { Charity } from '@/types'
import { formatGBP } from '@/lib/utils'

export default function Subscription() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Demo Checkout State
  const [demoCheckoutTier, setDemoCheckoutTier] = useState<'monthly' | 'yearly' | null>(null)
  const [demoActivating, setDemoActivating] = useState(false)

  // Demo Donation State
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedCharityId, setSelectedCharityId] = useState<string>('')
  const [donationAmount, setDonationAmount] = useState<number>(25)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [donating, setDonating] = useState(false)

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index))
  }

  const faqs = [
    {
      question: "How is the 10% charity donation verified?",
      answer: "Every contribution is handled via our licensed integration partner and directly sent to registered charity escrow accounts. Statements are updated in real-time."
    },
    {
      question: "What score formats do you support?",
      answer: "We currently support official Stableford point scores (1 to 45 points) logged from any 18-hole or 9-hole affiliated golf course. Scores are validated and matched against your monthly draw entry code."
    },
    {
      question: "How does the monthly prize draw work?",
      answer: "Each month, your 5 submitted Stableford scores generate your unique draw entry numbers. At the end of the month, 5 winning numbers are published. Match 3, 4, or 5 numbers to win from the guaranteed structured prize pool."
    },
    {
      question: "Can I change my nominated charity cause?",
      answer: "Yes, you can change your designated charity partner at any time directly from your Member Dashboard or the Charities page with 1-click."
    },
    {
      question: "How do I claim and verify my prize payout?",
      answer: "Winners upload a clear photo or screenshot of their signed scorecard in the Winner Verification portal. Once verified by compliance, funds are deposited directly into your nominated UK bank or international account."
    }
  ]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'cancelled') {
      setError('Checkout was cancelled. Please try again.')
    }
    if (params.get('checkout') === 'success') {
      setSuccess('Subscription successful! Welcome to the premium tier.')
    }

    // Load charities for donation modal
    charityService.getCharities().then(list => {
      setCharities(list)
      if (list.length > 0) {
        setSelectedCharityId(profile?.charity_id || list[0].id)
      }
    }).catch(console.error)
  }, [profile])

  const handleSubscribe = async (tier: 'monthly' | 'yearly') => {
    if (!user) {
      navigate('/login?redirect=subscription')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Try real Stripe session first
      const url = await authService.createCheckoutSession(tier)
      if (url && url.startsWith('http')) {
        window.location.href = url
        return
      }
      // If no valid URL returned, open demo checkout
      setDemoCheckoutTier(tier)
    } catch (err: any) {
      // Real Stripe is unavailable in this environment, fallback seamlessly to clear Demo Checkout
      console.log('Stripe checkout unavailable, opening Demo Checkout modal:', err.message)
      setDemoCheckoutTier(tier)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDemoSubscription = async () => {
    if (!demoCheckoutTier || !user) return
    setDemoActivating(true)
    setError(null)
    try {
      await authService.activateDemoSubscription(demoCheckoutTier)
      setSuccess(`Demo ${demoCheckoutTier === 'yearly' ? 'Annual Hero' : 'Monthly Supporter'} subscription activated successfully!`)
      setDemoCheckoutTier(null)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'Failed to activate demo subscription')
    } finally {
      setDemoActivating(false)
    }
  }

  const handleConfirmDemoDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      navigate('/login?redirect=subscription')
      return
    }
    const finalAmount = customAmount ? parseFloat(customAmount) : donationAmount
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setError('Please select or enter a valid donation amount.')
      return
    }
    if (!selectedCharityId) {
      setError('Please select a charity cause to support.')
      return
    }

    setDonating(true)
    setError(null)
    try {
      await charityService.recordDemoDonation(selectedCharityId, finalAmount)
      const selectedCharity = charities.find(c => c.id === selectedCharityId)
      setSuccess(`Demo donation of £${formatGBP(finalAmount)} to ${selectedCharity?.name || 'partner charity'} confirmed! (No real charge)`)
      setShowDonationModal(false)
      setCustomAmount('')
    } catch (err: any) {
      setError(err.message || 'Failed to process demo donation.')
    } finally {
      setDonating(false)
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
          {success && <div className="mb-6 p-4 text-sm bg-primary/10 text-primary rounded font-medium">{success}</div>}

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

        {/* Independent Donation Option */}
        <section className="px-4 max-w-3xl mx-auto mb-32 text-center">
          <h2 className="text-2xl font-serif text-foreground mb-4">Independent Donation Option</h2>
          <p className="text-foreground/70 text-sm mb-6 max-w-xl mx-auto">
            Not ready to subscribe? You can still make a difference. 100% of independent donations go directly to the verified charity pool without participating in the monthly draw.
          </p>
          <Button 
            onClick={() => {
              if (!user) {
                navigate('/login?redirect=subscription')
                return
              }
              setShowDonationModal(true)
            }} 
            variant="outline" 
            className="h-10 text-sm font-medium rounded-md border-primary text-primary hover:bg-primary/5"
          >
            Make a Direct Donation
          </Button>
        </section>

        {/* FAQs Accordion */}
        <section className="px-4 max-w-3xl mx-auto mb-24">
          <h2 className="text-3xl font-serif text-center text-foreground mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <Card 
                  key={index}
                  className={`shadow-sm border-foreground/5 overflow-hidden transition-all duration-200 cursor-pointer ${
                    isOpen ? 'border-primary/20 bg-background ring-1 ring-primary/10' : 'hover:border-foreground/20'
                  }`}
                  onClick={() => toggleFaq(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center gap-4">
                      <h3 className="font-bold text-sm text-foreground select-none">
                        {faq.question}
                      </h3>
                      <span className="text-foreground/50 text-xl font-mono select-none w-6 h-6 flex items-center justify-center shrink-0">
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-foreground/70 leading-relaxed pt-4 border-t border-foreground/5 mt-4">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

      </main>

      {/* Demo Checkout Modal */}
      <AnimatePresence>
        {demoCheckoutTier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-foreground/10 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider">
                  <span>⚙️</span> Demo Mode
                </div>
                <button 
                  onClick={() => setDemoCheckoutTier(null)}
                  className="text-foreground/40 hover:text-foreground text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-2xl font-serif text-foreground mb-2">
                Demo Checkout — No real charge
              </h3>

              <p className="text-xs text-foreground/70 mb-6 leading-relaxed">
                Stripe live payments are currently unavailable in this environment (Stripe India onboarding restrictions). You can activate a demo subscription to test the full subscriber workflow (dashboard, score submission, draws, and verification).
              </p>

              <div className="bg-foreground/5 rounded-lg p-4 mb-6 border border-foreground/10 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/60">Selected Plan</span>
                  <span className="font-bold text-foreground">
                    {demoCheckoutTier === 'yearly' ? 'Annual Hero' : 'Monthly Supporter'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/60">Simulated Price</span>
                  <span className="font-serif font-bold text-primary">
                    {demoCheckoutTier === 'yearly' ? '£99.99/year' : '£9.99/month'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/60">Charity Allocation</span>
                  <span className="font-bold text-accent">10% Included</span>
                </div>
                <div className="flex justify-between items-center text-xs text-foreground/50 pt-1 border-t border-foreground/5">
                  <span>Charge Amount:</span>
                  <span className="font-semibold text-emerald-600">£0.00 (Demo Mode)</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  disabled={demoActivating}
                  onClick={handleConfirmDemoSubscription}
                  className="w-full h-11 bg-primary text-white hover:bg-primary/90 font-medium"
                >
                  {demoActivating ? 'Activating Demo Access...' : 'Activate Demo Subscription'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setDemoCheckoutTier(null)}
                  className="w-full h-10 border-foreground/10 text-foreground/70 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Demo Direct Donation Modal */}
      <AnimatePresence>
        {showDonationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-foreground/10 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider">
                  <span>⚙️</span> Demo Mode
                </div>
                <button 
                  onClick={() => setShowDonationModal(false)}
                  className="text-foreground/40 hover:text-foreground text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-2xl font-serif text-foreground mb-2">
                Demo Donation — No real charge
              </h3>

              <p className="text-xs text-foreground/70 mb-6 leading-relaxed">
                Direct donations go 100% to verified partner causes without entering the draw. This is a simulated demo transaction for assignment testing.
              </p>

              <form onSubmit={handleConfirmDemoDonation} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block">Select Charity Cause</label>
                  <select 
                    value={selectedCharityId} 
                    onChange={e => setSelectedCharityId(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-white border border-foreground/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  >
                    {charities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block">Select Donation Amount</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[10, 25, 50, 100].map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setDonationAmount(amt)
                          setCustomAmount('')
                        }}
                        className={`py-2 rounded border text-xs font-bold transition-colors ${
                          donationAmount === amt && !customAmount
                            ? 'bg-primary text-white border-primary'
                            : 'border-foreground/10 hover:bg-foreground/5 text-foreground'
                        }`}
                      >
                        £{amt}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-foreground/40">£</span>
                    <Input 
                      type="number"
                      placeholder="Other custom amount (GBP)"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      className="pl-7 text-xs"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                <div className="bg-foreground/5 p-3 rounded text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Simulated Donation:</span>
                    <span className="font-bold text-primary">
                      £{formatGBP(customAmount ? parseFloat(customAmount) || 0 : donationAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Charge to Card:</span>
                    <span className="font-bold">£0.00 (Demo Mode)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    type="submit"
                    disabled={donating}
                    className="w-full bg-primary text-white hover:bg-primary/90 text-xs h-10"
                  >
                    {donating ? 'Recording Demo Donation...' : 'Confirm Demo Donation'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowDonationModal(false)}
                    className="w-full text-xs h-9 border-foreground/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
