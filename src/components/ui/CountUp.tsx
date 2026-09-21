import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { formatGBP } from '@/lib/utils'

interface CountUpProps {
  end: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export function CountUp({ end, duration = 1.2, delay = 0, prefix = '', suffix = '', decimals = 0 }: CountUpProps) {
  const prefersReducedMotion = useReducedMotion()
  const [inView, setInView] = useState(false)
  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
    stiffness: 100,
    damping: 30,
  })

  useEffect(() => {
    if (inView && !prefersReducedMotion) {
      setTimeout(() => {
        springValue.set(end)
      }, delay * 1000)
    }
  }, [inView, end, prefersReducedMotion, springValue, delay])

  const displayValue = useTransform(springValue, (current) => {
    return prefix + formatGBP(current, decimals) + suffix
  })

  if (prefersReducedMotion) {
    return (
      <span className="inline-block">
        {prefix}{formatGBP(end, decimals)}{suffix}
      </span>
    )
  }

  return (
    <motion.span
      className="inline-block"
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, amount: 0.5 }}
    >
      {displayValue}
    </motion.span>
  )
}
