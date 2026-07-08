import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import './Nav.css'

export default function Nav () {
  const [sections, setSections] = useState([])
  const [activeSlug, setActiveSlug] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const { itemCount } = useCart()
  const { wishlist } = useWishlist()

  useEffect(() => {
    api.get('/nav').then(res => setSections(res.data.sections))
  }, [])

  const activeSection = sections.find(s => s.slug === activeSlug)

  return (
    <header className='fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-6xl'>
      <nav
        className='glass-panel flex items-center justify-between px-6 py-3'
        onMouseLeave={() => setActiveSlug(null)}
      >
        <Link to='/' className='font-display font-bold text-lg gradient-text'>
          Apple Store
        </Link>

        <ul className='hidden md:flex items-center gap-6'>
          {sections.map(section => (
            <li
              key={section.slug}
              onMouseEnter={() => setActiveSlug(section.slug)}
            >
              <Link
                to={`/${section.slug}`}
                className='text-sm text-text-primary hover:text-glow transition-colors'
              >
                {section.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className='flex items-center gap-4'>
          <Link
            to='/search'
            className='text-text-primary hover:text-glow'
            aria-label='Search'
          >
            🔍
          </Link>
          <Link
            to='/wishlist'
            className='relative text-text-primary hover:text-glow'
            aria-label='Wishlist'
          >
            ♡
            {wishlist.items.length > 0 && (
              <span className='absolute -top-2 -right-2 text-xs bg-prism-rose text-white rounded-full w-4 h-4 flex items-center justify-center'>
                {wishlist.items.length}
              </span>
            )}
          </Link>
          <Link
            to='/cart'
            className='relative text-text-primary hover:text-glow'
            aria-label='Cart'
          >
            🛍
            {itemCount > 0 && (
              <span className='absolute -top-2 -right-2 text-xs bg-prism-aqua text-obsidian rounded-full w-4 h-4 flex items-center justify-center'>
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            to={user ? '/account' : '/login'}
            className='text-sm text-text-primary hover:text-glow'
          >
            {user ? user.name.split(' ')[0] : 'Sign In'}
          </Link>
          <button
            className='md:hidden text-text-primary'
            onClick={() => setMobileOpen(o => !o)}
            aria-label='Menu'
          >
            ☰
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {activeSection && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='glass-panel mt-2 p-6 hidden md:block'
            onMouseEnter={() => setActiveSlug(activeSection.slug)}
            onMouseLeave={() => setActiveSlug(null)}
          >
            <h3 className='font-display font-bold text-lg mb-1'>
              {activeSection.heroHeadline}
            </h3>
            <p className='text-text-muted text-sm mb-4'>
              {activeSection.heroSubtext}
            </p>
            <div className='flex gap-4'>
              {activeSection.links?.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className='text-sm hover:text-glow'
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='glass-panel mt-2 p-4 md:hidden flex flex-col gap-3'
          >
            {sections.map(section => (
              <Link
                key={section.slug}
                to={`/${section.slug}`}
                onClick={() => setMobileOpen(false)}
              >
                {section.title}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
