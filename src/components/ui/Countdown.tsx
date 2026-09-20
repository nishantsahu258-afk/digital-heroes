import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

interface CountdownProps {
  targetDate?: string // ISO string
}

function AnimatedDigit({ value }: { value: number }) {
  const prefersReducedMotion = useReducedMotion()
  const displayValue = value.toString().padStart(2, '0')

  if (prefersReducedMotion) {
    return <span>{displayValue}</span>
  }

  return (
    <div className="relative inline-block w-full overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="inline-block"
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 4, hours: 18, minutes: 32 })

  useEffect(() => {
    if (!targetDate) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = new Date(targetDate).getTime() - now

      if (distance < 0) {
        clearInterval(interval)
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      })
    }, 60000) // Update every minute to save renders

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="flex gap-4 mb-10">
      <div className="flex-1 text-center">
        <div className="text-4xl font-serif text-foreground bg-foreground/5 rounded-lg py-4 mb-2 flex justify-center">
          <AnimatedDigit value={timeLeft.days} />
        </div>
        <div className="text-[10px] uppercase font-bold text-foreground/40">Days</div>
      </div>
      <div className="flex-1 text-center">
        <div className="text-4xl font-serif text-foreground bg-foreground/5 rounded-lg py-4 mb-2 flex justify-center">
          <AnimatedDigit value={timeLeft.hours} />
        </div>
        <div className="text-[10px] uppercase font-bold text-foreground/40">Hours</div>
      </div>
      <div className="flex-1 text-center">
        <div className="text-4xl font-serif text-foreground bg-foreground/5 rounded-lg py-4 mb-2 flex justify-center">
          <AnimatedDigit value={timeLeft.minutes} />
        </div>
        <div className="text-[10px] uppercase font-bold text-foreground/40">Mins</div>
      </div>
    </div>
  )
}
