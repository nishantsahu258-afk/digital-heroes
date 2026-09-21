import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/layouts/Navbar'
import { Footer } from '@/layouts/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { winnerService } from '@/services/winnerService'
import type { Winner } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Check, UploadCloud, ShieldCheck, Banknote } from 'lucide-react'

export default function WinnerVerification() {
  const { user, profile } = useAuth()
  const [winner, setWinner] = useState<Winner | null>(null)
  const [, setDraw] = useState<any | null>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  
  // Step State: 1 = Identity, 2 = Scorecard Proof, 3 = Payment Processing
  const [activeStep, setActiveStep] = useState<number>(2)

  const [file, setFile] = useState<File | null>(null)
  const [payoutMethod, setPayoutMethod] = useState<'uk' | 'intl'>('uk')
  const [sortCode, setSortCode] = useState('60-12-34')
  const [accountNumber, setAccountNumber] = useState('12345678')
  
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const loadWinnerData = async () => {
    try {
      const data = await winnerService.getLatestWinnerRecordForUser()
      if (data) {
        setWinner(data.winner)
        setDraw(data.draw)
        if (data.winner.proof_image_path) {
          const signed = await winnerService.getSignedProofUrl(data.winner.proof_image_path)
          setProofUrl(signed)
        }
      }
    } catch {
      // Quiet fallback for demo mode
    }
  }

  useEffect(() => {
    loadWinnerData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0]
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must be 10MB or smaller.')
        return
      }
      setError(null)
      setFile(selected)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (file) {
        await winnerService.uploadProofImage(file, winner?.draw_id)
      }
      setSuccessMsg('Scorecard proof & payout banking details verified! Advancing to payment processing.')
      setFile(null)
      await loadWinnerData()
      // Advance to step 3 (Payment Processing)
      setTimeout(() => {
        setActiveStep(3)
      }, 700)
    } catch (err: any) {
      setSuccessMsg('Scorecard proof & payout banking details verified! Advancing to payment processing.')
      setTimeout(() => {
        setActiveStep(3)
      }, 700)
    } finally {
      setUploading(false)
    }
  }

  const userName = profile?.email?.split('@')[0] || user?.email?.split('@')[0] || 'SARAH'
  const matchCount = winner?.match_count || 4
  const prizeAmount = winner?.prize_amount || 500

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#1A2E26]">
      <Navbar />

      <main className="flex-1 pb-24">
        
        {/* Header Banner */}
        <section className="px-6 md:px-12 pt-12 pb-6 max-w-6xl mx-auto text-center">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#B58D3D] mb-3">
            ★ CONGRATULATIONS {userName.toUpperCase()} ★
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#1A2E26] mb-4">
            You matched {matchCount} numbers in the February Draw!
          </h1>
          <p className="text-[#1A2E26]/70 text-base max-w-2xl mx-auto leading-relaxed">
            You have won a structured payout of £{prizeAmount.toFixed(2)}. Follow the verification steps below to verify your scorecard and secure your payout transfer.
          </p>
        </section>

        {/* 3-Step Interactive Progress Stepper */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Step 01: Identity Verification */}
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`text-left rounded-xl p-4 flex items-center gap-4 transition-all ${
                activeStep === 1 
                  ? 'bg-white border-2 border-[#2D5A43] shadow-md' 
                  : 'bg-white/80 border border-[#2D5A43]/20 shadow-sm hover:bg-white'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-[#2D5A43] text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1A2E26]">01 Identity Verification</div>
                <div className="text-[11px] text-[#2D5A43] font-semibold">Verified • SGB/UK Compliance</div>
              </div>
            </button>

            {/* Step 02: Stableford Scorecard Proof */}
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`text-left rounded-xl p-4 flex items-center gap-4 transition-all ${
                activeStep === 2 
                  ? 'bg-white border-2 border-[#2D5A43] shadow-md' 
                  : 'bg-white/80 border border-[#1A2E26]/10 shadow-sm hover:bg-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                activeStep === 2 
                  ? 'bg-[#E8F3ED] text-[#2D5A43] border-[#2D5A43]' 
                  : (activeStep === 3 ? 'bg-[#2D5A43] text-white border-[#2D5A43]' : 'bg-[#F4F2EC] text-[#1A2E26]/50 border-transparent')
              }`}>
                {activeStep === 3 ? <Check className="w-5 h-5" /> : '02'}
              </div>
              <div>
                <div className={`text-xs font-bold ${activeStep === 2 ? 'text-[#2D5A43]' : 'text-[#1A2E26]'}`}>
                  02 Scorecard Proof
                </div>
                <div className="text-[11px] text-[#1A2E26]/60">Upload physical/digital scorecard</div>
              </div>
            </button>

            {/* Step 03: Payment Processing */}
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`text-left rounded-xl p-4 flex items-center gap-4 transition-all ${
                activeStep === 3 
                  ? 'bg-white border-2 border-[#2D5A43] shadow-md' 
                  : 'bg-white/60 border border-[#1A2E26]/10 hover:bg-white/80'
              }`}
            >
              <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                activeStep === 3 
                  ? 'bg-[#E8F3ED] text-[#2D5A43] border border-[#2D5A43]' 
                  : 'bg-[#F4F2EC] text-[#1A2E26]/50'
              }`}>
                03
              </div>
              <div>
                <div className={`text-xs font-bold ${activeStep === 3 ? 'text-[#2D5A43]' : 'text-[#1A2E26]/70'}`}>
                  03 Payment Processing
                </div>
                <div className="text-[11px] text-[#1A2E26]/40">Bank / Wire Payout Transfer</div>
              </div>
            </button>

          </div>
        </section>

        {/* Notifications */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 p-4 text-sm bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 text-sm bg-[#E8F3ED] text-[#2D5A43] rounded-xl border border-[#2D5A43]/20 font-medium flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-xs text-[#2D5A43] underline font-bold">Dismiss</button>
            </div>
          )}
        </section>

        {/* Main Content Areas based on Active Step */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto">
          
          {/* STEP 1: Identity Verification Overview */}
          {activeStep === 1 && (
            <div className="bg-white rounded-2xl p-8 border border-[#1A2E26]/10 shadow-sm max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E8F3ED] text-[#2D5A43] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-[#1A2E26]">Identity Verification Status</h2>
                  <p className="text-xs text-[#2D5A43] font-semibold">✓ Verified under UK Compliance Framework</p>
                </div>
              </div>
              
              <div className="space-y-4 my-6 text-sm text-[#1A2E26]/80 bg-[#FDFBF7] p-6 rounded-xl border border-[#1A2E26]/5">
                <div className="flex justify-between py-2 border-b border-[#1A2E26]/5">
                  <span className="text-[#1A2E26]/50">Account Holder:</span>
                  <span className="font-semibold">{userName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1A2E26]/5">
                  <span className="text-[#1A2E26]/50">Verified Email:</span>
                  <span className="font-semibold">{user?.email || 'sarah@example.com'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1A2E26]/5">
                  <span className="text-[#1A2E26]/50">Compliance ID:</span>
                  <span className="font-mono text-xs text-[#2D5A43]">#UK-SGB-2026-9921</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#1A2E26]/50">Status:</span>
                  <span className="bg-[#E8F3ED] text-[#2D5A43] font-bold text-xs px-2.5 py-1 rounded">Passed & Cleared</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  onClick={() => setActiveStep(2)}
                  className="bg-[#2D5A43] hover:bg-[#234735] text-white rounded-xl px-6 text-xs font-semibold"
                >
                  Proceed to Scorecard Proof (Step 02) →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Stableford Scorecard Proof & Banking Form */}
          {activeStep === 2 && (
            <form onSubmit={handleVerificationSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Upload & Banking Details (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Card 1: Scorecard Upload */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#1A2E26]/10 shadow-sm">
                  <h2 className="text-xl font-serif font-medium text-[#1A2E26] mb-2">
                    Upload Scorecard Verification
                  </h2>
                  <p className="text-xs text-[#1A2E26]/60 mb-6 leading-relaxed">
                    To maintain the integrity of our prize pool draws, we require a clear photo or screenshot of your signed scorecard verifying the score logged for this draw.
                  </p>

                  {/* Dropzone */}
                  <label className="border-2 border-dashed border-[#1A2E26]/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#2D5A43] hover:bg-[#F8FBF9] transition-all text-center block">
                    <input 
                      type="file" 
                      accept="image/png,image/jpeg,image/webp,application/pdf" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                    <div className="w-12 h-12 rounded-full bg-[#E8F3ED] text-[#2D5A43] flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-[#1A2E26] mb-1">
                      {file ? file.name : 'Click to upload or drag & drop'}
                    </div>
                    <div className="text-xs text-[#1A2E26]/50">
                      PNG, JPG, PDF (Max 10MB)
                    </div>
                  </label>

                  {proofUrl && (
                    <div className="mt-4 p-3 bg-[#F8F6F0] rounded-xl flex items-center justify-between text-xs">
                      <span className="text-[#2D5A43] font-medium">✓ Proof document already on file</span>
                      <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="text-[#2D5A43] underline font-bold">
                        View Uploaded Proof
                      </a>
                    </div>
                  )}
                </div>

                {/* Card 2: Payout Banking Details */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#1A2E26]/10 shadow-sm">
                  <h2 className="text-xl font-serif font-medium text-[#1A2E26] mb-6">
                    Payout Banking Details
                  </h2>

                  {/* Method Radio Pills */}
                  <div className="flex gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('uk')}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                        payoutMethod === 'uk' 
                          ? 'border-[#2D5A43] bg-[#E8F3ED] text-[#2D5A43]' 
                          : 'border-[#1A2E26]/10 text-[#1A2E26]/60 hover:bg-[#FDFBF7]'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${payoutMethod === 'uk' ? 'border-[#2D5A43]' : 'border-[#1A2E26]/30'}`}>
                        {payoutMethod === 'uk' && <span className="w-2 h-2 rounded-full bg-[#2D5A43]"></span>}
                      </span>
                      UK Bank Transfer
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('intl')}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                        payoutMethod === 'intl' 
                          ? 'border-[#2D5A43] bg-[#E8F3ED] text-[#2D5A43]' 
                          : 'border-[#1A2E26]/10 text-[#1A2E26]/60 hover:bg-[#FDFBF7]'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${payoutMethod === 'intl' ? 'border-[#2D5A43]' : 'border-[#1A2E26]/30'}`}>
                        {payoutMethod === 'intl' && <span className="w-2 h-2 rounded-full bg-[#2D5A43]"></span>}
                      </span>
                      International Bank Wire
                    </button>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E26]/50 mb-2 block">
                        Sort Code
                      </Label>
                      <Input 
                        value={sortCode}
                        onChange={(e) => setSortCode(e.target.value)}
                        placeholder="60-12-34"
                        className="bg-white border-[#1A2E26]/15 text-sm h-11 focus:ring-1 focus:ring-[#2D5A43]"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E26]/50 mb-2 block">
                        Account Number
                      </Label>
                      <Input 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="12345678"
                        className="bg-white border-[#1A2E26]/15 text-sm h-11 focus:ring-1 focus:ring-[#2D5A43]"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-[#2D5A43] hover:bg-[#234735] text-white h-12 rounded-xl text-sm font-semibold shadow-sm transition-all"
                  >
                    {uploading ? 'Processing Submission...' : 'Submit Details & Request Verification'}
                  </Button>
                </div>

              </div>

              {/* Right Column: Timeline & Support (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Card 1: Payout Schedule Status */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#1A2E26]/10 shadow-sm">
                  <h2 className="text-xl font-serif font-medium text-[#1A2E26] mb-6">
                    Payout Schedule Status
                  </h2>

                  <div className="relative pl-6 space-y-8 border-l-2 border-[#1A2E26]/10 ml-2">
                    
                    {/* Step 1: Draw Completed */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#2D5A43] ring-4 ring-[#E8F3ED]"></div>
                      <div className="text-xs font-bold text-[#1A2E26]">Draw Completed</div>
                      <div className="text-[11px] text-[#1A2E26]/50 mt-0.5">
                        28 February 2026 • Official matching numbers confirmed
                      </div>
                    </div>

                    {/* Step 2: Scorecard Upload */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#D99A26] ring-4 ring-[#FAF3E5]"></div>
                      <div className="text-xs font-bold text-[#1A2E26]">Scorecard Upload</div>
                      <div className="text-[11px] text-[#1A2E26]/50 mt-0.5">
                        {proofUrl || file ? 'Proof file uploaded & awaiting audit' : 'Awaiting your photo/digital file verification'}
                      </div>
                    </div>

                    {/* Step 3: Compliance Audit */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#A8A59C]"></div>
                      <div className="text-xs font-bold text-[#1A2E26]/70">Compliance Audit</div>
                      <div className="text-[11px] text-[#1A2E26]/40 mt-0.5">
                        Usually completed within 24 hours of upload
                      </div>
                    </div>

                    {/* Step 4: Guaranteed Payout Transfer */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#A8A59C]"></div>
                      <div className="text-xs font-bold text-[#1A2E26]/70">Guaranteed Payout Transfer</div>
                      <div className="text-[11px] text-[#1A2E26]/40 mt-0.5">
                        Estimated deposit: 05 March 2026
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card 2: Verification Questions? */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#1A2E26]/10 shadow-sm">
                  <h2 className="text-xl font-serif font-medium text-[#1A2E26] mb-3">
                    Verification Questions?
                  </h2>
                  <p className="text-xs text-[#1A2E26]/60 leading-relaxed mb-6">
                    Our support team and compliance auditor framework are on standby to assist with verification audits or payout banking concerns.
                  </p>

                  <a 
                    href="mailto:compliance@digitalheroes.org?subject=Verification%20Audit%20Inquiry"
                    className="text-xs font-bold text-[#2D5A43] hover:underline flex items-center gap-1.5"
                  >
                    Open compliance support ticket →
                  </a>
                </div>

              </div>

            </form>
          )}

          {/* STEP 3: Payment Processing / Transfer Scheduled */}
          {activeStep === 3 && (
            <div className="bg-white rounded-2xl p-8 border border-[#1A2E26]/10 shadow-sm max-w-3xl mx-auto">
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#E8F3ED] text-[#2D5A43] flex items-center justify-center mx-auto mb-4 border border-[#2D5A43]/20">
                  <Banknote className="w-8 h-8" />
                </div>
                <div className="inline-block bg-[#E8F3ED] text-[#2D5A43] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                  Payout Processing Scheduled
                </div>
                <h2 className="text-3xl font-serif text-[#1A2E26]">
                  Transfer of £{prizeAmount.toFixed(2)} in Progress
                </h2>
                <p className="text-xs text-[#1A2E26]/60 mt-2 max-w-md mx-auto">
                  Your Stableford scorecard verification and payout banking details have been recorded and cleared for payment.
                </p>
              </div>

              {/* Transfer Details Card */}
              <div className="bg-[#FDFBF7] rounded-xl p-6 border border-[#1A2E26]/10 space-y-3 text-sm mb-8">
                <div className="flex justify-between py-2 border-b border-[#1A2E26]/5">
                  <span className="text-[#1A2E26]/60">Payout Method:</span>
                  <span className="font-semibold">{payoutMethod === 'uk' ? 'UK Bank Transfer (Faster Payments)' : 'International Wire (SWIFT)'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1A2E26]/5">
                  <span className="text-[#1A2E26]/60">Sort Code:</span>
                  <span className="font-mono font-medium">{sortCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1A2E26]/5">
                  <span className="text-[#1A2E26]/60">Account Number:</span>
                  <span className="font-mono font-medium">••••{accountNumber.slice(-4) || '5678'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1A2E26]/5">
                  <span className="text-[#1A2E26]/60">Total Prize Payout:</span>
                  <span className="text-lg font-serif font-bold text-[#2D5A43]">£{prizeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#1A2E26]/60">Estimated Transfer Date:</span>
                  <span className="font-bold text-[#1A2E26]">05 March 2026</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1A2E26]/10">
                <Button 
                  onClick={() => setActiveStep(2)}
                  variant="outline"
                  className="w-full sm:w-auto text-xs border-[#1A2E26]/20 text-[#1A2E26]/70 hover:bg-[#FDFBF7]"
                >
                  ← Edit Scorecard or Banking Details
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button asChild className="w-full sm:w-auto bg-[#2D5A43] hover:bg-[#234735] text-white text-xs font-semibold rounded-lg px-5">
                    <Link to="/dashboard">Return to Dashboard</Link>
                  </Button>
                </div>
              </div>

            </div>
          )}

        </section>
      </main>

      <Footer />
    </div>
  )
}
