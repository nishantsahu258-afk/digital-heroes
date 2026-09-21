import { useEffect, useState } from 'react'
import { Navbar } from '@/layouts/Navbar'
import { Footer } from '@/layouts/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { charityService } from '@/services/charityService'
import type { Charity } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { formatGBP } from '@/lib/utils'

export default function Charities() {
  const { profile } = useAuth()
  const [causes, setCauses] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRaised, setTotalRaised] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await charityService.getCharities()
        setCauses(data)
        const total = data.reduce((acc, c) => acc + c.total_raised, 0)
        setTotalRaised(total)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSelectCharity = async (charityId: string) => {
    try {
      await charityService.updateProfileCharity(charityId)
      // trigger page refresh or context update in a real app,
      // here we just rely on the user observing the UI update
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 p-8 text-center">Loading...</main></div>

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20 px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-xl">
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70 mb-4">
                Collective Power
              </div>
              <h1 className="text-4xl md:text-5xl font-serif leading-tight">
                £{formatGBP(totalRaised)} raised across {causes.length} partner charities.
              </h1>
            </div>
            <div className="flex gap-12">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70 mb-1">Active Causes</div>
                <div className="text-3xl font-serif">{causes.length} Partners</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70 mb-1">Verified Audits</div>
                <div className="text-3xl font-serif">100% Clean</div>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Tools */}
        <section className="px-8 max-w-6xl mx-auto mt-12 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input 
                placeholder="Search causes..." 
                className="pl-10 h-10 border-foreground/10 bg-white"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['All Causes', 'Health', 'Education', 'Environment', 'Community'].map((filter, i) => (
                <button
                  key={filter}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                    i === 0 
                      ? 'bg-primary text-white' 
                      : 'bg-white border border-foreground/10 text-foreground/70 hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="px-8 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {causes.map(cause => (
              <Card key={cause.id} className={`border-foreground/5 shadow-sm overflow-hidden flex flex-col sm:flex-row h-full ${profile?.charity_id === cause.id ? 'ring-2 ring-primary' : ''}`}>
                <div className="w-full sm:w-2/5 h-48 sm:h-auto bg-foreground/5 shrink-0 flex items-center justify-center overflow-hidden">
                  {cause.image_url ? (
                    <img src={cause.image_url} alt={cause.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
                  ) : (
                    <div className="text-foreground/20 text-4xl transition-transform duration-300 hover:scale-[1.03]">♥</div>
                  )}
                </div>
                <CardContent className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">
                      VERIFIED
                    </span>
                    <span className="text-xs font-bold text-foreground/60">
                      Raised: <span className="text-foreground">£{formatGBP(cause.total_raised)}</span>
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif text-foreground mb-3">{cause.name}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed mb-6 flex-1">
                    {cause.description}
                  </p>
                  
                  {profile && profile.charity_id !== cause.id ? (
                     <Button onClick={() => handleSelectCharity(cause.id)} variant="outline" className="w-fit text-sm font-medium border-foreground/10 text-foreground">
                       Select as My Cause
                     </Button>
                  ) : profile && profile.charity_id === cause.id ? (
                     <Button disabled variant="outline" className="w-fit text-sm font-medium border-primary bg-primary/10 text-primary">
                       Your Current Cause
                     </Button>
                  ) : (
                     <Button variant="outline" className="w-fit text-sm font-medium border-foreground/10 text-foreground">
                       Login to Select
                     </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
