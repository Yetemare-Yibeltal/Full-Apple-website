import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react'
import api from '../lib/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider ({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], subtotal: 0 })
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0 })
      return
    }
    setLoading(true)
    try {
      const res = await api.get('/cart')
      setCart(res.data.cart)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  async function addItem (productId, variantId = null, quantity = 1) {
    const res = await api.post('/cart/items', {
      productId,
      variantId,
      quantity
    })
    setCart(res.data.cart)
  }

  async function updateItem (itemId, quantity) {
    const res = await api.put(`/cart/items/${itemId}`, { quantity })
    setCart(res.data.cart)
  }

  async function removeItem (itemId) {
    const res = await api.delete(`/cart/items/${itemId}`)
    setCart(res.data.cart)
  }

  async function clearCart () {
    await api.delete('/cart')
    setCart({ items: [], subtotal: 0 })
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    cart,
    loading,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart () {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
