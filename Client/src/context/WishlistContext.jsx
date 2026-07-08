import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react'
import api from '../lib/api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider ({ children }) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState({ items: [] })

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist({ items: [] })
      return
    }
    const res = await api.get('/wishlist')
    setWishlist(res.data.wishlist)
  }, [user])

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  async function addToWishlist (productId) {
    const res = await api.post(`/wishlist/${productId}`)
    setWishlist(res.data.wishlist)
  }

  async function removeFromWishlist (productId) {
    const res = await api.delete(`/wishlist/${productId}`)
    setWishlist(res.data.wishlist)
  }

  function isSaved (productId) {
    return wishlist.items.some(item => item.product?._id === productId)
  }

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isSaved,
    refreshWishlist
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist () {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
