import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../../components/ui/GlassPanel';
import Button from '../../components/ui/Button';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Create Account" />
      <div className="max-w-md mx-auto px-6 py-24">
        <GlassPanel className="p-8">
          <h1 className="text-2xl font-display font-bold mb-6 text-center">
            Create your <GradientText>Account</GradientText>
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-glow"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-glow"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 characters)"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-glow"
            />
            {error && <p className="text-prism-rose text-sm">{error}</p>}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <Link to="/login" className="text-sm text-text-muted hover:text-glow mt-4 block text-center">
            Already have an account? Sign in
          </Link>
       
       </GlassPanel>
      </div>
    </>
  );
}