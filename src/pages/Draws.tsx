import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/layouts/Navbar'
import { Footer } from '@/layouts/Footer'
import { Button } from '@/components/ui/button'
import { drawService } from '@/services/drawService'
import type { Draw, Winner } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { formatGBP } from '@/lib/utils'

export default function Draws() {
  const { user } = useAuth()
  const [draw, setDraw] = useState<Draw | null>(null)
  const [winnings, setWinnings] = useState<Winner | null>(null)
  const [loading, setLoading] = useState(true)

  // Countdown timer state for "Draw closes in"
  const [timeLeft] = useState({ days: 4, hours: 18, mins: 32 })

  useEffect(() => {
    async function loadData() {
      try {
        const latestDraw = await drawService.getLatestPublishedDraw()
        if (latestDraw) {
          setDraw(latestDraw)
          if (user) {
            const [, myWinnings] = await Promise.all([
              drawService.getMyDrawEntry(latestDraw.id),
              drawService.getMyWinnings(latestDraw.id)
            ])
            setWinnings(myWinnings)
          }
        }
      } catch (err) {
        console.error('Error loading draw:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const defaultWinningNumbers = [7, 14, 22, 31, 39]
  const winningNumbers = draw?.winning_numbers && draw.winning_numbers.length === 5 
    ? draw.winning_numbers 
    : defaultWinningNumbers

  const pastDraws = [
    { date: '31 January 2026', pool: '£5,000', numbers: ['02', '18', '25', '36', '41'] },
    { date: '31 December 2025', pool: '£5,000', numbers: ['05', '12', '20', '28', '33'] },
    { date: '30 November 2025', pool: '£4,500', numbers: ['11', '15', '19', '22', '37'] },
    { date: '31 October 2025', pool: '£4,000', numbers: ['03', '09', '14', '27', '40'] },
    { date: '30 September 2025', pool: '£4,000', numbers: ['01', '07', '11', '24', '32'] },
    { date: '31 August 2025', pool: '£3,500', numbers: ['08', '12', '18', '25', '34'] },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#2D5A43] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[#1A2E26]/60">Loading draw results...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#1A2E26]">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* User winner banner if active winner */}
        {winnings && (
          <div className="bg-[#2D5A43] text-white py-3 px-6 text-center text-sm font-medium flex items-center justify-center gap-3">
            <span>🎉 Congratulations! You matched {winnings.match_count} numbers and won £{formatGBP(winnings.prize_amount, 2)}!</span>
            <Link to="/winner-verification" className="underline font-bold hover:text-amber-200">
              Verify Scorecard & Claim Payout →
            </Link>
          </div>
        )}

        {/* Hero & Top Section */}
        <section className="px-6 md:px-12 pt-12 pb-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Header & Metrics */}
            <div className="lg:col-span-2">
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#B58D3D] mb-3">
                MARCH PREMIUM REWARDS DRAW
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-[#1A2E26] mb-4 leading-tight">
                Structured Pool Allocation Live
              </h1>
              <p className="text-[#1A2E26]/70 text-base max-w-2xl leading-relaxed mb-8">
                Our transparent matching algorithm awards structured pool payouts based on how many digits on your scorecard entry code match the randomly drawn numbers.
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-8 md:gap-12 pt-2 border-t border-[#1A2E26]/10">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E26]/50 mb-1">
                    TOTAL PRIZE POOL
                  </div>
                  <div className="text-3xl font-serif font-bold text-[#1A2E26]">
                    £5,000
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E26]/50 mb-1">
                    CURRENT ENTRIES
                  </div>
                  <div className="text-3xl font-serif font-bold text-[#1A2E26]">
                    1,482
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E26]/50 mb-1">
                    YOUR STATUS
                  </div>
                  <span className="inline-block bg-[#E8F3ED] text-[#2D5A43] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded">
                    QUALIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Right Countdown Card */}
            <div className="lg:col-span-1 flex justify-start lg:justify-end">
              <div className="bg-white rounded-2xl p-6 border border-[#1A2E26]/10 shadow-sm w-full max-w-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E26]/50 mb-4 text-center">
                  DRAW CLOSES IN
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#F8F6F0] rounded-xl p-3 border border-[#1A2E26]/5">
                    <div className="text-3xl font-serif font-bold text-[#1A2E26]">
                      {timeLeft.days.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase text-[#1A2E26]/50 font-medium mt-1">Days</div>
                  </div>
                  <div className="bg-[#F8F6F0] rounded-xl p-3 border border-[#1A2E26]/5">
                    <div className="text-3xl font-serif font-bold text-[#1A2E26]">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase text-[#1A2E26]/50 font-medium mt-1">Hours</div>
                  </div>
                  <div className="bg-[#F8F6F0] rounded-xl p-3 border border-[#1A2E26]/5">
                    <div className="text-3xl font-serif font-bold text-[#1A2E26]">
                      {timeLeft.mins.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase text-[#1A2E26]/50 font-medium mt-1">Mins</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Two-Column Breakdown & Past Results */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Card: February Draw Winners & Allocation (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#1A2E26]/10 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
                  <h2 className="text-2xl font-serif font-medium text-[#1A2E26]">
                    February Draw Winners & Allocation
                  </h2>
                </div>
                <p className="text-xs text-[#1A2E26]/50 -mt-4 mb-6">
                  Drawn on 28 February 2026, Audit Reference: #DH-FEBRUARY-DRAW
                </p>

                {/* Official Winning Numbers Banner */}
                <div className="bg-[#F6F4ED] rounded-xl p-6 mb-8 text-center border border-[#1A2E26]/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E26]/50 mb-4">
                    OFFICIAL WINNING NUMBERS
                  </div>
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    {winningNumbers.map((num, i) => (
                      <div 
                        key={i} 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2D5A43] text-white flex items-center justify-center text-lg sm:text-xl font-serif font-bold shadow-sm"
                      >
                        {num.toString().padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Winners Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#1A2E26]/10 text-[10px] font-bold uppercase tracking-widest text-[#1A2E26]/40">
                        <th className="pb-3 font-semibold">TIER</th>
                        <th className="pb-3 font-semibold">WINNERS</th>
                        <th className="pb-3 font-semibold">TIER POOL</th>
                        <th className="pb-3 font-semibold text-right">INDIVIDUAL PAYOUT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A2E26]/5">
                      <tr>
                        <td className="py-4 font-bold text-[#B58D3D]">Match 5 (Jackpot)</td>
                        <td className="py-4 text-[#1A2E26]/70">1 Winner</td>
                        <td className="py-4 font-medium text-[#1A2E26]">£2,500.00</td>
                        <td className="py-4 font-bold text-[#1A2E26] text-right">£2,500.00</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-bold text-[#1A2E26]">Match 4</td>
                        <td className="py-4 text-[#1A2E26]/70">3 Winners</td>
                        <td className="py-4 font-medium text-[#1A2E26]">£1,500.00</td>
                        <td className="py-4 font-bold text-[#1A2E26] text-right">£500.00</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-bold text-[#1A2E26]">Match 3</td>
                        <td className="py-4 text-[#1A2E26]/70">12 Winners</td>
                        <td className="py-4 font-medium text-[#1A2E26]">£500.00</td>
                        <td className="py-4 font-bold text-[#1A2E26] text-right">£41.67</td>
                      </tr>
                      <tr className="bg-[#FAF7F0]/60">
                        <td className="py-4 font-bold text-[#D96B43]">Charity Pot</td>
                        <td className="py-4 text-[#1A2E26]/70">Guaranteed Donation allocation</td>
                        <td className="py-4 font-medium text-[#D96B43]">£500.00</td>
                        <td className="py-4 text-[#1A2E26]/40 text-right">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-6 border-t border-[#1A2E26]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#1A2E26]/60">
                    Did you match 3 or more numbers in this draw?
                  </div>
                  <Button asChild className="bg-[#2D5A43] text-white hover:bg-[#234735] rounded-lg px-5 py-2 text-xs font-semibold">
                    <Link to="/winner-verification">
                      Verify Your Scorecard Proof →
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Card: Past Draw Results (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#1A2E26]/10 shadow-sm">
                <h2 className="text-2xl font-serif font-medium text-[#1A2E26] mb-6">
                  Past Draw Results
                </h2>

                <div className="space-y-4">
                  {pastDraws.map((d, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl bg-[#FDFBF7] border border-[#1A2E26]/5 hover:border-[#1A2E26]/15 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-[#1A2E26]">{d.date}</span>
                        <span className="text-xs font-serif font-bold text-[#2D5A43]">{d.pool}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {d.numbers.map((n, idx) => (
                          <span 
                            key={idx}
                            className="w-7 h-7 rounded-full bg-[#E8E6DF] text-[#1A2E26] text-xs font-semibold flex items-center justify-center"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 text-center">
                  <p className="text-xs text-[#1A2E26]/50">
                    All historical prize pool draws audited under the UK Charity Commission Framework.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
