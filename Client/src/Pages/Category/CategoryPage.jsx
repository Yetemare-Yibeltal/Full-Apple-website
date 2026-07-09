import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'
import GlassPanel from '../../components/ui/GlassPanel'
import GradientText from '../../components/ui/GradientText'
import Skeleton from '../../components/ui/Skeleton'
import SEO from '../../components/SEO'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const sortOptions = [
  { value: '', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'bestseller', label: 'Bestsellers' }
]

export default function CategoryPage () {
  const { category } = useParams()
  const [section, setSection] = useState(null)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [sort, setSort] = useState('')
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const { isSaved, addToWishlist, removeFromWishlist } = useWishlist()
  const { showToast } = useToast()

  useEffect(() => {
    api
      .get(`/nav/${category}`)
      .then(res => setSection(res.data.section))
      .catch(() => setSection(null))
  }, [category])

  useEffect(() => {
    setLoading(true)
    api
      .get('/products', { params: { category, sort, page: 1, limit: 12 } })
      .then(res => {
        setProducts(res.data.products)
        setPagination(res.data.pagination)
      })
      .finally(() => setLoading(false))
  }, [category, sort])

  function loadPage (page) {
    setLoading(true)
    api
      .get('/products', { params: { category, sort, page, limit: 12 } })
      .then(res => {
        setProducts(res.data.products)
        setPagination(res.data.pagination)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .finally(() => setLoading(false))
  }

  function toggleWishlist (e, productId) {
    e.preventDefault()
    if (!user) {
      showToast('Sign in to save items', 'info')
      return
    }
    isSaved(productId)
      ? removeFromWishlist(productId)
      : addToWishlist(productId)
  }

  const title = section?.title || category

  return (
    <>
      <SEO title={title} description={section?.heroSubtext} />

      <section className='max-w-6xl mx-auto px-6 py-12 text-center'>
        <h1 className='text-4xl md:text-6xl font-display font-extrabold mb-3'>
          <GradientText>{title}</GradientText>
        </h1>
        {section?.heroSubtext && (
          <p className='text-text-muted max-w-xl mx-auto'>
            {section.heroSubtext}
          </p>
        )}
      </section>

      <section className='max-w-6xl mx-auto px-6 pb-24'>
        <div className='flex justify-end mb-6'>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className='bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-text-primary focus:outline-none'
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value} className='bg-obsidian'>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <GlassPanel key={i} className='p-4'>
                  <Skeleton height='180px' className='mb-4' />
                  <Skeleton height='1rem' width='60%' className='mb-2' />
                  <Skeleton height='1rem' width='40%' />
                </GlassPanel>
              ))
            : products.map(product => (
                <Link key={product._id} to={`/product/${product.slug}`}>
                  <GlassPanel className='p-4 h-full relative hover:border-white/30 transition-colors'>
                    <button
                      onClick={e => toggleWishlist(e, product._id)}
                      className='absolute top-4 right-4 z-10 text-lg'
                      aria-label='Toggle wishlist'
                    >
                      {isSaved(product._id) ? '♥' : '♡'}
                    </button>
                    <div className='h-44 rounded-lg bg-white/5 mb-4 flex items-center justify-center overflow-hidden'>
                      {product.media?.[0]?.url ? (
                        <img
                          src={product.media[0].url}
                          alt={product.name}
                          className='object-contain h-full'
                        />
                      ) : (
                        <span className='text-text-muted text-sm'>
                          No image
                        </span>
                      )}
                    </div>
                    <h3 className='font-display font-semibold'>
                      {product.name}
                    </h3>
                    <p className='text-text-muted text-sm mb-2'>
                      {product.tagline}
                    </p>
                    <p className='font-mono text-glow'>
                      From ${product.startingPrice}
                    </p>
                  </GlassPanel>
                </Link>
              ))}
        </div>

        {!loading && products.length === 0 && (
          <p className='text-center text-text-muted py-16'>
            No products found in this category yet.
          </p>
        )}

        {pagination.totalPages > 1 && (
          <div className='flex justify-center gap-2 mt-12'>
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => loadPage(i + 1)}
                className={`w-9 h-9 rounded-full text-sm ${
                  pagination.page === i + 1
                    ? 'bg-prism-gradient text-obsidian'
                    : 'glass-panel text-text-primary'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
