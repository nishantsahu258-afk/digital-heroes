import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/layouts/Navbar'
import { Footer } from '@/layouts/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { scoreService } from '@/services/scoreService'
import { authService } from '@/services/authService'
import { charityService } from '@/services/charityService'
import type { Score, Charity } from '@/types'
import { drawService } from '@/services/drawService'

export default function Dashboard() {
  const { user, profile } = useAuth()
  
  const [scores, setScores] = useState<Score[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [charity, setCharity] = useState<Charity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [winnings, setWinnings] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [recentScores, sub, charities, userWinnings] = await Promise.all([
          scoreService.getRecentScores(3),
          authService.getSubscription(),
          charityService.getCharities(),
          drawService.getUserWinnings()
        ])
        
        setScores(recentScores)
        setSubscription(sub)
        setWinnings(userWinnings)
        
        if (profile?.charity_id) {
          setCharity(charities.find(c => c.id === profile.charity_id) || null)
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    if (user && profile) loadData()
    else if (!profile) setLoading(false) // Handle missing profile gracefully
  }, [user, profile])

  if (loading) return <div className="min-h-screen bg-background flex flex-col"><Navbar /><main className="flex-1 p-8 text-center">Loading...
        {/* Winnings & Payouts Section */}
        <section className="px-4 max-w-6xl mx-auto mt-8">
          <Card className="shadow-sm border-foreground/5">
            <CardHeader className="pb-6 border-b border-foreground/5 mb-6">
              <CardTitle className="text-xl font-serif">Your Winnings & Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              {winnings.length === 0 ? (
                <div className="text-center py-12 text-foreground/50">
                  <p>No winnings yet. Keep submitting your scores and playing!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {winnings.map(win => (
                    <div key={win.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-foreground/5 rounded-md gap-4 sm:gap-0">
                      <div>
                        <div className="font-bold text-foreground">Matched {win.match_count} Numbers</div>
                        <div className="text-sm text-foreground/60">Draw: {new Date(win.draws?.period_end).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Prize</div>
                          <div className="font-serif text-lg text-primary">£{win.prize_amount.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Status</div>
                          <div className={"text-xs font-bold uppercase px-2 py-1 rounded ${win.payment_status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}"}>
                            {win.payment_status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main></div>
  if (error) return <div className="min-h-screen bg-background flex flex-col"><Navbar /><main className="flex-1 p-8 text-center text-destructive">Error: {error}
        {/* Winnings & Payouts Section */}
        <section className="px-4 max-w-6xl mx-auto mt-8">
          <Card className="shadow-sm border-foreground/5">
            <CardHeader className="pb-6 border-b border-foreground/5 mb-6">
              <CardTitle className="text-xl font-serif">Your Winnings & Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              {winnings.length === 0 ? (
                <div className="text-center py-12 text-foreground/50">
                  <p>No winnings yet. Keep submitting your scores and playing!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {winnings.map(win => (
                    <div key={win.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-foreground/5 rounded-md gap-4 sm:gap-0">
                      <div>
                        <div className="font-bold text-foreground">Matched {win.match_count} Numbers</div>
                        <div className="text-sm text-foreground/60">Draw: {new Date(win.draws?.period_end).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Prize</div>
                          <div className="font-serif text-lg text-primary">£{win.prize_amount.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Status</div>
                          <div className={"text-xs font-bold uppercase px-2 py-1 rounded ${win.payment_status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}"}>
                            {win.payment_status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main></div>

  const isVerified = subscription?.status === 'active'
  const isAnnual = subscription?.tier === 'yearly'
  const planName = isAnnual ? 'Annual Hero' : (subscription ? 'Monthly Hero' : 'Free Tier')
  const planPrice = isAnnual ? 'Â£99.99/yr' : 'Â£9.99/mo'
  const directContribution = isAnnual ? 'Â£10.00' : 'Â£1.00'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-24">
        {/* Header */}
        <section className="px-8 py-10 max-w-6xl mx-auto border-b border-foreground/5 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-serif text-foreground">Welcome back, {user?.email?.split('@')[0]}</h1>
                {isVerified && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent-foreground px-3 py-1 rounded">
                    {planName}
                  </span>
                )}
              </div>
              <p className="text-foreground/60 text-sm">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-primary text-white hover:bg-primary/90 rounded-md">
                <Link to="/scores">Add Score</Link>
              </Button>
              <Button variant="outline" asChild className="border-foreground/10 text-foreground rounded-md">
                <Link to="/charities">Change Charity</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="px-8 max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Upcoming Draw */}
          <Card className="lg:col-span-1 shadow-sm border-foreground/5">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <CardTitle className="text-lg font-serif font-normal">Upcoming Premium Draw</CardTitle>
              {isVerified ? (
                 <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">Qualified</span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-destructive/10 text-destructive px-2 py-1 rounded">Not Eligible</span>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-8">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Status</div>
                  <div className="text-xl font-serif text-accent">End of Month</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Your Entries</div>
                  <div className="text-xl font-serif text-foreground">{isVerified ? scores.length : 0} / 5 slots</div>
                </div>
              </div>
              <div className="bg-foreground/5 rounded-md p-3 text-sm text-foreground/70 flex items-center gap-3">
                <div className="w-6 h-6 shrink-0 bg-white rounded flex items-center justify-center border border-foreground/10 text-foreground/40 text-xs">âœ“</div>
                {isVerified 
                  ? (scores.length >= 5 ? 'Your 5 numbers are ready for the draw.' : `Submit ${5 - scores.length} more scores to enter.`)
                  : 'Subscribe to enter the monthly draws.'}
              </div>
            </CardContent>
          </Card>

          {/* Latest Scores */}
          <Card className="lg:col-span-2 shadow-sm border-foreground/5">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <CardTitle className="text-lg font-serif font-normal">Latest Stableford Scores</CardTitle>
              <Link to="/scores" className="text-xs font-bold text-foreground hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scores.length === 0 ? (
                  <div className="text-sm text-foreground/50 py-4 text-center">No scores submitted yet.</div>
                ) : (
                  scores.map((score) => (
                    <div key={score.id} className="flex items-center justify-between py-3 border-b border-foreground/5 last:border-0">
                      <span className="text-sm text-foreground/70">{score.score_date ? new Date(score.score_date).toLocaleDateString() : 'N/A'}</span>
                      <span className="font-bold text-foreground">{score.score_value} pts</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">Verified</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card className="shadow-sm border-foreground/5">
            <CardHeader className="pb-6">
              <CardTitle className="text-lg font-serif font-normal">Subscription & Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground/60">Current Plan</span>
                    <span className="font-bold">{planName} ({planPrice})</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground/60">Next Renewal Date</span>
                    <span className="font-bold">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground/60">Direct Impact allocation</span>
                    <span className="font-bold text-primary">10% (Included)</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-foreground/60 mb-4">You are not currently subscribed.</div>
                  <Button asChild className="w-full bg-primary text-white">
                    <Link to="/subscription">View Plans</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charity Impact */}
          <Card className="shadow-sm border-foreground/5">
            <CardHeader className="pb-6">
              <CardTitle className="text-lg font-serif font-normal">Your Charity Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Supported Cause</div>
              <div className="text-xl font-serif text-primary mb-8">{charity?.name || 'Not selected'}</div>
              
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Your Direct Contribution</div>
              <div className="text-xl font-serif text-foreground mb-8">
                {subscription ? directContribution : 'Â£0.00'} <span className="text-sm font-sans text-foreground/50">(From fee)</span>
              </div>

              <div className="border-t border-foreground/5 pt-6">
                <Link to="/charities" className="text-xs font-bold text-destructive/80 hover:text-destructive hover:underline">
                  Change Allocated Charity Partner
                </Link>
              </div>
            </CardContent>
          </Card>

        </section>
      
        {/* Winnings & Payouts Section */}
        <section className="px-4 max-w-6xl mx-auto mt-8">
          <Card className="shadow-sm border-foreground/5">
            <CardHeader className="pb-6 border-b border-foreground/5 mb-6">
              <CardTitle className="text-xl font-serif">Your Winnings & Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              {winnings.length === 0 ? (
                <div className="text-center py-12 text-foreground/50">
                  <p>No winnings yet. Keep submitting your scores and playing!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {winnings.map(win => (
                    <div key={win.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-foreground/5 rounded-md gap-4 sm:gap-0">
                      <div>
                        <div className="font-bold text-foreground">Matched {win.match_count} Numbers</div>
                        <div className="text-sm text-foreground/60">Draw: {new Date(win.draws?.period_end).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Prize</div>
                          <div className="font-serif text-lg text-primary">£{win.prize_amount.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Status</div>
                          <div className={"text-xs font-bold uppercase px-2 py-1 rounded ${win.payment_status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}"}>
                            {win.payment_status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
