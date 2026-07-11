import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import GlassPanel from '../../components/ui/GlassPanel'
import GradientText from '../../components/ui/GradientText'
import SEO from '../../components/SEO'

const statusColors = {
  pending: 'text-text-muted',
  processing: 'text-prism-violet',
  shipped: 'text-prism-aqua',
  delivered: 'text-green-400',
  cancelled: 'text-prism-rose'
}

export default function OrderHistory () {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(res => setOrders(res.data.orders))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SEO title='Order History' />
      <section className='max-w-3xl mx-auto px-6 py-12'>
        <h1 className='text-3xl font-display font-bold mb-8'>
          Order <GradientText>History</GradientText>
        </h1>

        {loading && <p className='text-text-muted'>Loading...</p>}
        {!loading && orders.length === 0 && (
          <p className='text-text-muted'>No orders yet.</p>
        )}

        <div className='flex flex-col gap-4'>
          {orders.map(order => (
            <Link key={order._id} to={`/order-confirmation/${order._id}`}>
              <GlassPanel className='p-5 hover:border-white/30 transition-colors'>
                <div className='flex justify-between items-center mb-2'>
                  <p className='font-mono text-sm text-text-muted'>
                    #{order._id.slice(-8)}
                  </p>
                  <span
                    className={`text-sm font-semibold capitalize ${
                      statusColors[order.orderStatus]
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
                <p className='text-sm text-text-muted mb-2'>
                  {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                  {order.items.length} item(s)
                </p>
                <p className='font-mono text-glow'>
                  ${order.pricing.total.toFixed(2)}
                </p>
              </GlassPanel>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
