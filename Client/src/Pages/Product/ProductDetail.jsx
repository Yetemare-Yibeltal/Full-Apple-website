import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { OrbitControls } from '@react-three/drei'
import api from '../../lib/api'
import Scene from '../../components/3d/Scene'
import LightRig from '../../components/3d/LightRig'
import ProductModel from '../../components/3d/ProductModel'
import GradientText from '../../components/ui/GradientText'
import GlassPanel from '../../components/ui/GlassPanel'
import Button from '../../components/ui/Button'
import Testimonials from '../../components/Home/Testimonials'
import Newsletter from '../../components/Home/Newsletter'
import SEO from '../../components/SEO'
import Skeleton from '../../components/ui/Skeleton'
import './Home.css'

const categories = [
  { label: 'iPhone', slug: 'iphone' },
  { label: 'iPad', slug: 'ipad' },
  { label: 'Mac', slug: 'mac' },
  { label: 'Watch', slug: 'watch' },
  { label: 'TV', slug: 'tv' },
  { label: 'Music', slug: 'music' }
]

export default function Home () {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/products', { params: { featured: true, limit: 6 } })
      .then(res => setFeatured(res.data.products))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SEO
        title='Home'
        description='Shop iPhone, iPad, Mac, Watch, TV, and Music with an AI-powered shopping assistant.'
      />

      <section className='relative h-[85vh] flex items-center'>
        <div className='absolute inset-0'>
          <Scene cameraPosition={[0, 0, 6]}>
            <LightRig />
            <ProductModel color='#7C6CF6' />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 1.8}
              minPolarAngle={Math.PI / 3}
            />
          </Scene>
        </div>

        <div className='relative z-10 max-w-3xl mx-auto px-6 text-center pointer-events-none'>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-5xl md:text-7xl font-display font-extrabold mb-4'
          >
            <GradientText>Titanium.</GradientText> Reimagined.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className='text-text-muted text-lg mb-8'
          >
            Drag to explore. The most powerful lineup, all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='pointer-events-auto flex justify-center gap-4'
          >
            <Link to='/iphone'>
              <Button variant='primary'>Shop Now</Button>
            </Link>
            <Link to='/search'>
              <Button variant='glass'>Ask AI Assistant</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className='max-w-6xl mx-auto px-6 py-16'>
        <div className='grid grid-cols-3 md:grid-cols-6 gap-4'>
          {categories.map(cat => (
            <Link key={cat.slug} to={`/${cat.slug}`}>
              <GlassPanel className='p-4 text-center hover:border-white/30 transition-colors'>
                <p className='font-display font-semibold text-sm'>
                  {cat.label}
                </p>
              </GlassPanel>
            </Link>
          ))}
        </div>
      </section>

      <section className='max-w-6xl mx-auto px-6 py-16'>
        <h2 className='text-3xl md:text-4xl font-display font-bold mb-10'>
          <GradientText>Featured</GradientText> products
        </h2>

        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <GlassPanel key={i} className='p-4'>
                  <Skeleton height='180px' className='mb-4' />
                  <Skeleton height='1rem' width='60%' className='mb-2' />
                  <Skeleton height='1rem' width='40%' />
                </GlassPanel>
              ))
            : featured.map(product => (
                <Link key={product._id} to={`/product/${product.slug}`}>
                  <GlassPanel className='p-4 h-full hover:border-white/30 transition-colors'>
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
      </section>

      <Testimonials />
      <Newsletter />
    </>
  )
}
