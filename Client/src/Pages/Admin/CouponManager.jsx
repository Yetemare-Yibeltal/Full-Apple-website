import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import GlassPanel from '../../components/ui/GlassPanel';
import Button from '../../components/ui/Button';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';
import './Admin.css';

const emptyForm = { code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', usageLimit: '', expiresAt: '' };

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const { showToast } = useToast();

  function loadCoupons() {
    api.get('/coupons').then((res) => setCoupons(res.data.coupons));
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/coupons', {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      });
      showToast('Coupon created', 'success');
      setForm(emptyForm);
      loadCoupons();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this coupon?')) return;
    await api.delete(`/coupons/${id}`);
    loadCoupons();
  }

  return (
    <>
      <SEO title="Manage Coupons" />
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">
          <GradientText>Coupons</GradientText>
        </h1>

        <GlassPanel className="p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="CODE" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono" />
            <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
              <option value="percentage" className="bg-obsidian">Percentage</option>
              <option value="fixed" className="bg-obsidian">Fixed Amount</option>
            </select>
            <input required type="number" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} placeholder="Discount value" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <input type="number" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} placeholder="Min order amount" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <input type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} placeholder="Usage limit" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <Button type="submit" variant="primary" className="col-span-2">Create Coupon</Button>
          </form>
        </GlassPanel>

        <GlassPanel className="p-4 overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Code</th><th>Discount</th><th>Used</th><th>Expires</th><th></th></tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className="font-mono">{c.code}</td>
                  <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                  <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <button onClick={() => handleDelete(c._id)} className="text-prism-rose text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      </section>
    </>
  );
}