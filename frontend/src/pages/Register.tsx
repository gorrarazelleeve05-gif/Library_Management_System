import React, { useState } from 'react';
import { User, Lock, Mail, Phone, UserPlus } from 'lucide-react';
import { register } from '../api/auth';
import { AuthUser } from '../types';
import Logo from '../components/Logo';

interface RegisterProps {
  onRegister: (user: AuthUser, access: string, refresh: string) => void;
  onGoLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onGoLogin }) => {
  const [form, setForm] = useState({
    username: '', password: '', confirm: '',
    first_name: '', last_name: '', email: '', phone: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.first_name) {
      setError('Username, password, and first name are required.'); return;
    }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await register({
        username: form.username, password: form.password,
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, phone: form.phone,
      });
      onRegister(data.user, data.access, data.refresh);
    } catch (e: any) {
      const err = e.response?.data;
      if (err?.username) setError('Username: ' + err.username[0]);
      else if (err?.password) setError('Password: ' + err.password[0]);
      else if (err?.non_field_errors) setError(err.non_field_errors[0]);
      else setError('Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left-panel">
        <div className="llp-logo">
          <Logo size={56}/>
          <div>
            <div className="llp-brand-name">Librarium</div>
            <div className="llp-brand-sub">Management System</div>
          </div>
        </div>
        <div className="llp-tagline">
          <h2>Join Our<br/>Library Community</h2>
          <p>Create your account to browse books, request borrows, and track your reading history.</p>
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-form-card" style={{ maxWidth: 460 }}>
          <div className="lfc-header">
            <h1>Create Account</h1>
            <p>Fill in your details to get started</p>
          </div>

          <form onSubmit={submit} className="login-form">
            {error && <div className="form-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>First Name *</label>
                <div className="input-icon-wrap">
                  <User size={14} className="input-icon"/>
                  <input name="first_name" value={form.first_name} onChange={handle} placeholder="First name" autoFocus/>
                </div>
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handle} placeholder="Last name"/>
              </div>
            </div>

            <div className="form-field">
              <label>Username *</label>
              <div className="input-icon-wrap">
                <UserPlus size={14} className="input-icon"/>
                <input name="username" value={form.username} onChange={handle} placeholder="Choose a username"/>
              </div>
            </div>

            <div className="form-field">
              <label>Email</label>
              <div className="input-icon-wrap">
                <Mail size={14} className="input-icon"/>
                <input type="email" name="email" value={form.email} onChange={handle} placeholder="your@email.com"/>
              </div>
            </div>

            <div className="form-field">
              <label>Phone</label>
              <div className="input-icon-wrap">
                <Phone size={14} className="input-icon"/>
                <input name="phone" value={form.phone} onChange={handle} placeholder="+1-555-0000"/>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Password *</label>
                <div className="input-icon-wrap">
                  <Lock size={14} className="input-icon"/>
                  <input type="password" name="password" value={form.password} onChange={handle} placeholder="Min. 6 chars"/>
                </div>
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Confirm *</label>
                <div className="input-icon-wrap">
                  <Lock size={14} className="input-icon"/>
                  <input type="password" name="confirm" value={form.confirm} onChange={handle} placeholder="Repeat"/>
                </div>
              </div>
            </div>

            <button type="submit" className="lfc-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <p style={{ color: '#7a5c3c', fontSize: 14, fontFamily: 'Jost, sans-serif' }}>
              Already have an account?{' '}
              <button onClick={onGoLogin} className="lfc-link-btn">Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
