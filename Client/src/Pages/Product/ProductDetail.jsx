import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import ProductConfigurator3D from '../../components/Product/ProductConfigurator3D'
import ReviewsSection from '../../components/Product/ReviewsSection'
import GradientText from '../../components/ui/GradientText'
import GlassPanel from '../../components/ui/GlassPanel'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import SEO from '../../components/SEO'

export default function ProductDetail () {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const { user } = useAuth()
  const { addItem } = useCart()
  const { isSaved, addToWishlist, removeFromWishlist } = useWishlist()
  const { showToast } = useToast()

  useEffect(() => {
    setLoading(true)
    api
      .get(`/products/${slug}`)
      .then(res => setProduct(res.data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))

    api
      .get(`/products/${slug}/related`)
      .then(res => setRelated(res.data.products))
      .catch(() => {})
  }, [slug])

  const handleVariantChange = useCallback(
    variant => setSelectedVariant(variant),
    []
  )

  async function handleAddToCart () {
    if (!user) {
      showToast('Please sign in to add items to your cart', 'info')
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await addItem(product._id, selectedVariant?._id || null, quantity)
      showToast('Added to cart', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setAdding(false)
    }
  }

  function toggleWishlist () {
    if (!user) {
      showToast('Sign in to save items', 'info')
      return
    }
    isSaved(product._id)
      ? removeFromWishlist(product._id)
      : addToWishlist(product._id)
  }

  if (loading) {
    return (
      <div className='max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12'>
        <Skeleton height='420px' />
        <div>
          <Skeleton height='2rem' width='60%' className='mb-4' />
          <Skeleton height='1rem' width='80%' className='mb-2' />
          <Skeleton height='1rem' width='40%' />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='max-w-2xl mx-auto px-6 py-24 text-center'>
        <h1 className='text-3xl font-display font-bold mb-4'>
          Product not found
        </h1>
        <Link to='/' className='text-glow'>
          Back to home
        </Link>
      </div>
    )
  }

  const price =
    selectedVariant?.price ?? product.startingPrice ?? product.basePrice
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true

  const specGroups =
    product.specs?.reduce((acc, spec) => {
      acc[spec.group] = acc[spec.group] || []
      acc[spec.group].push(spec)
      return acc
    }, {}) || {}

  return (
    <>
      <SEO title={product.name} description={product.tagline} />

      <section className='max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12'>
        <ProductConfigurator3D
          product={product}
          onVariantChange={handleVariantChange}
        />

        <div>
          <h1 className='text-3xl md:text-4xl font-display font-bold mb-2'>
            {product.name}
          </h1>
          <p className='text-text-muted mb-4'>{product.tagline}</p>
          <p className='font-mono text-2xl text-glow mb-6'>${price}</p>

          {product.highlights?.length > 0 && (
            <ul className='flex flex-col gap-2 mb-6'>
              {product.highlights.map(h => (
                <li
                  key={h}
                  className="text-sm text-text-primary before:content-['✦'] before:text-prism-aqua before:mr-2"
                >
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className='flex items-center gap-4 mb-6'>
            <div className='flex items-center border border-white/10 rounded-full'>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className='px-4 py-2'
              >
                -
              </button>
              <span className='px-2'>{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className='px-4 py-2'
              >
                +
              </button>
            </div>
            <Button
              variant='primary'
              onClick={handleAddToCart}
              disabled={adding || !inStock}
              className='flex-1'
            >
              {!inStock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
            </Button>
            <button
              onClick={toggleWishlist}
              className='text-2xl'
              aria-label='Toggle wishlist'
            >
              {isSaved(product._id) ? '♥' : '♡'}
            </button>
          </div>

          <GlassPanel className='p-4'>
            <p className='text-sm text-text-primary'>{product.description}</p>
          </GlassPanel>
        </div>
      </section>

      {Object.keys(specGroups).length > 0 && (
        <section className='max-w-4xl mx-auto px-6 py-16'>
          <h2 className='text-2xl font-display font-bold mb-8'>
            <GradientText>Tech</GradientText> Specs
          </h2>
          <div className='grid md:grid-cols-2 gap-6'>
            {Object.entries(specGroups).map(([group, specs]) => (
              <GlassPanel key={group} className='p-5'>
                <h3 className='font-display font-semibold mb-3'>{group}</h3>
                <dl className='flex flex-col gap-2'>
                  {specs.map(spec => (
                    <div
                      key={spec.label}
                      className='flex justify-between text-sm'
                    >
                      <dt className='text-text-muted'>{spec.label}</dt>
                      <dd className='text-text-primary text-right'>
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </GlassPanel>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className='max-w-6xl mx-auto px-6 py-16'>
          <h2 className='text-2xl font-display font-bold mb-8'>
            You might also like
          </h2>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {related.map(p => (
              <Link key={p._id} to={`/product/${p.slug}`}>
                <GlassPanel className='p-4 hover:border-white/30 transition-colors'>
                  <h3 className='font-display font-semibold text-sm'>
                    {p.name}
                  </h3>
                  <p className='font-mono text-glow text-sm'>
                    ${p.startingPrice}
                  </p>
                </GlassPanel>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ReviewsSection productId={product._id} />
    </>
  )
}
