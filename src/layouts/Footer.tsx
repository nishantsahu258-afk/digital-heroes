import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function Footer() {
  const { user, profile } = useAuth()

  return (
    <footer className="w-full bg-[#0B132B] text-white py-16 px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand & Description */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#2D5A43] flex items-center justify-center">
                <span className="text-white text-xs font-bold font-sans">DH</span>
              </div>
              <span className="font-serif text-xl font-medium text-white">Digital Heroes</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              A premium golf performance, monthly rewards, and charity platform. Play the sport you love, make your scores count, and drive genuine impact.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Platform</span>
              <Link to="/#how-it-works" className="text-sm text-white/80 hover:text-white transition-colors">How It Works</Link>
              <Link to="/subscribe" className="text-sm text-white/80 hover:text-white transition-colors">Pricing Plans</Link>
              <Link to="/charities" className="text-sm text-white/80 hover:text-white transition-colors">Charity Directory</Link>
              <Link to="/draws" className="text-sm text-white/80 hover:text-white transition-colors">Leaderboards</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Impact</span>
              <Link to="/charities" className="text-sm text-white/80 hover:text-white transition-colors">Featured Causes</Link>
              <Link to="/draws" className="text-sm text-white/80 hover:text-white transition-colors">Donation Reports</Link>
              <Link to="/winner-verification" className="text-sm text-white/80 hover:text-white transition-colors">Winner Verification</Link>
              {user && profile?.role === 'admin' && (
                <Link to="/admin" className="text-sm text-white/80 hover:text-white transition-colors">Admin Console</Link>
              )}
            </div>
          </div>
        </div>

        {/* Partners */}
        <div className="border-t border-white/10 pt-8">
          <span className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 block">Charity & Compliance Partners</span>
          <div className="flex flex-wrap gap-8 text-sm font-serif text-white/60">
            <span>Global Impact Alliance</span>
            <span>GiveGreen Foundation</span>
            <span>UK Charity Trust</span>
            <span>SportsForGood Org</span>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>© 2026 Digital Heroes. Licensed under the UK Charity Commission Framework.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
