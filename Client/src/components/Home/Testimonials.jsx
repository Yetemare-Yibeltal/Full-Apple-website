import { motion } from 'framer-motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import GlassPanel from '../ui/GlassPanel'
import GradientText from '../ui/GradientText'

const testimonials = [
  {
    name: 'Amara T.',
    quote:
      'The checkout experience felt effortless, and my iPhone arrived faster than expected.',
    rating: 5
  },
  {
    name: 'Daniel K.',
    quote:
      'The AI shopping assistant actually helped me pick the right MacBook config. Genuinely useful.',
    rating: 5
  },
  {
    name: 'Sara M.',
    quote:
      'Loved being able to pay with telebirr right at checkout. Smooth from start to finish.',
    rating: 4
  }
]

export default function Testimonials () {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section ref={ref} className='max-w-6xl mx-auto px-6 py-24'>
      <h2 className='text-3xl md:text-4xl font-display font-bold text-center mb-12'>
        Loved by <GradientText>thousands</GradientText>
      </h2>

      <div className='grid md:grid-cols-3 gap-6'>
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <GlassPanel className='p-6 h-full flex flex-col'>
              <div className='text-prism-aqua mb-3'>
                {'★'.repeat(t.rating)}
                {'☆'.repeat(5 - t.rating)}
              </div>
              <p className='text-text-primary flex-1'>"{t.quote}"</p>
              <p className='text-text-muted text-sm mt-4'>— {t.name}</p>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
