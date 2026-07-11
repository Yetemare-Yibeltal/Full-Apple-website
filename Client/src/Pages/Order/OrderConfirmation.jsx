import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import GlassPanel from '../../components/ui/GlassPanel';
import GradientText from '../../components/ui/GradientText';
import Button from '../../components/ui/Button';
import SEO from '../../components/SEO';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const txRef = searchParams.get('tx_ref');
      if (txRef) {
        try {
          await api.get(`/payments/chapa/verify/${txRef}`);
        } catch {
          // verification failure still falls through to show the order as-is
        }
      }

      api
        .get(`/orders/${orderId}`)
        .then((res) => setOrder(res.data.order))
        .finally(() => setLoading(false));
    }
    load();
  }, [orderId, searchParams]);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-text-muted">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-display font-bold mb-4">Order not found</h1>
        <Link to="/" className="text-glow">Back to home</Link>
      </div>
    );
  }

  return (
    <>
      <SEO title="Order Confirmation" />
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold mb-2">
            {order.paymentStatus === 'paid' ? 'Order Confirmed!' : 'Order Received'}
          </h1>
          <GradientText className="text-lg">Thank you for shopping with us</GradientText>
        </div>

        <GlassPanel className="p-6 mb-6">
          <div className="flex justify-between text-sm mb-4">
            <span className="text-text-muted">Order</span>
            <span className="font-mono">#{order._id.slice(-8)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-text-muted">Status</span>
            <span className="capitalize">{order.orderStatus}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-text-muted">Payment</span>
            <span className="capitalize">{order.paymentStatus}</span>
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 mt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span className="font-mono text-glow">${order.pricing.total.toFixed(2)}</span>
          </div>
        </GlassPanel>

        <div className="text-center">
          <Link to="/">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </section>
    </>
  );
}