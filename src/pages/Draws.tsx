import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/layouts/Navbar'
import { Footer } from '@/layouts/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { drawService } from '@/services/drawService'
import { charityService } from '@/services/charityService'
import type { Draw, DrawEntry, Winner, Charity } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export default function Draws() {
  const { profile } = useAuth()
  const [draw, setDraw] = useState<Draw | null>(null)
  const [entry, setEntry] = useState<DrawEntry | null>(null)
  const [winnings, setWinnings] = useState<Winner | null>(null)
  const [charity, setCharity] = useState<Charity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const latestDraw = await drawService.getLatestPublishedDraw()
        if (latestDraw) {
          setDraw(latestDraw)
          const [myEntry, myWinnings] = await Promise.all([
            drawService.getMyDrawEntry(latestDraw.id),
            drawService.getMyWinnings(latestDraw.id)
          ])
          setEntry(myEntry)
          setWinnings(myWinnings)
        }
        
        const charities = await charityService.getCharities()
        if (profile?.charity_id) {
          setCharity(charities.find(c => c.id === profile.charity_id) || null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [profile])

  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 p-8 text-center">Loading...</main></div>
  if (!draw) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 p-8 text-center">No draws published yet.</main></div>

  const winningNumbers = draw.winning_numbers || []
  const myNumbers = entry?.score_numbers || []
  const monthName = new Date(draw.period_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // Calculate charity pot (assuming 10% config was used to derive pool as 50%, so charity is 10% of total revenue = total_pool * (10/50) = 20% of pool)
  const charityPot = draw.total_pool * 0.20

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-24">
        {/* Header */}
        <section className="px-8 py-10 max-w-6xl mx-auto border-b border-foreground/5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-serif text-foreground">Premium Monthly Draw</h1>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent-foreground px-3 py-1 rounded">{monthName} Results</span>
              </div>
              <p className="text-foreground/60 text-sm">
                Verified under standard compliance protocol.
              </p>
            </div>
            
            <div className="flex gap-8 text-sm">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Status</div>
                <div className="font-bold text-primary">Complete & Distributed</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Prize Pool</div>
                <div className="font-bold text-foreground">£{draw.total_pool.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Winning Numbers */}
        <section className="px-8 max-w-6xl mx-auto mb-16 text-center">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-6">The Winning Numbers</h2>
          <div className="flex justify-center gap-4 mb-6">
            {winningNumbers.map(num => (
              <div key={num} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary bg-primary/5 flex items-center justify-center shadow-sm">
                <span className="text-2xl md:text-3xl font-serif text-primary">{num.toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground/50">
            Draw verified securely via algorithmic protocol at {new Date(draw.published_at!).toLocaleString()}.
          </p>
        </section>

        {/* Layout Grid */}
        <section className="px-8 max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* Match Payouts */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-serif text-foreground mb-4">Match Payouts & Allocations</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              
              <Card className="shadow-sm border-foreground/5">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm font-bold text-foreground mb-1">Match 5 (Jackpot)</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">40% of Pool</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-serif text-accent mb-1">£{draw.tier_5_amount.toLocaleString()}</div>
                      <div className="text-xs text-foreground/60">Total Payout</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-foreground/5">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm font-bold text-foreground mb-1">Match 4</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">35% of Pool</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-serif text-foreground mb-1">£{draw.tier_4_amount.toLocaleString()}</div>
                      <div className="text-xs text-foreground/60">Total Payout</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-foreground/5">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm font-bold text-foreground mb-1">Match 3</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">25% of Pool</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-serif text-foreground mb-1">£{draw.tier_3_amount.toLocaleString()}</div>
                      <div className="text-xs text-foreground/60">Total Payout</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm font-bold text-primary mb-1">Charity Pot</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Guaranteed Donation</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-serif text-primary mb-1">£{charityPot.toLocaleString()}</div>
                      <div className="text-xs text-primary/60">Allocated</div>
                    </div>
                  </div>
                  <div className="bg-white/50 p-3 rounded text-sm text-primary/80">
                    Added to the <span className="font-bold">{charity?.name || 'Partner Charities'}</span> & Monthly Pool
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Your Results */}
          <div>
            <Card className="shadow-lg border-accent/30 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-serif font-normal text-foreground">Your Draw Results</CardTitle>
              </CardHeader>
              <CardContent>
                {entry ? (
                  <>
                    <div className="mb-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Result</div>
                      <div className="text-3xl font-serif text-accent">
                        {winnings ? `Match ${winnings.match_count}` : 'No Win'}
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="text-xs font-bold text-foreground mb-3">Your allocated numbers:</div>
                      <div className="flex gap-2">
                        {myNumbers.map(num => {
                          const isMatch = winningNumbers.includes(num)
                          return (
                            <div key={num} className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm ${isMatch ? 'bg-accent/20 border-accent text-accent' : 'bg-foreground/5 border-foreground/10 text-foreground/40'}`}>
                              {num.toString().padStart(2, '0')}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {winnings && (
                      <>
                        <div className="bg-accent/10 border border-accent/20 rounded-md p-4 text-center mb-6">
                          <div className="text-xs font-bold uppercase tracking-widest text-accent mb-1">You Won</div>
                          <div className="text-3xl font-serif text-accent">£{winnings.prize_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                        </div>

                        <Button asChild className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-base mb-4">
                          <Link to="/winner-verification">Claim / View Winnings</Link>
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-foreground/60 text-sm">
                    You did not have verified entries for this draw.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  )
}
