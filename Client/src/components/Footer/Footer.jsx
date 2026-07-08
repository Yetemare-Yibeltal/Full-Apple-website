import { Link } from 'react-router-dom'
import './Footer.css'

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'iPhone', href: '/iphone' },
      { label: 'iPad', href: '/ipad' },
      { label: 'Mac', href: '/mac' },
      { label: 'Watch', href: '/watch' }
    ]
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Order History', href: '/account/orders' },
      { label: 'Wishlist', href: '/wishlist' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/support' },
      { label: 'Contact Us', href: '/support' }
    ]
  }
]

export default function Footer () {
  return (
    <footer className='mt-24 border-t border-white/10'>
      <div className='max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8'>
        <div>
          <p className='gradient-text font-display font-bold text-lg mb-2'>
            Apple Store
          </p>
          <p className='text-text-muted text-sm'>
            Premium tech, thoughtfully designed. Shop iPhone, iPad, Mac, Watch,
            TV, and Music.
          </p>
        </div>

        {columns.map(col => (
          <div key={col.title}>
            <h4 className='font-display font-semibold mb-3'>{col.title}</h4>
            <ul className='flex flex-col gap-2'>
              {col.links.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className='text-sm text-text-muted hover:text-glow transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className='border-t border-white/10 py-6 text-center text-xs text-text-muted'>
        © {new Date().getFullYear()} Apple Store. All rights reserved.
      </div>
    </footer>
  )
}
