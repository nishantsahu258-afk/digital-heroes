import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Navbar } from '@/layouts/Navbar'
import { Footer } from '@/layouts/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { charityService } from '@/services/charityService'
import { useAuth } from '@/contexts/AuthContext'
import type { Charity } from '@/types'
import { formatGBP } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function CharityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  
  const [charity, setCharity] = useState<Charity | null>(null)
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Demo Donation Modal
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [donationAmount, setDonationAmount] = useState<number>(25)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [donating, setDonating] = useState(false)

  useEffect(() => {
    async function loadCharity() {
      if (!id) return
      try {
        setLoading(true)
        const data = await charityService.getCharityById(id)
        setCharity(data)
      } catch (err: any) {
        console.error('Failed to load charity', err)
        setErrorMsg('Failed to load charity details.')
      } finally {
        setLoading(false)
      }
    }
    loadCharity()
  }, [id])

  const handleSelectCharity = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    if (!charity) return
    try {
      setSelecting(true)
      setErrorMsg(null)
      await charityService.updateProfileCharity(charity.id)
      setSuccessMsg(`${charity.name} is now your selected cause! 10% of your monthly subscription will support them.`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update charity.')
    } finally {
      setSelecting(false)
    }
  }

  const handleDemoDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    if (!charity) return
    const finalAmount = customAmount ? parseFloat(customAmount) : donationAmount
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setErrorMsg('Please select or enter a valid donation amount.')
      return
    }

    try {
      setDonating(true)
      setErrorMsg(null)
      await charityService.recordDemoDonation(charity.id, finalAmount)
      setCharity(prev => prev ? { ...prev, total_raised: (prev.total_raised || 0) + finalAmount } : null)
      setSuccessMsg(`Demo donation of £${formatGBP(finalAmount)} to ${charity.name} recorded! (No real charge)`)
      setShowDonationModal(false)
      setCustomAmount('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record donation.')
    } finally {
      setDonating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto p-8 text-center py-20">
          <h1 className="text-3xl font-serif text-foreground mb-4">Charity Cause Not Found</h1>
          <p className="text-foreground/60 text-sm mb-6">The charity you are looking for does not exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link to="/charities">← Back to Charity Directory</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  const isCurrentCause = profile?.charity_id === charity.id
  const events = Array.isArray(charity.upcoming_events) && charity.upcoming_events.length > 0
    ? charity.upcoming_events
    : [
        { title: 'Community Outreach Drive', date: 'Next Month', description: 'Providing direct aid and localized resources to families.' },
        { title: 'Annual Beneficiary Gala', date: 'End of Quarter', description: 'Showcasing project milestones and transparent financial audits.' }
      ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Navigation Breadcrumb */}
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
          <Link to="/charities" className="text-xs font-bold text-foreground/60 hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
            ← Back to All Partner Causes
          </Link>
        </div>

        {/* Hero Banner */}
        <section className="max-w-5xl mx-auto px-6 mb-10">
          <div className="rounded-3xl overflow-hidden border border-foreground/10 bg-foreground/5 relative shadow-sm">
            <div className="h-64 sm:h-80 w-full relative overflow-hidden">
              <img 
                src={charity.image_url || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=600&fit=crop&q=80"}
                alt={charity.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=600&fit=crop&q=80"
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6 sm:p-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1 rounded-full mb-3 inline-block">
                    Verified Partner
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-serif text-white mb-2 leading-tight">
                    {charity.name}
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base max-w-2xl font-light">
                    Total Funds Raised to Date: <span className="font-bold text-accent">£{formatGBP(charity.total_raised)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <div className="max-w-5xl mx-auto px-6 mb-6">
          {errorMsg && <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm font-medium mb-4">{errorMsg}</div>}
          {successMsg && <div className="p-4 rounded-md bg-primary/10 text-primary text-sm font-medium mb-4">{successMsg}</div>}
        </div>

        {/* Content Details Grid */}
        <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Overview & Events (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-sm border-foreground/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-serif">About This Cause</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-foreground/80 leading-relaxed text-sm sm:text-base">
                <p>{charity.description}</p>
                <p>
                  Every subscription on Digital Heroes automatically directs a minimum of 10% of monthly membership fees straight to verified partners like {charity.name}. We verify 100% of escrow transfers to ensure ethical transparency and measurable social impact.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-foreground/10">
              <CardHeader className="pb-4 border-b border-foreground/5">
                <CardTitle className="text-xl font-serif">Upcoming Initiatives & Events</CardTitle>
              </CardHeader>
              <CardContent className="p-6 divide-y divide-foreground/5 space-y-4">
                {events.map((evt: any, i: number) => (
                  <div key={i} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{evt.title}</h4>
                      <p className="text-xs text-foreground/60">{evt.description}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-foreground/5 text-foreground/70 px-2.5 py-1 rounded shrink-0">
                      {evt.date}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar CTA (1 Col) */}
          <div className="space-y-6">
            <Card className="shadow-md border-foreground/10 p-6 space-y-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Status</div>
                <div className="text-lg font-serif text-foreground">
                  {isCurrentCause ? '✓ Your Selected Partner' : 'Available Partner'}
                </div>
              </div>

              <div className="space-y-3">
                {isCurrentCause ? (
                  <Button disabled className="w-full h-11 bg-primary/20 text-primary border border-primary/30 cursor-default">
                    Currently Selected Cause ✓
                  </Button>
                ) : (
                  <Button 
                    disabled={selecting} 
                    onClick={handleSelectCharity}
                    className="w-full h-11 bg-primary text-white hover:bg-primary/90 font-medium"
                  >
                    {selecting ? 'Updating Cause...' : 'Set As My Supported Cause'}
                  </Button>
                )}

                <Button 
                  variant="outline"
                  onClick={() => setShowDonationModal(true)}
                  className="w-full h-11 border-primary text-primary hover:bg-primary/5 font-medium"
                >
                  Make Direct Demo Donation
                </Button>
              </div>

              <div className="pt-4 border-t border-foreground/5 space-y-2 text-xs text-foreground/60">
                <div className="flex justify-between">
                  <span>Minimum Allocation:</span>
                  <span className="font-bold text-foreground">10% of membership</span>
                </div>
                <div className="flex justify-between">
                  <span>Audit Rating:</span>
                  <span className="font-bold text-primary">100% Clean</span>
                </div>
              </div>
            </Card>

            <Card className="bg-foreground/5 border-0 p-6 space-y-3">
              <h4 className="text-sm font-serif font-bold text-foreground">Why support via Digital Heroes?</h4>
              <p className="text-xs text-foreground/70 leading-relaxed">
                By entering monthly golf draws, you combine friendly competition with consistent philanthropic giving.
              </p>
              <Link to="/subscribe" className="text-xs font-bold text-primary hover:underline block pt-2">
                View Membership Plans →
              </Link>
            </Card>
          </div>

        </section>
      </main>

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
                Simulate a direct test contribution to <strong className="text-foreground">{charity.name}</strong>. No actual payment will occur.
              </p>

              <form onSubmit={handleDemoDonation} className="space-y-4">
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
                        className={`h-9 rounded-md text-xs font-bold border transition-colors ${
                          donationAmount === amt && !customAmount
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-foreground border-foreground/15 hover:bg-foreground/5'
                        }`}
                      >
                        £{amt}
                      </button>
                    ))}
                  </div>
                  <Input 
                    placeholder="Or custom amount (£)"
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={e => {
                      setCustomAmount(e.target.value)
                      if (e.target.value) setDonationAmount(0)
                    }}
                    className="h-10 text-xs bg-white border-foreground/15"
                  />
                </div>

                <div className="bg-foreground/5 rounded-lg p-3 text-xs text-foreground/60">
                  Total Demo Donation: <span className="font-bold text-foreground">£{customAmount ? customAmount : donationAmount}.00</span>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    disabled={donating}
                    type="submit"
                    className="w-full h-11 bg-primary text-white hover:bg-primary/90 font-medium"
                  >
                    {donating ? 'Recording Demo Donation...' : `Confirm Demo Donation (£${customAmount || donationAmount})`}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowDonationModal(false)}
                    className="w-full h-9 border-foreground/10 text-foreground/70 text-xs"
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
