import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import axios from 'axios';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } }
      });
      if (err) throw err;
      // Sync user profile
      const token = data.session?.access_token;
      if (token) {
        await axios.post('/api/auth/sync-user', { name: form.name }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    }
    setLoading(false);
  };

  const perks = [
    'AI-powered adaptive learning paths',
    'Personalized cognitive score tracking',
    'Unlimited access to course library',
    'AI Tutor available 24/7',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--cs-bg-deep)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.8) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, rgba(6,214,160,0.6) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md cs-animate-in">
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--cs-purple), var(--cs-teal))' }}>
              <span className="material-symbols-outlined material-symbols-filled text-white" style={{ fontSize: '20px' }}>psychology_alt</span>
            </div>
            <span className="text-xl font-black text-[var(--cs-text-primary)]">Cognitive<span style={{ color: 'var(--cs-purple-light)' }}>Sanctuary</span></span>
          </button>
          <h1 className="text-2xl font-black text-[var(--cs-text-primary)]">Create your account</h1>
          <p className="text-sm text-[var(--cs-text-muted)] mt-1">Join thousands of learners on the path to mastery</p>
        </div>

        {/* Perks */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          {perks.map(p => (
            <div key={p} className="flex items-center gap-2 text-xs text-[var(--cs-text-secondary)]">
              <span className="material-symbols-outlined material-symbols-filled flex-shrink-0" style={{ color: 'var(--cs-teal)', fontSize: '14px' }}>check_circle</span>
              {p}
            </div>
          ))}
        </div>

        <div className="cs-card p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}>
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--cs-text-muted)] mb-1.5">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cs-text-muted)]" style={{ fontSize: '18px' }}>person</span>
                <input type="text" className="cs-input pl-10" placeholder="Alex Chen"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--cs-text-muted)] mb-1.5">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cs-text-muted)]" style={{ fontSize: '18px' }}>mail</span>
                <input type="email" className="cs-input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--cs-text-muted)] mb-1.5">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cs-text-muted)]" style={{ fontSize: '18px' }}>lock</span>
                <input type={showPass ? 'text' : 'password'} className="cs-input pl-10 pr-10"
                  placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cs-text-muted)] hover:text-[var(--cs-text-primary)] transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="cs-btn-teal w-full justify-center mt-2">
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-base">hourglass_empty</span>Creating account...</>
              ) : (
                <><span className="material-symbols-outlined text-base">rocket_launch</span>Begin Your Journey</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--cs-text-muted)] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-bold hover:text-[var(--cs-teal)] transition-colors" style={{ color: 'var(--cs-purple-light)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
