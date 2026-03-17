import React, { useState } from 'react';
import { User, Lock, BookOpen, Users, BookMarked, BarChart3 } from 'lucide-react';
import { login } from '../api';
import { AuthUser } from '../types';
import Logo from '../components/Logo';

interface LoginProps {
  onLogin: (user: AuthUser, access: string, refresh: string) => void;
  onGoRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter username and password.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await login(username, password);
      onLogin(data.user, data.access, data.refresh);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid username or password.');
    } finally { setLoading(false); }
  };

  const ic = { position: 'absolute' as const, left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a97954', pointerEvents: 'none' as const, zIndex: 2 };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left-panel">
        <div className="llp-logo">
          <Logo size={56}/>
          <div>
            <div className="llp-brand-name">Librarium</div>
            <div className="llp-brand-sub">Management System</div>
          </div>
        </div>
        <div className="llp-tagline">
          <h2>Your Library,<br/>Perfectly Managed</h2>
          <p>Track books, manage members, and streamline borrowing — all in one place.</p>
        </div>
        <div className="llp-features">
          {[
            { icon: <BookOpen size={15}/>,   text: 'Catalog & book management' },
            { icon: <Users size={15}/>,      text: 'Member accounts & profiles' },
            { icon: <BookMarked size={15}/>, text: 'Borrow & return tracking' },
            { icon: <BarChart3 size={15}/>,  text: 'Dashboard & analytics' },
          ].map((f, i) => (
            <div key={i} className="llp-feature">
              <div className="llp-feature-icon">{f.icon}</div>
              <span className="llp-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="login-right-panel">
        <div className="login-form-card">
          <div className="lfc-header">
            <h1>Welcome back</h1>
            <p>Sign in to your library account</p>
          </div>

          <form onSubmit={submit} className="login-form">
            {error && <div className="form-error">{error}</div>}

            <div className="form-field">
              <label>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={ic}/>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" autoFocus style={{ paddingLeft: 46 }}/>
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={ic}/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ paddingLeft: 46 }}/>
              </div>
            </div>

            <button type="submit" className="lfc-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="lfc-divider"><span>Demo credentials</span></div>

          <div className="lfc-hints">
            <p>Quick access</p>
            <div className="lfc-hint-row"><span className="lfc-hint-role lfc-hint-admin">Admin</span><code>admin / admin123</code></div>
            <div className="lfc-hint-row"><span className="lfc-hint-role lfc-hint-member">Member</span><code>alice / member123</code></div>
          </div>

          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <p style={{ color: '#7a5c3c', fontSize: 14, fontFamily: 'Jost, sans-serif' }}>
              New here?{' '}
              <button onClick={onGoRegister} className="lfc-link-btn">Create an account</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
