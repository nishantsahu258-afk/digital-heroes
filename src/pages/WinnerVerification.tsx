import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/layouts/Navbar'
import { formatGBP } from '@/lib/utils'
import { Footer } from '@/layouts/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { winnerService } from '@/services/winnerService'
import { drawService } from '@/services/drawService'
import type { Winner } from '@/types'

export default function WinnerVerification() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'verified'>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [winner, setWinner] = useState<Winner | null>(null)
  
  
  useEffect(() => {
    async function loadData() {
      try {
        const latestDraw = await drawService.getLatestPublishedDraw()
        if (latestDraw) {
          const myWinnings = await drawService.getMyWinnings(latestDraw.id)
          if (myWinnings) {
            setWinner(myWinnings)
            if (myWinnings.verification_status === 'pending') {
              setStatus('pending')
            } else if (myWinnings.verification_status === 'approved') {
              setStatus('verified')
            }
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !winner) return
    
    setLoading(true)
    setError(null)
    try {
      await winnerService.uploadProofImage(file, winner.draw_id)
      setStatus('pending')
    } catch (err: any) {
      setError(err.message || 'Failed to upload proof')
    } finally {
      setLoading(false)
    }
  }

  if (!winner) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pb-24 flex items-center justify-center p-4 text-center text-foreground/60">
          No winnings found for the latest draw.
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-24 flex items-center justify-center p-4">
        <div className="w-full max-w-lg mt-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-foreground mb-3">Claim Your Winnings</h1>
            <p className="text-foreground/70 text-sm max-w-sm mx-auto leading-relaxed">
              Upload proof of your scores to verify your Match {winner.match_count} win of £{formatGBP(winner.prize_amount, 2)}.
            </p>
          </div>

          <Card className="shadow-xl shadow-black/5 border-foreground/5 relative overflow-hidden">
            {status !== 'idle' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
            )}
            
            <CardHeader className="pb-6 text-center">
              {status === 'pending' ? (
                <div className="inline-flex items-center justify-center mx-auto text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent-foreground px-3 py-1 rounded mb-4">
                  Status: Pending Verification
                </div>
              ) : status === 'verified' ? (
                <div className="inline-flex items-center justify-center mx-auto text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary px-3 py-1 rounded mb-4">
                  Status: Verified & Approved
                </div>
              ) : (
                <CardTitle className="text-lg font-serif font-normal text-foreground text-left">Upload Proof of Scores</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {status === 'pending' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <span className="text-accent text-2xl">⏳</span>
                  </div>
                  <h3 className="text-xl font-serif text-foreground mb-3">Documents Under Review</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed mb-8">
                    Your proof of scores has been submitted securely. Our compliance team will review them within 24-48 hours before releasing funds.
                  </p>
                  <Button asChild variant="outline" className="border-foreground/10 text-foreground w-full">
                    <Link to="/dashboard">Return to Dashboard</Link>
                  </Button>
                </div>
              ) : status === 'verified' ? (
                 <div className="text-center py-8">
                 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                   <span className="text-primary text-2xl">✓</span>
                 </div>
                 <h3 className="text-xl font-serif text-foreground mb-3">Verification Complete</h3>
                 <p className="text-sm text-foreground/70 leading-relaxed mb-8">
                   Your winnings are approved and will be paid out shortly.
                 </p>
                 <Button asChild variant="outline" className="border-foreground/10 text-foreground w-full">
                   <Link to="/dashboard">Return to Dashboard</Link>
                 </Button>
               </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded">{error}</div>}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-foreground">Upload Scorecard Screenshot</Label>
                    <div className="border-2 border-dashed border-foreground/10 rounded-lg p-8 text-center bg-foreground/5 hover:bg-foreground/10 transition-colors relative">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-sm text-foreground/40">
                        {file ? '✓' : '+'}
                      </div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        {file ? file.name : 'Click to browse or drag and drop'}
                      </div>
                      <div className="text-xs text-foreground/50">Accepted formats: JPG, PNG, PDF (Max 5MB)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input type="checkbox" id="confirm" required className="mt-1 border-foreground/20 text-primary rounded" />
                    <Label htmlFor="confirm" className="text-xs text-foreground/70 leading-relaxed font-normal">
                      I confirm this screenshot is genuine and matches my submitted Stableford scores.
                    </Label>
                  </div>

                  <Button disabled={loading || !file} type="submit" className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-base mt-4">
                    {loading ? 'Uploading...' : 'Submit for Verification'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
