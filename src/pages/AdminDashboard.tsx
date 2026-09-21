import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { drawService } from '@/services/drawService'
import { CountUp } from '@/components/ui/CountUp'

export default function AdminDashboard() {
  const { profile, signOut } = useAuth()
  
  const [stats, setStats] = useState({
    users: 0,
    subs: 0,
    donations: 0,
    drawPool: 0,
    pendingVerifications: 0
  })
  const [scores, setScores] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (profile?.role !== 'admin') return

      try {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
        const { count: subCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
        const { data: charities } = await supabase.from('charities').select('total_raised')
        const raised = charities?.reduce((acc, c) => acc + (c.total_raised || 0), 0) || 0
        
        const { count: pendingCount } = await supabase.from('winners').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending')
        
        const draws = await drawService.getDraws()
        const upcoming = draws.find(d => d.status === 'draft')
        
        setStats({
          users: userCount || 0,
          subs: subCount || 0,
          donations: raised,
          drawPool: upcoming?.total_pool || 0,
          pendingVerifications: pendingCount || 0
        })

        const { data: recentScores } = await supabase
          .from('scores')
          .select('*, profiles(full_name)')
          .order('score_date', { ascending: false })
          .limit(10)
        
        setScores(recentScores || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [profile])

  const handleGenerateDraw = async () => {
    setGenerating(true)
    setError(null)
    try {
      await drawService.generateDrawAsAdmin()
      alert('Draw generated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to generate draw')
    } finally {
      setGenerating(false)
    }
  }

  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center">Unauthorized. Admin access required.</div>
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col fixed h-full z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold font-sans">DH</span>
            </div>
            <span className="font-serif text-lg font-medium">Admin</span>
          </div>
          
          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/10 text-white font-medium text-sm">
              Dashboard
            </Link>
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm">
              Users & Subs
            </Link>
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm">
              Draw Management
            </Link>
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm">
              Charity Partners
            </Link>
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm">
              Reports & Audit
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Admin User</div>
            <button onClick={signOut} className="text-xs text-white/50 hover:text-white">Sign Out</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-foreground/5 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-foreground">Overview</h1>
          <div className="flex gap-4 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input placeholder="Search users or draws..." className="pl-9 h-10 bg-white border-0 shadow-sm" />
            </div>
            <Button 
              disabled={generating} 
              onClick={handleGenerateDraw} 
              className="bg-primary text-white hover:bg-primary/90 h-10 w-48 relative overflow-hidden transition-all duration-200">
              {generating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Generating...
                </span>
              ) : 'Generate Draw Numbers'}
            </Button>
          </div>
        </div>

        {error && <div className="mb-4 p-4 text-sm bg-destructive/10 text-destructive rounded">{error}</div>}

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Total Users</div>
              <div className="text-3xl font-serif text-foreground"><CountUp end={stats.users} /></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Active Subs</div>
              <div className="text-3xl font-serif text-foreground"><CountUp end={stats.subs} /></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Monthly Donations</div>
              <div className="text-3xl font-serif text-primary"><CountUp end={stats.donations} prefix="£" /></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Draw Pool</div>
              <div className="text-3xl font-serif text-accent"><CountUp end={stats.drawPool} prefix="£" /></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Pending Verifications</div>
              <div className="text-3xl font-serif text-accent"><CountUp end={stats.pendingVerifications} /></div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 border-b border-foreground/5">
            <CardTitle className="text-lg font-serif font-normal">Recent Scorecard Submissions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-12 gap-4 p-6 text-[10px] font-bold uppercase tracking-widest text-foreground/40 border-b border-foreground/5">
              <div className="col-span-3">Player</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            
            <div className="divide-y divide-foreground/5">
              {scores.length === 0 ? (
                <div className="p-6 text-center text-sm text-foreground/50">No recent scores found.</div>
              ) : (
                scores.map(score => (
                  <div key={score.id} className="grid grid-cols-12 gap-4 p-6 items-center transition-colors duration-150 hover:bg-foreground/5">
                    <div className="col-span-3 text-sm font-medium">{score.profiles?.full_name || 'User'}</div>
                    <div className="col-span-3 text-sm text-foreground/70">{score.score_date ? new Date(score.score_date).toLocaleDateString() : 'N/A'}</div>
                    <div className="col-span-2 text-center font-bold">{score.score_value} pts</div>
                    <div className="col-span-2 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">Verified</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-xs">Review</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
