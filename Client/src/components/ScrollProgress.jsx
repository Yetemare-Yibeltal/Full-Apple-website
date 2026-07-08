import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress () {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 })

  return (
    <motion.div
      className='fixed top-0 left-0 right-0 h-[3px] bg-prism-gradient origin-left z-[100]'
      style={{ scaleX }}
    />
  )
}
