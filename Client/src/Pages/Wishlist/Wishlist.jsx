import { Link } from 'react-router-dom'
import { useWishlist } from '../../context/WishlistContext'
import GlassPanel from '../../components/ui/GlassPanel'
import Button from '../../components/ui/Button'
import GradientText from '../../components/ui/GradientText'
import SEO from '../../components/SEO'

export default function Wishlist () {
  const { wishlist, removeFromWishlist } = useWishlist()

  if (!wishlist.items || wishlist.items.length === 0) {
    return (
      <div className='max-w-2xl mx-auto px-6 py-24 text-center'>
        <SEO title='Wishlist' />
        <h1 className='text-3xl font-display font-bold mb-4'>
          Your wishlist is empty
        </h1>
        <p className='text-text-muted mb-6'>
          Save products you love for later.
        </p>
        <Link to='/'>
          <Button variant='primary'>Browse Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <SEO title='Wishlist' />
      <section className='max-w-6xl mx-auto px-6 py-12'>
        <h1 className='text-3xl font-display font-bold mb-8'>
          Your <GradientText>Wishlist</GradientText>
        </h1>

        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {wishlist.items.map(item => (
            <GlassPanel key={item.product?._id} className='p-4 relative'>
              <button
                onClick={() => removeFromWishlist(item.product._id)}
                className='absolute top-4 right-4 text-lg text-prism-rose'
                aria-label='Remove from wishlist'
              >
                ♥
              </button>
              <Link to={`/product/${item.product?.slug}`}>
                <div className='h-44 rounded-lg bg-white/5 mb-4 flex items-center justify-center overflow-hidden'>
                  {item.product?.media?.[0]?.url ? (
                    <img
                      src={item.product.media[0].url}
                      alt={item.product.name}
                      className='object-contain h-full'
                    />
                  ) : (
                    <span className='text-text-muted text-sm'>No image</span>
                  )}
                </div>
                <h3 className='font-display font-semibold'>
                  {item.product?.name}
                </h3>
                <p className='font-mono text-glow'>
                  ${item.product?.startingPrice}
                </p>
              </Link>
            </GlassPanel>
          ))}
        </div>
      </section>
    </>
  )
}
