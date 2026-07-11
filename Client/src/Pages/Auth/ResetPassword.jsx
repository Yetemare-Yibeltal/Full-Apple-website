import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import GlassPanel from '../../components/ui/GlassPanel';
import Button from '../../components/ui/Button';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Reset Password" />
      <div className="max-w-md mx-auto px-6 py-24">
        <GlassPanel className="p-8">
          <h1 className="text-2xl font-display font-bold mb-6 text-center">
            Set New <GradientText>Password</GradientText>
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-glow"
            />
            {error && <p className="text-prism-rose text-sm">{error}</p>}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Reset Password'}
            </Button>
          </form>
        </GlassPanel>
      </div>
    </>
  );
}