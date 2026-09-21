import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

import AppLayout from '../App'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Subscription from '../pages/Subscription'
import Charities from '../pages/Charities'
import CharityDetail from '../pages/CharityDetail'
import Dashboard from '../pages/Dashboard'
import Scores from '../pages/Scores'
import Draws from '../pages/Draws'
import WinnerVerification from '../pages/WinnerVerification'
import AdminDashboard from '../pages/AdminDashboard'
import { ProtectedRoute } from './ProtectedRoute'

export function AnimatedRoutes() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const prefersReducedMotion = useReducedMotion()
  
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // If not mobile or prefers reduced motion, disable the slide
  const disableAnimation = !isMobile || prefersReducedMotion

  const variants = {
    initial: (direction: number) => ({
      x: disableAnimation ? 0 : (direction > 0 ? '100%' : '-100%'),
      opacity: disableAnimation ? 1 : 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    },
    exit: (direction: number) => ({
      x: disableAnimation ? 0 : (direction > 0 ? '-100%' : '100%'),
      opacity: disableAnimation ? 1 : 0,
      transition: { duration: 0.3, ease: 'easeIn' as const }
    })
  }

  // PUSH = 1 (forward), POP = -1 (back)
  const direction = navigationType === 'POP' ? -1 : 1

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <AppLayout />
          </motion.div>
        }>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="subscribe" element={<Subscription />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="charities" element={<Charities />} />
          <Route path="charities/:id" element={<CharityDetail />} />
          <Route path="dashboard" element={
            <ProtectedRoute requiredRole="user">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="scores" element={
            <ProtectedRoute requiredRole="user">
              <Scores />
            </ProtectedRoute>
          } />
          <Route path="draws" element={<Draws />} />
          <Route path="winner-verification" element={<WinnerVerification />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}
