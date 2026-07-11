import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import GlassPanel from '../../components/ui/GlassPanel';
import Button from '../../components/ui/Button';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';
import './Admin.css';

const emptyForm = { title: '', slug: '', order: 0, heroHeadline: '', heroSubtext: '', isVisible: true };

export default function AdminNavManager() {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();

  function loadSections() {
    api.get('/nav', { params: { all: true } }).then((res) => setSections(res.data.sections));
  }

  useEffect(() => {
    loadSections();
  }, []);

  function startEdit(section) {
    setEditingId(section._id);
    setForm({
      title: section.title, slug: section.slug, order: section.order,
      heroHeadline: section.heroHeadline || '', heroSubtext: section.heroSubtext || '',
      isVisible: section.isVisible,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/nav/${editingId}`, form);
        showToast('Section updated', 'success');
      } else {
        await api.post('/nav', form);
        showToast('Section created', 'success');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadSections();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this section?')) return;
    await api.delete(`/nav/${id}`);
    loadSections();
  }

  return (
    <>
      <SEO title="Manage Navigation" />
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">
          Nav <GradientText>Sections</GradientText>
        </h1>

        <GlassPanel className="p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="slug" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono" />
            <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} placeholder="Order" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))} />
              Visible
            </label>
            <input value={form.heroHeadline} onChange={(e) => setForm((f) => ({ ...f, heroHeadline: e.target.value }))} placeholder="Hero headline" className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <textarea value={form.heroSubtext} onChange={(e) => setForm((f) => ({ ...f, heroSubtext: e.target.value }))} placeholder="Hero subtext" className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <Button type="submit" variant="primary" className="col-span-2">
              {editingId ? 'Update Section' : 'Create Section'}
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel className="p-4 overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Title</th><th>Slug</th><th>Order</th><th>Visible</th><th></th></tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s._id}>
                  <td>{s.title}</td>
                  <td className="font-mono">{s.slug}</td>
                  <td>{s.order}</td>
                  <td>{s.isVisible ? 'Yes' : 'No'}</td>
                  <td className="flex gap-3">
                    <button onClick={() => startEdit(s)} className="text-glow text-xs">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="text-prism-rose text-xs">Delete</button>
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