import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import GlassPanel from '../ui/GlassPanel'
import Button from '../ui/Button'

function Stars ({ value, onChange }) {
  return (
    <div className='flex gap-1 text-2xl'>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type='button'
          onClick={() => onChange?.(n)}
          className={n <= value ? 'text-prism-aqua' : 'text-white/20'}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ReviewsSection ({ productId }) {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    api
      .get(`/reviews/product/${productId}`)
      .then(res => setReviews(res.data.reviews))
  }, [productId])

  async function handleSubmit (e) {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await api.post('/reviews', { product: productId, rating, comment })
      showToast('Review submitted for approval', 'success')
      setComment('')
      setRating(5)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function markHelpful (reviewId) {
    const res = await api.post(`/reviews/${reviewId}/helpful`)
    setReviews(prev =>
      prev.map(r => (r._id === reviewId ? res.data.review : r))
    )
  }

  return (
    <section className='max-w-3xl mx-auto px-6 py-16'>
      <h2 className='text-2xl font-display font-bold mb-8'>Reviews</h2>

      {user && (
        <GlassPanel className='p-6 mb-8'>
          <form onSubmit={handleSubmit}>
            <Stars value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder='Share your experience with this product...'
              rows={3}
              className='w-full mt-4 bg-white/5 border border-white/10 rounded-lg p-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-glow'
            />
            <Button
              type='submit'
              variant='primary'
              className='mt-3'
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </GlassPanel>
      )}

      <div className='flex flex-col gap-4'>
        {reviews.length === 0 && (
          <p className='text-text-muted'>No reviews yet. Be the first!</p>
        )}
        {reviews.map(review => (
          <GlassPanel key={review._id} className='p-5'>
            <div className='flex items-center justify-between mb-2'>
              <p className='font-semibold'>{review.userName}</p>
              {review.verifiedPurchase && (
                <span className='text-xs text-prism-aqua'>
                  Verified Purchase
                </span>
              )}
            </div>
            <div className='text-prism-aqua mb-2'>
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </div>
            <p className='text-text-primary mb-3'>{review.comment}</p>
            <button
              onClick={() => markHelpful(review._id)}
              className='text-xs text-text-muted hover:text-glow'
            >
              Helpful ({review.helpfulCount})
            </button>
          </GlassPanel>
        ))}
      </div>
    </section>
  )
}
