import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import GlassPanel from '../../components/ui/GlassPanel';
import Button from '../../components/ui/Button';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';
import './Admin.css';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  function loadProducts() {
    setLoading(true);
    api.get('/products', { params: { limit: 60 } }).then((res) => setProducts(res.data.products)).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDeactivate(id) {
    if (!confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deactivated', 'success');
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <>
      <SEO title="Manage Products" />
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Products</GradientText>
          </h1>
          <Link to="/admin/products/new">
            <Button variant="primary">+ Add Product</Button>
          </Link>
        </div>

        <GlassPanel className="p-4 overflow-x-auto">
          {loading ? (
            <p className="text-text-muted p-4">Loading...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td className="capitalize">{p.category}</td>
                    <td className="font-mono">${p.basePrice}</td>
                    <td>{p.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button onClick={() => handleDeactivate(p._id)} className="text-prism-rose text-xs">
                        Deactivate
                      </button>
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