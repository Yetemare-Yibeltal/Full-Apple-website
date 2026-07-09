import { useState } from 'react'
import GlassPanel from '../ui/GlassPanel'
import GradientText from '../ui/GradientText'
import Button from '../ui/Button'
import { useToast } from '../../context/ToastContext'

export default function Newsletter () {
  const [email, setEmail] = useState('')
  const { showToast } = useToast()

  function handleSubmit (e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast('Enter a valid email address.', 'error')
      return
    }
    showToast("You're subscribed! Watch for updates.", 'success')
    setEmail('')
  }

  return (
    <section className='max-w-4xl mx-auto px-6 py-24'>
      <GlassPanel className='p-10 text-center'>
        <h2 className='text-2xl md:text-3xl font-display font-bold mb-3'>
          Stay in the <GradientText>loop</GradientText>
        </h2>
        <p className='text-text-muted mb-6'>
          Get notified about new drops, restocks, and exclusive offers.
        </p>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col sm:flex-row gap-3 justify-center'
        >
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='you@example.com'
            className='bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-glow w-full sm:w-72'
          />
          <Button type='submit' variant='primary'>
            Subscribe
          </Button>
        </form>
      </GlassPanel>
    </section>
  )
}
