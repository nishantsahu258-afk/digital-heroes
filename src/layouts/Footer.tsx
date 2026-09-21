import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="w-full bg-secondary text-secondary-foreground py-16 px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand & Description */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-sm bg-primary/20 flex items-center justify-center">
                <span className="text-primary-foreground text-[10px] font-bold font-sans">DH</span>
              </div>
              <span className="font-serif text-xl font-medium">Digital Heroes</span>
            </div>
            <p className="text-sm text-secondary-foreground/70 leading-relaxed">
              A premium golf performance, monthly rewards, and charity platform. Play the sport you love, make your scores count, and drive genuine impact.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary-foreground/50 mb-2">Platform</span>
              <Link to="/#how-it-works" className="text-sm text-secondary-foreground/80 hover:text-white transition-colors">How It Works</Link>
              <Link to="/subscribe" className="text-sm text-secondary-foreground/80 hover:text-white transition-colors">Pricing Plans</Link>
              <Link to="/dashboard" className="text-sm text-secondary-foreground/80 hover:text-white transition-colors">Your Dashboard</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary-foreground/50 mb-2">Impact</span>
              <Link to="/charities" className="text-sm text-secondary-foreground/80 hover:text-white transition-colors">Charity Directory</Link>
              <Link to="/draws" className="text-sm text-secondary-foreground/80 hover:text-white transition-colors">Draw Results</Link>
            </div>
          </div>
        </div>

        {/* Partners */}
        <div className="border-t border-secondary-foreground/10 pt-8">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary-foreground/50 mb-4 block">Charity & Compliance Partners</span>
          <div className="flex flex-wrap gap-8 text-sm font-serif text-secondary-foreground/60">
            <span>Global Impact Alliance</span>
            <span>GiveGreen Foundation</span>
            <span>UK Charity Trust</span>
            <span>SportsForGood Org</span>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-secondary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondary-foreground/50">
          <p>© 2026 Digital Heroes. Licensed under the UK Charity Commission Framework.</p>
        </div>
      </div>
    </footer>
  )
}
