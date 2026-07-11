import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassPanel from '../ui/GlassPanel'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function ProductCard ({ product }) {
  const { user } = useAuth()
  const { isSaved, addToWishlist, removeFromWishlist } = useWishlist()
  const { showToast } = useToast()
  const saved = isSaved(product._id)

  async function toggleWishlist (e) {
    e.preventDefault()
    if (!user) {
      showToast('Sign in to save items to your wishlist.', 'info')
      return
    }
    if (saved) {
      await removeFromWishlist(product._id)
    } else {
      await addToWishlist(product._id)
      showToast('Saved to wishlist.', 'success')
    }
  }

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
      <Link to={`/${product.category}/${product.slug}`}>
        <GlassPanel className='p-5 relative group'>
          <button
            onClick={toggleWishlist}
            className='absolute top-4 right-4 text-lg z-10'
            aria-label='Toggle wishlist'
          >
            {saved ? '♥' : '♡'}
          </button>

          <div className='aspect-square rounded-xl bg-white/5 mb-4 flex items-center justify-center overflow-hidden'>
            {product.media?.[0]?.url ? (
              <img
                src={product.media[0].url}
                alt={product.name}
                className='w-full h-full object-contain group-hover:scale-105 transition-transform'
              />
            ) : (
              <span className='text-text-muted text-sm'>No image</span>
            )}
          </div>

          <h3 className='font-display font-semibold'>{product.name}</h3>
          <p className='text-text-muted text-sm mb-2'>{product.tagline}</p>
          <p className='font-mono text-sm'>
            From ${product.startingPrice ?? product.basePrice}
          </p>
        </GlassPanel>
      </Link>
    </motion.div>
  )
}
