import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Causes')

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

  const categories = ['All Causes', 'Health', 'Education', 'Environment', 'Community']

  const filteredCauses = causes.filter((cause, index) => {
    const category = ['Environment', 'Health', 'Education', 'Community'][index % 4]
    const matchesSearch = cause.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cause.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Causes' || category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </main>
      <Footer />
    </div>
  )

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
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search causes..." 
                className="pl-10 h-10 border-foreground/10 bg-white"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedCategory(filter)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === filter
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-white border border-foreground/10 text-foreground/70 hover:text-foreground hover:bg-foreground/5'
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
          {filteredCauses.length === 0 ? (
            <div className="py-20 text-center text-foreground/50">
              <p className="text-base font-serif mb-2">No charity causes matched your criteria.</p>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('All Causes') }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {filteredCauses.map((cause, index) => {
                const category = ['ENVIRONMENT', 'HEALTH', 'EDUCATION', 'COMMUNITY'][index % 4]
                return (
                  <Card key={cause.id} className={`border-foreground/10 rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row h-full transition-all duration-200 hover:shadow-md ${profile?.charity_id === cause.id ? 'ring-2 ring-primary' : ''}`}>
                    <div className="w-full sm:w-1/2 h-48 sm:h-auto bg-foreground/5 shrink-0 flex items-center justify-center overflow-hidden">
                      <Link to={`/charities/${cause.id}`} className="w-full h-full block">
                        <img
                          src={cause.image_url || [
                            "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop&q=80",
                            "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop&q=80",
                            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop&q=80",
                            "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop&q=80"
                          ][index % 4]}
                          alt={cause.name}
                          onError={(e) => {
                            const fallbacks = [
                              "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop&q=80",
                              "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop&q=80",
                              "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop&q=80",
                              "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop&q=80"
                            ];
                            (e.target as HTMLImageElement).src = fallbacks[index % 4];
                          }}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                        />
                      </Link>
                    </div>
                    <CardContent className="p-8 flex flex-col flex-1 sm:w-1/2 justify-center">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-foreground/5 text-foreground/70 px-3 py-1.5 rounded-full">
                          {category}
                        </span>
                        <span className="text-[11px] font-medium text-foreground/60">
                          Raised: <span className="font-bold text-foreground">£{formatGBP(cause.total_raised)}</span>
                        </span>
                      </div>
                      <Link to={`/charities/${cause.id}`} className="hover:text-primary transition-colors">
                        <h3 className="text-2xl font-serif text-foreground mb-3">{cause.name}</h3>
                      </Link>
                      <p className="text-sm text-foreground/70 leading-relaxed mb-6 flex-1 line-clamp-3">
                        {cause.description}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <Button asChild variant="outline" className="w-fit text-xs font-semibold border-foreground/20 text-foreground">
                          <Link to={`/charities/${cause.id}`}>
                            Learn More & Partner
                          </Link>
                        </Button>
                        {profile?.charity_id === cause.id && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">
                            Active Cause ✓
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
