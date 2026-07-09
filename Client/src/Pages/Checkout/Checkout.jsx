import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import GlassPanel from '../../components/ui/GlassPanel'
import Button from '../../components/ui/Button'
import GradientText from '../../components/ui/GradientText'
import SEO from '../../components/SEO'

const paymentMethods = [
  { value: 'chapa', label: 'Chapa (telebirr, CBE Birr, Amole, cards)' },
  { value: 'stripe', label: 'International Card (Stripe)' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery' }
]

export default function Checkout () {
  const { cart, clearCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    country: '',
    postalCode: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('chapa')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    api
      .get('/users/addresses')
      .then(res => {
        const defaultAddr =
          res.data.addresses.find(a => a.isDefault) || res.data.addresses[0]
        if (defaultAddr) setAddress(defaultAddr)
      })
      .catch(() => {})
  }, [])

  async function handleValidateCoupon () {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        subtotal: cart.subtotal
      })
      setDiscount(res.data.estimatedDiscount)
      showToast(`Coupon applied: -$${res.data.estimatedDiscount}`, 'success')
    } catch (err) {
      setDiscount(0)
      showToast(err.message, 'error')
    } finally {
      setValidatingCoupon(false)
    }
  }

  async function handlePlaceOrder (e) {
    e.preventDefault()
    setPlacing(true)
    try {
      const orderRes = await api.post('/orders', {
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined
      })
      const order = orderRes.data.order

      if (paymentMethod === 'cash_on_delivery') {
        await clearCart()
        navigate(`/order-confirmation/${order._id}`)
        return
      }

      const initRes = await api.post(`/payments/${paymentMethod}/initialize`, {
        orderId: order._id
      })
      window.location.href = initRes.data.checkoutUrl
    } catch (err) {
      showToast(err.message, 'error')
      setPlacing(false)
    }
  }

  const total = Math.max(0, (cart.subtotal || 0) - discount)

  return (
    <>
      <SEO title='Checkout' />
      <section className='max-w-4xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10'>
        <form onSubmit={handlePlaceOrder} className='flex flex-col gap-6'>
          <h1 className='text-2xl font-display font-bold'>
            <GradientText>Checkout</GradientText>
          </h1>

          <GlassPanel className='p-6 flex flex-col gap-3'>
            <h2 className='font-display font-semibold mb-2'>
              Shipping Address
            </h2>
            {[
              'fullName',
              'phone',
              'line1',
              'line2',
              'city',
              'region',
              'country',
              'postalCode'
            ].map(field => (
              <input
                key={field}
                required={[
                  'fullName',
                  'phone',
                  'line1',
                  'city',
                  'country'
                ].includes(field)}
                value={address[field] || ''}
                onChange={e =>
                  setAddress(a => ({ ...a, [field]: e.target.value }))
                }
                placeholder={field}
                className='bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-glow'
              />
            ))}
          </GlassPanel>

          <GlassPanel className='p-6 flex flex-col gap-3'>
            <h2 className='font-display font-semibold mb-2'>Payment Method</h2>
            {paymentMethods.map(pm => (
              <label key={pm.value} className='flex items-center gap-3 text-sm'>
                <input
                  type='radio'
                  name='paymentMethod'
                  checked={paymentMethod === pm.value}
                  onChange={() => setPaymentMethod(pm.value)}
                />
                {pm.label}
              </label>
            ))}
          </GlassPanel>

          <Button type='submit' variant='primary' disabled={placing}>
            {placing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
          </Button>
        </form>

        <div>
          <GlassPanel className='p-6'>
            <h2 className='font-display font-semibold mb-4'>Order Summary</h2>
            {cart.items.map(item => (
              <div key={item._id} className='flex justify-between text-sm mb-2'>
                <span>
                  {item.product?.name} × {item.quantity}
                </span>
                <span className='font-mono'>
                  ${(item.priceAtAdd * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className='flex gap-2 my-4'>
              <input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder='Coupon code'
                className='flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none'
              />
              <button
                type='button'
                onClick={handleValidateCoupon}
                disabled={validatingCoupon}
                className='px-4 rounded-lg bg-white/10 text-sm'
              >
                Apply
              </button>
            </div>

            <div className='border-t border-white/10 pt-4 flex flex-col gap-1'>
              <div className='flex justify-between text-sm'>
                <span>Subtotal</span>
                <span className='font-mono'>${cart.subtotal?.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className='flex justify-between text-sm text-prism-aqua'>
                  <span>Discount</span>
                  <span className='font-mono'>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className='flex justify-between font-semibold text-lg mt-2'>
                <span>Total</span>
                <span className='font-mono text-glow'>${total.toFixed(2)}</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </section>
    </>
  )
}
