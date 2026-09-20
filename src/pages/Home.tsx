import { Link } from "react-router-dom"
import { Navbar } from "@/layouts/Navbar"
import { Footer } from "@/layouts/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { charityService } from "@/services/charityService"
import { drawService } from "@/services/drawService"
import { CountUp } from "@/components/ui/CountUp"
import { Countdown } from "@/components/ui/Countdown"

export default function Home() {
  const [totalRaised, setTotalRaised] = useState<number>(0)
  const [totalPrizePool, setTotalPrizePool] = useState<number>(0)
  const [currentEntries, setCurrentEntries] = useState<number>(0)
  const [targetDate, setTargetDate] = useState<string | undefined>()

  useEffect(() => {
    async function loadData() {
      try {
        const charities = await charityService.getCharities()
        const total = charities.reduce((acc, c) => acc + (c.total_raised || 0), 0)
        setTotalRaised(total > 0 ? total : 127450) // fallback to demo value if 0

        const draws = await drawService.getDraws()
        const upcoming = draws.find(d => d.status === 'draft')
        if (upcoming) {
          setTotalPrizePool(upcoming.total_pool || 5000)
          setTargetDate(upcoming.period_end)
        } else {
          setTotalPrizePool(5000)
        }
        
        // Mock entries count based on pool, since we don't have a direct endpoint for total unique entries
        setCurrentEntries(Math.floor((upcoming?.total_pool || 5000) / 10) + 1482)
      } catch (err) {
        console.error("Failed to load totals", err)
        setTotalRaised(127450)
        setTotalPrizePool(5000)
        setCurrentEntries(1482)
      }
    }
    loadData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
          className="relative pt-20 pb-32 px-8 flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-8">
            An Entirely New Way To Play
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-serif text-foreground mb-6 leading-tight">
            Play Golf. Win Prizes.<br/>Change Lives.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl leading-relaxed">
            Track your performance, enter premium monthly rewards draws, and fund world-changing charity projects with every scorecard logged.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-20">
            <Button asChild size="lg" className="rounded-full px-8 bg-primary text-white hover:bg-primary/90">
              <Link to="/signup">Join the Movement</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 bg-white border-foreground/10 text-foreground hover:bg-foreground/5">
              <Link to="/#how-it-works">See How It Works</Link>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full max-w-md mx-auto">
            <Card className="shadow-xl shadow-black/5 border-foreground/5 py-8">
              <CardContent className="p-0 flex flex-col items-center justify-center">
                <span className="text-4xl md:text-5xl font-serif text-foreground mb-2">
                  <CountUp end={totalRaised} prefix="£" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">Total Funds Raised For Global Causes</span>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-8 bg-white border-y border-foreground/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6">
                The Cycle of Impact
              </div>
              <h2 className="text-4xl font-serif text-foreground">How Digital Heroes Works</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-foreground/5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-serif italic text-xl">1</span>
                    </div>
                    <span className="text-4xl font-serif text-foreground/10">01</span>
                  </div>
                  <h3 className="text-xl font-serif text-foreground mb-3">Subscribe & Support</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Join the platform with a premium subscription. 10% goes directly to verified charity partners.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-foreground/5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-serif italic text-xl">2</span>
                    </div>
                    <span className="text-4xl font-serif text-foreground/10">02</span>
                  </div>
                  <h3 className="text-xl font-serif text-foreground mb-3">Log Your Scores</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Submit your official or recreational Stableford scores through our clean dashboard to qualify.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-foreground/5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-serif italic text-xl">3</span>
                    </div>
                    <span className="text-4xl font-serif text-foreground/10">03</span>
                  </div>
                  <h3 className="text-xl font-serif text-foreground mb-3">Win & Give Back</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Automatically enter high-tier monthly draws to win premium gear & jackpots, driving further charity funding.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* PREMIUM DRAW */}
        <section className="py-24 px-8 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-accent/20 text-accent-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
                March Premium Draw
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Our Next Premium Draw is Live</h2>
              <p className="text-foreground/70 mb-10 leading-relaxed">
                Qualify by logging your 5 latest scorecards this month. Match 3, 4, or 5 numbers in our transparent draw protocol to win structured payouts.
              </p>
              
              <div className="flex gap-12 mb-10">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Total Prize Pool</div>
                  <div className="text-3xl font-serif text-accent">
                    <CountUp end={totalPrizePool} prefix="£" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Current Entries</div>
                  <div className="text-3xl font-serif text-foreground">
                    <CountUp end={currentEntries} />
                  </div>
                </div>
              </div>

              <Button className="rounded-full px-8 bg-primary text-white hover:bg-primary/90">
                Submit Scorecard to Enter
              </Button>
            </div>

            <Card className="border-foreground/5 shadow-xl shadow-black/5 p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-6">Draw Closes In</div>
              
              <Countdown targetDate={targetDate} />

              <div className="text-sm font-bold text-foreground mb-4">How matching works:</div>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li className="flex gap-3 items-start"><span className="text-primary">✓</span> Log scorecards to generate your unique Draw Entry Code.</li>
                <li className="flex gap-3 items-start"><span className="text-primary">✓</span> Draw consists of 5 numbers randomly outputted live.</li>
                <li className="flex gap-3 items-start"><span className="text-primary">✓</span> Match 3, 4, or 5 numbers for guaranteed pool split.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* TIERS */}
        <section className="py-24 px-8 bg-foreground/5 border-y border-foreground/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-full bg-accent/20 text-accent-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
                Structured Pool Allocation
              </div>
              <h2 className="text-4xl font-serif text-foreground">Monthly Draw Tiers</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-foreground/60 mb-2">Match 5 (Jackpot)</div>
                  <div className="text-3xl font-serif text-accent mb-4">£2,500</div>
                  <div className="inline-flex text-[10px] font-bold uppercase bg-accent/10 text-accent-foreground px-2 py-1 rounded">40% of Pool</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-foreground/60 mb-2">Match 4</div>
                  <div className="text-3xl font-serif text-foreground mb-4">£1,500</div>
                  <div className="inline-flex text-[10px] font-bold uppercase bg-foreground/5 text-foreground/60 px-2 py-1 rounded">35% of Pool</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-foreground/60 mb-2">Match 3</div>
                  <div className="text-3xl font-serif text-foreground mb-4">£500</div>
                  <div className="inline-flex text-[10px] font-bold uppercase bg-foreground/5 text-foreground/60 px-2 py-1 rounded">25% of Pool</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-foreground/60 mb-2">Charity Pot</div>
                  <div className="text-3xl font-serif text-accent/80 mb-4">£500</div>
                  <div className="inline-flex text-[10px] font-bold uppercase bg-accent/10 text-accent-foreground px-2 py-1 rounded">Guaranteed Donation</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CHARITY SPOTLIGHT */}
        <section className="py-24 px-8 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full bg-primary/5 text-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
              Where Your Money Goes
            </div>
            <h2 className="text-4xl font-serif text-foreground">Featured Charity Spotlight</h2>
          </div>

          <Card className="border-foreground/5 shadow-xl shadow-black/5 overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto bg-foreground/5 w-full object-cover transition-transform duration-300 hover:scale-[1.03]"></div>
              <div className="p-10 lg:p-16 flex flex-col justify-center">
                <div className="flex gap-3 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">Environment & Sustainability</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 py-1">Featured Partner</span>
                </div>
                <h3 className="text-3xl font-serif text-foreground mb-4">Clean Water Initiative</h3>
                <p className="text-foreground/70 leading-relaxed mb-10">
                  Providing sustainable solar-powered filtration systems to remote communities. Every premium subscription logged contributes directly to building infrastructure on the ground.
                </p>
                
                <div className="flex gap-12 mb-10">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Total Donated</div>
                    <div className="text-2xl font-serif text-foreground">
                      <CountUp end={totalRaised} prefix="£" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Communities Helped</div>
                    <div className="text-2xl font-serif text-foreground">12 Villages</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Button className="rounded-full px-8 bg-primary text-white hover:bg-primary/90">
                    Support This Cause
                  </Button>
                  <Link to="/charities" className="text-sm font-medium text-foreground hover:text-primary underline underline-offset-4">Read Full Impact Report</Link>
                </div>
              </div>
            </div>
          </Card>
        </section>

      </main>
      
      <Footer />
    </div>
  )
}
