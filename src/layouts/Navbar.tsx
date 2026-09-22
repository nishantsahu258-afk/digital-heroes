import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface NavbarProps {
  dark?: boolean
}

export function Navbar({ dark }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isDark = dark ?? location.pathname.startsWith('/admin')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    await signOut()
    navigate('/login', { replace: true })
  }

  const isCurrentRoute = (path: string) => {
    if (path === '/#how-it-works') {
      return location.pathname === '/' && location.hash === '#how-it-works'
    }
    if (path === '/') {
      return location.pathname === '/' && !location.hash
    }
    if (path === '/subscribe') {
      return location.pathname === '/subscribe' || location.pathname === '/subscription'
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/scores'
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const getLinkClass = (path: string) => {
    const active = isCurrentRoute(path)
    if (isDark) {
      return active 
        ? 'text-[#5CD296] font-bold border-b-2 border-[#5CD296] pb-1' 
        : 'text-white/70 hover:text-white transition-colors duration-200'
    }
    return active 
      ? 'text-[#2D5A43] font-bold border-b-2 border-[#2D5A43] pb-1' 
      : 'text-foreground/70 hover:text-[#2D5A43] transition-colors duration-200'
  }

  const headerBg = isDark
    ? (scrolled ? 'fixed top-0 bg-[#0B132B]/95 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-[#0B132B] border-b border-white/10')
    : (scrolled ? 'fixed top-0 bg-background/90 backdrop-blur-md border-b shadow-sm' : 'bg-background')

  const textColor = isDark ? 'text-white' : 'text-foreground'

  return (
    <header className={`w-full relative z-50 transition-all duration-300 ${headerBg}`}>
      <nav className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2D5A43] flex items-center justify-center">
              <span className="text-white text-xs font-bold font-sans">DH</span>
            </div>
            <span className={`font-serif text-xl font-medium ${textColor}`}>Digital Heroes</span>
          </Link>
          <button 
            className={`md:hidden p-2 ${textColor}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? (
                <path d="M18 6L6 18M6 6l12 12"/>
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18"/>
              )}
            </svg>
          </button>
        </div>

        <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mt-6 md:mt-0 text-sm w-full md:w-auto pb-4 md:pb-0 border-b md:border-b-0 ${isDark ? 'border-white/10' : 'border-foreground/10'}`}>
          <Link to="/#how-it-works" className={`${getLinkClass('/#how-it-works')} w-full md:w-auto`} onClick={() => setIsOpen(false)}>How It Works</Link>
          <Link to="/charities" className={`${getLinkClass('/charities')} w-full md:w-auto`} onClick={() => setIsOpen(false)}>Charities</Link>
          <Link to="/draws" className={`${getLinkClass('/draws')} w-full md:w-auto`} onClick={() => setIsOpen(false)}>Draw Results</Link>
          <Link to="/subscribe" className={`${getLinkClass('/subscribe')} w-full md:w-auto`} onClick={() => setIsOpen(false)}>Pricing</Link>
          {user && (
            <Link to="/dashboard" className={`${getLinkClass('/dashboard')} w-full md:w-auto`} onClick={() => setIsOpen(false)}>Dashboard</Link>
          )}
          {user && profile?.role === 'admin' && (
            <Link to="/admin" className={`${getLinkClass('/admin')} w-full md:w-auto`} onClick={() => setIsOpen(false)}>Admin Console</Link>
          )}
        </div>

        <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-6 md:mt-0 w-full md:w-auto`}>
          {user ? (
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
              <span className={`text-xs hidden lg:inline-block truncate max-w-[150px] ${isDark ? 'text-white/60' : 'text-foreground/60'}`}>
                {profile?.email || user.email}
              </span>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className={`rounded-full px-5 transition-colors w-full md:w-auto text-sm font-medium ${
                  isDark 
                    ? 'border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent' 
                    : 'border-foreground/20 text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                }`}
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login" className={`text-center text-sm font-medium ${getLinkClass('/login')} py-2 md:py-0`} onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Button asChild className="rounded-full px-6 bg-[#2D5A43] text-white hover:bg-[#234735] w-full md:w-auto">
                <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
