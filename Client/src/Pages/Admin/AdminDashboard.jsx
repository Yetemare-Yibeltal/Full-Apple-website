import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import GlassPanel from '../../components/ui/GlassPanel';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';
import './Admin.css';

const adminLinks = [
  { label: 'Products', to: '/admin/products' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Nav Sections', to: '/admin/nav' },
  { label: 'Coupons', to: '/admin/coupons' },
  { label: 'Reviews', to: '/admin/reviews' },
];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    api.get('/admin/stats/overview').then((res) => setOverview(res.data));
    api.get('/admin/stats/sales-trend').then((res) => setTrend(res.data.trend));
    api.get('/admin/stats/top-products').then((res) => setTopProducts(res.data.products));
  }, []);

  return (
    <>
      <SEO title="Admin Dashboard" />
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">
          Admin <GradientText>Dashboard</GradientText>
        </h1>

        <div className="flex flex-wrap gap-3 mb-10">
          {adminLinks.map((link) => (
            <Link key={link.to} to={link.to} className="glass-panel px-4 py-2 text-sm hover:border-white/30">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <GlassPanel className="p-6">
            <p className="text-text-muted text-sm mb-1">Total Revenue</p>
            <p className="font-mono text-2xl text-glow">${overview?.totalRevenue?.toFixed(2) ?? '...'}</p>
          </GlassPanel>
          <GlassPanel className="p-6">
            <p className="text-text-muted text-sm mb-1">Total Orders</p>
            <p className="font-mono text-2xl">{overview?.totalOrders ?? '...'}</p>
          </GlassPanel>
          <GlassPanel className="p-6">
            <p className="text-text-muted text-sm mb-1">Products</p>
            <p className="font-mono text-2xl">{overview?.totalProducts ?? '...'}</p>
          </GlassPanel>
          <GlassPanel className="p-6">
            <p className="text-text-muted text-sm mb-1">Customers</p>
            <p className="font-mono text-2xl">{overview?.totalCustomers ?? '...'}</p>
          </GlassPanel>
        </div>

        <GlassPanel className="p-6 mb-10">
          <h2 className="font-display font-semibold mb-4">Sales Trend (30 days)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9AA0AE" fontSize={12} />
              <YAxis stroke="#9AA0AE" fontSize={12} />
              <Tooltip contentStyle={{ background: '#05060A', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="revenue" stroke="#4FD3C4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="font-display font-semibold mb-4">Top Products</h2>
          <div className="flex flex-col gap-3">
            {topProducts.map((p) => (
              <div key={p._id} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="font-mono text-glow">{p.salesCount} sold</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>
    </>
  );
}