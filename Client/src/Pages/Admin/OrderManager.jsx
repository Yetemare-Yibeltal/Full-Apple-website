import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import GlassPanel from '../../components/ui/GlassPanel';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';
import './Admin.css';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  function loadOrders() {
    setLoading(true);
    api
      .get('/orders', { params: { status: statusFilter || undefined, limit: 50 } })
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      showToast('Order status updated', 'success');
      loadOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <>
      <SEO title="Manage Orders" />
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Orders</GradientText>
          </h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm"
          >
            <option value="" className="bg-obsidian">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s} className="bg-obsidian capitalize">{s}</option>
            ))}
          </select>
        </div>

        <GlassPanel className="p-4 overflow-x-auto">
          {loading ? (
            <p className="text-text-muted p-4">Loading...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono text-xs">#{order._id.slice(-8)}</td>
                    <td>{order.user?.name}</td>
                    <td className="font-mono">${order.pricing.total.toFixed(2)}</td>
                    <td className="capitalize">{order.paymentStatus}</td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s} className="bg-obsidian capitalize">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassPanel>
      </section>
    </>
  );
}