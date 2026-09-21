import { Link, useNavigate } from "react-router-dom"
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
import { useAuth } from "@/contexts/AuthContext"
import { formatGBP } from "@/lib/utils"

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [totalRaised, setTotalRaised] = useState<number>(0)
  const [totalPrizePool, setTotalPrizePool] = useState<number>(0)
  const [targetDate, setTargetDate] = useState<string | undefined>()
  const [featuredCharity, setFeaturedCharity] = useState<any>(null)
  const [drawMonth, setDrawMonth] = useState<string>("Next")
  const [match5, setMatch5] = useState<number>(2000)
  const [match4, setMatch4] = useState<number>(1750)
  const [match3, setMatch3] = useState<number>(1250)

  useEffect(() => {
    async function loadData() {
      try {
        const charities = await charityService.getCharities()
        const featured = await charityService.getFeaturedCharity()
        if (featured) {
          setFeaturedCharity(featured)
        } else if (charities.length > 0) {
          setFeaturedCharity(charities[0])
        }
        
        const total = charities.reduce((acc, c) => acc + (c.total_raised || 0), 0)
        setTotalRaised(total > 0 ? total : 127450) // fallback to demo value if 0

        const draws = await drawService.getDraws()
        const upcoming = draws.find(d => d.status === 'draft')
        let pool = 5000
        if (upcoming) {
          pool = upcoming.total_pool || 5000
          setTargetDate(upcoming.period_end)
          const end = new Date(upcoming.period_end)
          if (!isNaN(end.getTime())) {
            setDrawMonth(end.toLocaleString('default', { month: 'long' }))
          }
        }
        
        setTotalPrizePool(pool)
        setMatch5(pool * 0.40)
        setMatch4(pool * 0.35)
        setMatch3(pool * 0.25)
      } catch (err) {
        console.error("Failed to load totals", err)
        setTotalRaised(127450)
        setTotalPrizePool(5000)
        setMatch5(2000)
        setMatch4(1750)
        setMatch3(1250)
      }
    }
    loadData()
  }, [])

  const handleScoreSubmitClick = () => {
    if (user) {
      navigate('/scores')
    } else {
      navigate('/login?redirect=scores')
    }
  }

  const handleSupportCause = () => {
    const charityId = featuredCharity?.id
    if (user) {
      navigate(charityId ? `/subscribe?charity=${charityId}` : '/subscribe')
    } else {
      navigate(charityId ? `/signup?charity=${charityId}` : '/signup')
    }
  }

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
          className="relative pt-20 pb-28 px-6 sm:px-8 flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Play With Purpose • Feel, Not Fairway
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl font-serif text-foreground mb-6 leading-[1.15] tracking-tight">
            Play With Purpose.<br />
            <span className="italic font-normal text-primary">Change Lives</span> With Every Round.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-foreground/75 mb-10 max-w-2xl leading-relaxed">
            Turn your game into measurable social good. Log your scores, enter transparent monthly rewards draws, and fund world-changing charity projects worldwide.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8 h-12 bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transition-all text-sm font-semibold">
              <Link to="/signup">Join the Movement</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 bg-white/80 backdrop-blur-sm border-foreground/15 text-foreground hover:bg-foreground/5 text-sm font-semibold">
              <Link to="/#how-it-works">See How It Works</Link>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full max-w-lg mx-auto">
            <Card className="shadow-xl shadow-black/5 border-foreground/10 bg-white/90 backdrop-blur-sm py-8 px-6 rounded-3xl">
              <CardContent className="p-0 flex flex-col items-center justify-center">
                <span className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">
                  <CountUp end={totalRaised} prefix="£" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">Total Funds Raised For Verified Causes</span>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-foreground/10 text-[11px] text-foreground/60">
                  <span className="flex items-center gap-1"><span className="text-primary font-bold">✓</span> 100% Transparent</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><span className="text-primary font-bold">✓</span> 10%+ Minimum Giving</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><span className="text-primary font-bold">✓</span> Direct Partner Delivery</span>
                </div>
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
                {drawMonth} Premium Draw
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
                  <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Draw Status</div>
                  <div className="text-3xl font-serif text-foreground">
                    Accepting Entries
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button onClick={handleScoreSubmitClick} className="rounded-full px-8 bg-primary text-white hover:bg-primary/90">
                  Submit Scorecard to Enter
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6 bg-white border-foreground/10 text-foreground hover:bg-foreground/5">
                  <Link to="/draws">View Draw Results</Link>
                </Button>
              </div>
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
                  <div className="text-3xl font-serif text-accent mb-4">{formatGBP(match5)}</div>
                  <div className="inline-flex text-[10px] font-bold uppercase bg-accent/10 text-accent-foreground px-2 py-1 rounded">40% of Pool</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-foreground/60 mb-2">Match 4</div>
                  <div className="text-3xl font-serif text-foreground mb-4">{formatGBP(match4)}</div>
                  <div className="inline-flex text-[10px] font-bold uppercase bg-foreground/5 text-foreground/60 px-2 py-1 rounded">35% of Pool</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-foreground/60 mb-2">Match 3</div>
                  <div className="text-3xl font-serif text-foreground mb-4">{formatGBP(match3)}</div>
                  <div className="inline-flex text-[10px] font-bold uppercase bg-foreground/5 text-foreground/60 px-2 py-1 rounded">25% of Pool</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-foreground/60 mb-2">Charity Pot</div>
                  <div className="text-3xl font-serif text-accent/80 mb-4">10%+</div>
                  <div className="inline-flex text-[10px] font-bold uppercase bg-accent/10 text-accent-foreground px-2 py-1 rounded">Of Every Subscription</div>
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
              <div className="h-64 md:h-auto overflow-hidden">
                <img
                  src={
                    featuredCharity?.image_url ||
                    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop&q=80"
                  }
                  alt={featuredCharity?.name || "Featured Charity"}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                />
              </div>
              <div className="p-10 lg:p-16 flex flex-col justify-center">
                <div className="flex gap-3 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">
                    {featuredCharity && featuredCharity.category ? featuredCharity.category : 'Environment & Sustainability'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 py-1">Featured Partner</span>
                </div>
                <h3 className="text-3xl font-serif text-foreground mb-4">
                  {featuredCharity ? featuredCharity.name : 'Clean Water Initiative'}
                </h3>
                <p className="text-foreground/70 leading-relaxed mb-10">
                  {featuredCharity ? featuredCharity.description : 'Providing sustainable solar-powered filtration systems to remote communities.'}
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

                <div className="flex flex-wrap items-center gap-6">
                  <Button onClick={handleSupportCause} className="rounded-full px-8 bg-primary text-white hover:bg-primary/90">
                    Support This Cause
                  </Button>
                  <Link to="/charities" className="text-sm font-medium text-foreground hover:text-primary underline underline-offset-4">View Charity Directory</Link>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-24 px-6 sm:px-12 xl:px-0 max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">True Stories</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-foreground">Our Community Impact</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-border/50 shadow-sm transition-all duration-200 hover:shadow-md">
              <CardContent className="p-10 lg:p-12">
                <p className="text-foreground/80 font-serif text-lg leading-relaxed mb-8">
                  "Logging my scores turned from a standard routine into an exciting event. Winning the gear prize was fantastic, but seeing the donation confirmation felt even better."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary">
                    <img src="https://images.unsplash.com/photo-1530259152377-3a014e1092d0?w=150&h=150&fit=crop" alt="Sarah Jenkins" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Sarah Jenkins</div>
                    <div className="text-xs text-foreground/50">Stableford Player (HCP 14)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border/50 shadow-sm transition-all duration-200 hover:shadow-md">
              <CardContent className="p-10 lg:p-12">
                <p className="text-foreground/80 font-serif text-lg leading-relaxed mb-8">
                  "The constant funding stream from Digital Heroes allowed us to deploy emergency medical supplies without waiting for quarterly grant cycles."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop" alt="Dr. Aris Vance" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Dr. Aris Vance</div>
                    <div className="text-xs text-foreground/50">Director, Global Health Alliance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* PROMINENT PERSUASIVE BOTTOM CTA */}
        <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#1A2E26] text-white rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl"
          >
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2D5A43]/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#B58D3D]/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#E5A83B] mb-6">
                ★ Feel, Not Fairway ★
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
                Ready to Turn Your Passion Into Lasting Purpose?
              </h2>
              <p className="text-white/80 text-base md:text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
                Join thousands of members across the UK who are driving tangible global change every month through transparent rewards and verified charitable giving.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8 h-12 bg-[#2D5A43] hover:bg-[#234735] text-white shadow-lg text-sm font-semibold border border-white/20">
                  <Link to="/subscribe">Start Your Subscription</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 text-sm font-semibold">
                  <Link to="/charities">Explore Vetted Charities</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

      </main>
      
      <Footer />
    </div>
  )
}

