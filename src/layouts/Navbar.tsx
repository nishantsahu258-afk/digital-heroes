import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

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

  return (
    <nav className={`w-full flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 py-4 md:py-6 relative z-50 transition-all duration-300 ${scrolled ? 'fixed top-0 bg-background/80 backdrop-blur-md border-b shadow-sm' : 'bg-background max-w-7xl mx-auto'}`}>
      <div className={`flex items-center justify-between w-full md:w-auto ${scrolled ? 'max-w-7xl mx-auto w-full' : ''}`}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold font-sans">DH</span>
          </div>
          <span className="font-serif text-xl font-medium text-foreground">Digital Heroes</span>
        </Link>
        <button 
          className="md:hidden p-2 text-foreground"
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

      <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mt-6 md:mt-0 text-sm font-medium text-foreground/80 w-full md:w-auto pb-4 md:pb-0 border-b md:border-b-0 border-foreground/10`}>
        <Link to="/#how-it-works" className="hover:text-primary transition-colors duration-200 w-full md:w-auto" onClick={() => setIsOpen(false)}>How It Works</Link>
        <Link to="/charities" className="hover:text-primary transition-colors duration-200 w-full md:w-auto" onClick={() => setIsOpen(false)}>Charities</Link>
        <Link to="/subscribe" className="hover:text-primary transition-colors duration-200 w-full md:w-auto" onClick={() => setIsOpen(false)}>Pricing</Link>
        {user ? (
          profile?.role === 'admin' ? (
            <Link to="/admin" className="hover:text-primary transition-colors duration-200 w-full md:w-auto text-primary font-semibold" onClick={() => setIsOpen(false)}>Admin Panel</Link>
          ) : (
            <Link to="/dashboard" className="hover:text-primary transition-colors duration-200 w-full md:w-auto" onClick={() => setIsOpen(false)}>Dashboard</Link>
          )
        ) : null}
      </div>

      <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-6 md:mt-0 w-full md:w-auto`}>
        {user ? (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <span className="text-xs text-foreground/60 hidden lg:inline-block truncate max-w-[150px]">
              {profile?.email || user.email}
            </span>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="rounded-full px-5 border-foreground/20 text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors w-full md:w-auto text-sm font-medium"
            >
              Logout
            </Button>
          </div>
        ) : (
          <>
            <Link to="/login" className="text-center text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 py-2 md:py-0" onClick={() => setIsOpen(false)}>
              Login
            </Link>
            <Button asChild className="rounded-full px-6 bg-primary text-white hover:bg-primary/90 w-full md:w-auto">
              <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
