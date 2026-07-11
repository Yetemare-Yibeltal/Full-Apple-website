import { useState } from 'react'
import api from '../../lib/api'
import { useDebounce } from '../../hooks/useDebounce'
import ProductCard from '../../components/Product/ProductCard'
import GlassPanel from '../../components/ui/GlassPanel'
import GradientText from '../../components/ui/GradientText'
import Skeleton from '../../components/ui/Skeleton'
import SEO from '../../components/SEO'

export default function Search () {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [filters, setFilters] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch (e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/ai/search', { query })
      setResults(res.data.products)
      setFilters(res.data.interpretedFilters)
    } catch (err) {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO
        title='Search'
        description='Search products using natural language, powered by AI.'
      />
      <section className='max-w-4xl mx-auto px-6 py-12'>
        <h1 className='text-3xl md:text-4xl font-display font-bold mb-2 text-center'>
          Ask our <GradientText>AI</GradientText>
        </h1>
        <p className='text-text-muted text-center mb-8'>
          Try "phone with the best camera under $1000" or "lightweight laptop
          for video editing"
        </p>

        <form onSubmit={handleSearch} className='flex gap-3 mb-8'>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='What are you looking for?'
            className='flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-glow'
          />
          <button
            type='submit'
            className='px-6 py-3 rounded-full bg-prism-gradient text-obsidian font-semibold'
          >
            Search
          </button>
        </form>

        {filters && (
          <div className='flex flex-wrap gap-2 mb-8 justify-center'>
            {filters.category && (
              <span className='text-xs px-3 py-1 rounded-full glass-panel'>
                Category: {filters.category}
              </span>
            )}
            {filters.minPrice && (
              <span className='text-xs px-3 py-1 rounded-full glass-panel'>
                Min: ${filters.minPrice}
              </span>
            )}
            {filters.maxPrice && (
              <span className='text-xs px-3 py-1 rounded-full glass-panel'>
                Max: ${filters.maxPrice}
              </span>
            )}
            {filters.keywords && (
              <span className='text-xs px-3 py-1 rounded-full glass-panel'>
                "{filters.keywords}"
              </span>
            )}
          </div>
        )}

        {loading && (
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassPanel key={i} className='p-4'>
                <Skeleton height='180px' className='mb-4' />
                <Skeleton height='1rem' width='60%' />
              </GlassPanel>
            ))}
          </div>
        )}

        {!loading && results && (
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {results.length === 0 ? (
              <p className='text-text-muted col-span-full text-center py-12'>
                No matching products found. Try rephrasing your search.
              </p>
            ) : (
              results.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        )}
      </section>
    </>
  )
}
