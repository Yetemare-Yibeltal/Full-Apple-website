import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor () {
  const [isTouch] = useState(
    () => window.matchMedia('(pointer: coarse)').matches
  )
  const [isHovering, setIsHovering] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  useEffect(() => {
    if (isTouch) return

    function handleMove (e) {
      x.set(e.clientX - 10)
      y.set(e.clientY - 10)
    }

    function handleOver (e) {
      setIsHovering(Boolean(e.target.closest('button, a, [data-cursor-hover]')))
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseover', handleOver)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseover', handleOver)
    }
  }, [isTouch, x, y])

  if (isTouch) return null

  return (
    <motion.div
      className='fixed top-0 left-0 rounded-full pointer-events-none z-[100] mix-blend-difference bg-glow'
      style={{ x: springX, y: springY }}
      animate={{ width: isHovering ? 36 : 20, height: isHovering ? 36 : 20 }}
      transition={{ duration: 0.2 }}
    />
  )
}
