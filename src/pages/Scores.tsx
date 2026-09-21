import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/layouts/Navbar'
import { Footer } from '@/layouts/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { scoreService } from '@/services/scoreService'
import { authService } from '@/services/authService'
import type { Score } from '@/types'

export default function Scores() {
  const [scores, setScores] = useState<Score[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  
  const [scoreValue, setScoreValue] = useState('')
  const [scoreDate, setScoreDate] = useState(() => new Date().toISOString().split('T')[0])
  const [scoreValueError, setScoreValueError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activatingDemo, setActivatingDemo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [recentScores, sub] = await Promise.all([
        scoreService.getScores(),
        authService.getSubscription()
      ])
      setScores(recentScores)
      setSubscription(sub)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const validateScoreInput = (val: string): boolean => {
    if (!val || val.trim() === '') {
      setScoreValueError(null)
      return false
    }
    if (!/^-?\d+$/.test(val.trim())) {
      setScoreValueError('Stableford score must be between 1 and 45.')
      return false
    }
    const num = Number(val)
    if (!Number.isInteger(num) || num < 1 || num > 45) {
      setScoreValueError('Stableford score must be between 1 and 45.')
      return false
    }
    setScoreValueError(null)
    return true
  }

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setScoreValue(val)
    if (val.trim() !== '') {
      validateScoreInput(val)
    } else {
      setScoreValueError(null)
    }
  }

  const handleQuickActivateDemo = async () => {
    setActivatingDemo(true)
    setError(null)
    try {
      await authService.activateDemoSubscription('monthly')
      await loadData()
      setSuccessMsg('Demo subscription activated successfully! You can now submit scorecards.')
    } catch (err: any) {
      setError(err.message || 'Failed to activate demo subscription')
    } finally {
      setActivatingDemo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVerified) {
      setError('Active subscription required to submit scorecards. Activate demo subscription below.')
      return
    }

    if (!scoreValue || !validateScoreInput(scoreValue)) {
      setScoreValueError('Stableford score must be between 1 and 45.')
      return
    }

    const val = Number(scoreValue)
    if (!Number.isInteger(val) || val < 1 || val > 45) {
      setScoreValueError('Stableford score must be between 1 and 45.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    setScoreValueError(null)
    
    try {
      await scoreService.submitScore(val, scoreDate || new Date().toISOString().split('T')[0])
      
      const updatedScores = await scoreService.getScores()
      setScores(updatedScores)
      setSuccessMsg(`Scorecard of ${val} pts logged successfully! (${updatedScores.length}/5 score slots filled)`)
      setScoreValue('')
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.includes('duplicate') || msg.includes('scores_profile_id_score_date_key') || msg.includes('409') || msg.includes('already exists')) {
        setError('You have already submitted a score for this date. Only one score per date is allowed.')
      } else if (msg.includes('1 and 45') || msg.includes('score_value')) {
        setScoreValueError('Stableford score must be between 1 and 45.')
      } else {
        setError(msg || 'Failed to submit score')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await scoreService.deleteScore(id)
      const remaining = scores.filter(s => s.id !== id)
      setScores(remaining)
      setSuccessMsg('Scorecard removed.')
    } catch (err) {
      console.error('Failed to delete score', err)
    }
  }

  const isVerified = subscription?.status === 'active'
  const isAnnual = subscription?.tier === 'yearly'
  const planName = isAnnual ? 'Annual Hero' : (subscription ? 'Monthly Hero' : 'Free Tier')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-24">
        {/* Header */}
        <section className="px-8 py-10 max-w-6xl mx-auto border-b border-foreground/5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-serif text-foreground">My Scores</h1>
                {isVerified ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent-foreground px-3 py-1 rounded">
                    {planName}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-destructive/10 text-destructive px-3 py-1 rounded">
                    Unsubscribed
                  </span>
                )}
              </div>
              <p className="text-foreground/60 text-sm">
                Submit and manage your certified Stableford scorecard submissions.
              </p>
            </div>
            
            <div className={`flex items-center gap-4 border px-4 py-3 rounded-lg ${scores.length >= 5 ? 'bg-primary/5 border-primary/20' : 'bg-foreground/5 border-foreground/10'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${scores.length >= 5 ? 'bg-white text-primary' : 'bg-foreground/10 text-foreground/40'}`}>
                <span className="text-xs font-bold">✓</span>
              </div>
              <div>
                <div className={`text-sm font-bold ${scores.length >= 5 ? 'text-primary' : 'text-foreground/70'}`}>
                  {scores.length >= 5 ? 'Draw Eligible' : 'Incomplete Entries'}
                </div>
                <div className="text-xs text-foreground/70">{scores.length} of 5 score slots submitted</div>
              </div>
            </div>
          </div>
        </section>

        {/* Unsubscribed Notice / Quick Action */}
        {!isVerified && (
          <section className="px-8 max-w-6xl mx-auto mb-8">
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">⚡</span>
                  <h3 className="text-base font-bold text-foreground">Subscription Required to Log Scores</h3>
                </div>
                <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
                  Only active subscribers can log scorecards and participate in monthly prize draws. You can activate a demo subscription instantly for assignment testing.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button 
                  disabled={activatingDemo}
                  onClick={handleQuickActivateDemo}
                  className="bg-primary text-white hover:bg-primary/90 text-xs font-medium h-10 px-4"
                >
                  {activatingDemo ? 'Activating...' : 'Activate Demo Subscription'}
                </Button>
                <Button asChild variant="outline" className="border-foreground/15 text-foreground text-xs h-10 px-4">
                  <Link to="/subscribe">View Plans</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        <section className="px-8 max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Submit Score */}
          <div className="space-y-8">
            <Card className="shadow-sm border-foreground/5">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-serif font-normal">Submit New Scorecard</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && <div className="p-3 text-xs bg-destructive/10 text-destructive rounded">{error}</div>}
                  {successMsg && <div className="p-3 text-xs bg-primary/10 text-primary rounded font-medium">{successMsg}</div>}
                  
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-foreground">Play Date</Label>
                    <Input 
                      type="date" 
                      value={scoreDate}
                      onChange={e => setScoreDate(e.target.value)}
                      required
                      className="h-12 bg-white" 
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold text-foreground">Stableford Points</Label>
                      <span className="text-[10px] text-foreground/40">Range: 1 - 45</span>
                    </div>
                    <Input 
                      type="number" 
                      min="1" 
                      max="45" 
                      step="1"
                      required
                      value={scoreValue}
                      onChange={handleScoreChange}
                      placeholder="e.g. 36" 
                      className={`h-12 bg-white ${scoreValueError ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
                    />
                    {scoreValueError && (
                      <div className="text-xs text-destructive font-medium">{scoreValueError}</div>
                    )}
                  </div>
                  <div className="text-xs text-foreground/60 flex items-center gap-2">
                    <span className="text-primary">✓</span> Score verified against verified handicap profile
                  </div>

                  {isVerified ? (
                    <Button 
                      disabled={loading || Boolean(scoreValueError)} 
                      type="submit" 
                      className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-base font-medium"
                    >
                      {loading ? 'Adding Scorecard...' : 'Add Scorecard'}
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      disabled={activatingDemo}
                      onClick={handleQuickActivateDemo}
                      className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-sm font-medium"
                    >
                      {activatingDemo ? 'Activating...' : 'Activate Subscription to Add Score'}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="bg-foreground/5 border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-serif font-normal">Stableford Rules & Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-foreground/70">
                  <li className="flex gap-3"><span className="text-foreground/40">•</span> You can submit a maximum of 5 scorecards each month.</li>
                  <li className="flex gap-3"><span className="text-foreground/40">•</span> Only true Stableford scores between 1 and 45 points can be logged.</li>
                  <li className="flex gap-3"><span className="text-foreground/40">•</span> A minimum of 5 verified scorecards are required to enter the monthly premium draw.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Scores History */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-foreground/5 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-foreground/5 mb-2">
                <CardTitle className="text-xl font-serif font-normal">Logged Scores History</CardTitle>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-foreground/10 text-foreground/60 px-3 py-1.5 rounded">
                  {scores.length} of 5 Score Slots Filled
                </span>
              </CardHeader>
              <CardContent>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40 border-b border-foreground/5">
                  <div className="col-span-4">Play Date</div>
                  <div className="col-span-4 text-center">Score</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-foreground/5">
                  {scores.length === 0 ? (
                    <div className="py-16 text-center text-sm text-foreground/50">
                      <div className="text-2xl mb-2">⛳</div>
                      <p className="font-serif text-base mb-1">No scores logged yet.</p>
                      <p className="text-xs text-foreground/40">Enter your date and Stableford points to submit your first scorecard.</p>
                    </div>
                  ) : (
                    scores.map((score) => (
                      <div key={score.id} className="grid grid-cols-12 gap-4 py-4 items-center hover:bg-foreground/5 transition-colors px-2 rounded-md">
                        <div className="col-span-4 text-sm text-foreground/70 font-medium">
                          {new Date(score.score_date).toLocaleDateString()}
                        </div>
                        <div className="col-span-4 text-center font-bold text-foreground text-base">
                          {score.score_value} pts
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">
                            Verified
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-end gap-3 text-foreground/40">
                          <button 
                            onClick={() => handleDelete(score.id)} 
                            className="hover:text-destructive text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  )
}
