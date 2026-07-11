import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../../components/ui/GlassPanel';
import Button from '../../components/ui/Button';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title={isRegister ? 'Create Account' : 'Sign In'} />
      <div className="max-w-md mx-auto px-6 py-24">
        <GlassPanel className="p-8">
          <h1 className="text-2xl font-display font-bold mb-6 text-center">
            {isRegister ? 'Create' : 'Sign in to your'} <GradientText>Account</GradientText>
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-glow"
              />
            )}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-glow"
            />
            {error && <p className="text-prism-rose text-sm">{error}</p>}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
          <button
            onClick={() => setIsRegister((v) => !v)}
            className="text-sm text-text-muted hover:text-glow mt-4 w-full text-center"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
          {!isRegister && (
            <Link to="/forgot-password" className="text-xs text-text-muted hover:text-glow mt-2 block text-center">
              Forgot password?
            </Link>
          )}
        </GlassPanel>
      </div>
    </>
  );
}