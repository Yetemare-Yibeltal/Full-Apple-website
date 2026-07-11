import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import GlassPanel from '../../components/ui/GlassPanel'
import GradientText from '../../components/ui/GradientText'
import SEO from '../../components/SEO'

const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'Most orders arrive within 3-5 business days after payment is confirmed.'
  },
  {
    q: 'What payment methods are supported?',
    a: 'Chapa (telebirr, CBE Birr, Amole, cards), Stripe for international cards, and cash on delivery.'
  },
  {
    q: 'Can I return a product?',
    a: 'Yes, unopened products can be returned within 14 days of delivery.'
  }
]

function getSessionId () {
  let id = localStorage.getItem('chat_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('chat_session_id', id)
  }
  return id
}

export default function Support () {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const sessionId = useRef(getSessionId())

  useEffect(() => {
    api
      .get(`/ai/chat/${sessionId.current}`)
      .then(res => setMessages(res.data.messages || []))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend (e) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)

    try {
      const res = await api.post('/ai/chat', {
        sessionId: sessionId.current,
        message: input
      })
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.reply,
          recommendedProducts: res.data.recommendedProducts
        }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.'
        }
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <SEO
        title='Support'
        description='Get help and chat with our AI shopping assistant.'
      />
      <section className='max-w-3xl mx-auto px-6 py-12'>
        <h1 className='text-3xl md:text-4xl font-display font-bold mb-8 text-center'>
          <GradientText>Support</GradientText>
        </h1>

        <div className='flex flex-col gap-4 mb-12'>
          {faqs.map(faq => (
            <GlassPanel key={faq.q} className='p-5'>
              <p className='font-display font-semibold mb-1'>{faq.q}</p>
              <p className='text-text-muted text-sm'>{faq.a}</p>
            </GlassPanel>
          ))}
        </div>

        <GlassPanel className='p-0 overflow-hidden'>
          <div className='p-4 border-b border-white/10'>
            <p className='font-display font-semibold'>AI Shopping Assistant</p>
          </div>

          <div className='h-96 overflow-y-auto p-4 flex flex-col gap-3'>
            {messages.length === 0 && (
              <p className='text-text-muted text-sm text-center my-auto'>
                Ask me anything about our products.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    m.role === 'user'
                      ? 'bg-prism-gradient text-obsidian'
                      : 'bg-white/10 text-text-primary'
                  }`}
                >
                  {m.content}
                  {m.recommendedProducts?.length > 0 && (
                    <div className='mt-2 flex flex-col gap-1'>
                      {m.recommendedProducts.map(p => (
                        <Link
                          key={p._id}
                          to={`/product/${p.slug}`}
                          className='underline text-xs'
                        >
                          {p.name} - ${p.basePrice}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className='p-4 border-t border-white/10 flex gap-2'
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Type a message...'
              className='flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none'
            />
            <button
              type='submit'
              disabled={sending}
              className='px-4 py-2 rounded-full bg-prism-gradient text-obsidian text-sm font-semibold disabled:opacity-50'
            >
              {sending ? '...' : 'Send'}
            </button>
          </form>
        </GlassPanel>
      </section>
    </>
  )
}
