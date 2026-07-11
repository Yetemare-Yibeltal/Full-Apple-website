import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import GlassPanel from '../../components/ui/GlassPanel';
import Button from '../../components/ui/Button';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';
import './Admin.css';

const categories = ['iphone', 'ipad', 'mac', 'watch', 'tv', 'music', 'accessories'];

const emptyVariant = { label: '', colorName: '', colorHex: '#1d1d1f', storage: '', price: '', stock: '' };

export default function AddProduct() {
  const [form, setForm] = useState({
    name: '', slug: '', category: 'iphone', tagline: '', description: '',
    basePrice: '', featured: false,
  });
  const [highlights, setHighlights] = useState(['']);
  const [variants, setVariants] = useState([{ ...emptyVariant }]);
  const [media, setMedia] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  function updateForm(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === 'name') {
      setForm((f) => ({ ...f, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));
    }
  }

  function updateVariant(i, field, value) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  }

  async function handleGenerateContent() {
    if (!form.name || !form.category) {
      showToast('Enter a product name and category first', 'info');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/ai/generate-description', {
        name: form.name,
        category: form.category,
        highlights: highlights.filter(Boolean),
      });
      setForm((f) => ({ ...f, tagline: res.data.tagline, description: res.data.description }));
      showToast('AI content generated - review before saving', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    try {
      const res = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMedia((prev) => [...prev, ...res.data.files]);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/products', {
        ...form,
        basePrice: Number(form.basePrice),
        highlights: highlights.filter(Boolean),
        variants: variants
          .filter((v) => v.label)
          .map((v) => ({ ...v, price: Number(v.price), stock: Number(v.stock) })),
        media,
      });
      showToast('Product created', 'success');
      navigate('/admin/products');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SEO title="Add Product" />
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">
          Add <GradientText>Product</GradientText>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <GlassPanel className="p-6 flex flex-col gap-3">
            <input
              required
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Product name"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
            <input
              required
              value={form.slug}
              onChange={(e) => updateForm('slug', e.target.value)}
              placeholder="slug"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono"
            />
            <select
              value={form.category}
              onChange={(e) => updateForm('category', e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-obsidian">{c}</option>
              ))}
            </select>
            <input
              required
              type="number"
              value={form.basePrice}
              onChange={(e) => updateForm('basePrice', e.target.value)}
              placeholder="Base price"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => updateForm('featured', e.target.checked)} />
              Featured
            </label>
          </GlassPanel>

          <GlassPanel className="p-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-semibold">Content</h2>
              <button type="button" onClick={handleGenerateContent} disabled={generating} className="text-xs text-glow">
                {generating ? 'Generating...' : '✨ Generate with AI'}
              </button>
            </div>
            <input
              value={form.tagline}
              onChange={(e) => updateForm('tagline', e.target.value)}
              placeholder="Tagline"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Description"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="font-display font-semibold mb-3">Highlights</h2>
            {highlights.map((h, i) => (
              <input
                key={i}
                value={h}
                onChange={(e) => setHighlights((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
                placeholder={`Highlight ${i + 1}`}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-full mb-2"
              />
            ))}
            <button type="button" onClick={() => setHighlights((h) => [...h, ''])} className="text-xs text-glow">
              + Add highlight
            </button>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="font-display font-semibold mb-3">Variants</h2>
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-3">
                <input value={v.label} onChange={(e) => updateVariant(i, 'label', e.target.value)} placeholder="Label" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
                <input value={v.colorName} onChange={(e) => updateVariant(i, 'colorName', e.target.value)} placeholder="Color name" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
                <input type="color" value={v.colorHex} onChange={(e) => updateVariant(i, 'colorHex', e.target.value)} className="bg-white/5 border border-white/10 rounded h-8" />
                <input value={v.storage} onChange={(e) => updateVariant(i, 'storage', e.target.value)} placeholder="Storage" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
                <input type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} placeholder="Price" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
                <input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} placeholder="Stock" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
              </div>
            ))}
            <button type="button" onClick={() => setVariants((v) => [...v, { ...emptyVariant }])} className="text-xs text-glow">
              + Add variant
            </button>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="font-display font-semibold mb-3">Media</h2>
            <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="text-sm" />
            {uploading && <p className="text-xs text-text-muted mt-2">Uploading...</p>}
            <div className="flex gap-2 mt-3 flex-wrap">
              {media.map((m) => (
                <img key={m.url} src={m.url} alt="" className="w-16 h-16 object-cover rounded" />
              ))}
            </div>
          </GlassPanel>

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Create Product'}
          </Button>
        </form>
      </section>
    </>
  );
}