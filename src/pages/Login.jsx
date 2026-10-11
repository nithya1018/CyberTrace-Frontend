import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password. If this is your first deployment, ask the administrator to provision your account.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Could not connect to the sign-in service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>🛡️ CyberTrace</h1>
        <p className="subtitle">Digital Forensics Case &amp; Evidence Management</p>

        {error && <div className="alert-error">{error}</div>}

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <p className="auth-switch">
          No account? <Link to="/register">Register here</Link>
        </p>
        <p className="auth-switch">
          Administrator accounts are provisioned privately. Contact your system administrator for access.
        </p>
      </form>
    </div>
  );
}
