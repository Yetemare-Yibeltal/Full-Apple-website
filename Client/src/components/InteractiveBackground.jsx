import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

function Blob ({ color, size, baseX, baseY, mouseX, mouseY, parallax }) {
  const x = useTransform(mouseX, v => baseX + v * parallax)
  const y = useTransform(mouseY, v => baseY + v * parallax)

  return (
    <motion.div
      className='absolute rounded-full blur-[100px] opacity-30'
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        x,
        y
      }}
    />
  )
}

export default function InteractiveBackground () {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    function handleMove (e) {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      mouseX.set(nx * 100)
      mouseY.set(ny * 100)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [mouseX, mouseY])

  return (
    <div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
      <Blob
        color='#7C6CF6'
        size={500}
        baseX={-100}
        baseY={-100}
        mouseX={springX}
        mouseY={springY}
        parallax={0.6}
      />
      <Blob
        color='#4FD3C4'
        size={450}
        baseX={window.innerWidth - 400}
        baseY={100}
        mouseX={springX}
        mouseY={springY}
        parallax={-0.4}
      />
      <Blob
        color='#FF7AC6'
        size={400}
        baseX={300}
        baseY={window.innerHeight - 300}
        mouseX={springX}
        mouseY={springY}
        parallax={0.3}
      />
    </div>
  )
}
