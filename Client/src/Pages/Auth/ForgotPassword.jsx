import { useState } from 'react';
import api from '../../lib/api';
import GlassPanel from '../../components/ui/GlassPanel';
import Button from '../../components/ui/Button';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Forgot Password" />
      <div className="max-w-md mx-auto px-6 py-24">
        <GlassPanel className="p-8">
          <h1 className="text-2xl font-display font-bold mb-6 text-center">
            Reset <GradientText>Password</GradientText>
          </h1>
          {sent ? (
            <p className="text-text-muted text-center">
              If an account with that email exists, a reset link has been sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-glow"
              />
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </GlassPanel>
      </div>
    </>
  );
}