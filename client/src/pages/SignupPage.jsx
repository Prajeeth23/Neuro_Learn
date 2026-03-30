import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Loader2, GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate('/dashboard');
  }, [session, navigate]);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { full_name: name },
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (authError) throw authError;

      if (data.user && !data.session) {
        setMessage('Registration successful! Please check your email to verify your account before logging in.');
      } else if (data.session) {
        // If auto-logged in
        await supabase.from('users').upsert({ id: data.user.id, email, name });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(''); setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>

      {/* Left Branding Panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #3525CD 0%, #4F46E5 50%, #6D63F0 100%)' }}
      >
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'60px', left:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(255,255,255,0.2)' }}>
            <GraduationCap size={20} color="#ffffff" />
          </div>
          <span className="font-bold text-xl text-white" style={{ letterSpacing:'-0.02em' }}>NeuroLearn</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug" style={{ letterSpacing:'-0.02em' }}>
              Start learning<br />smarter today.
            </h2>
            <p className="mt-3 text-base" style={{ color:'rgba(255,255,255,0.7)' }}>
              Join thousands of learners who use AI-powered tools to master new skills faster.
            </p>
          </div>
          {['Free to get started', 'AI-personalized roadmap', 'Track progress in real-time'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background:'rgba(255,255,255,0.2)' }}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="text-sm font-medium" style={{ color:'rgba(255,255,255,0.85)' }}>{f}</span>
            </div>
          ))}
        </div>

        <p className="text-xs relative z-10" style={{ color:'rgba(255,255,255,0.4)' }}>
          © 2025 NeuroLearn. All rights reserved.
        </p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#3525CD,#4F46E5)' }}>
              <GraduationCap size={18} color="#ffffff" />
            </div>
            <span className="font-bold text-lg" style={{ color:'#191C1E', letterSpacing:'-0.02em' }}>
              Neuro<span style={{ color:'#4F46E5' }}>Learn</span>
            </span>
          </div>

          {/* Success State */}
          {message ? (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background:'#F0FDFA' }}>
                <CheckCircle2 size={32} style={{ color:'#0D9488' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color:'#191C1E', letterSpacing:'-0.02em' }}>Check your inbox</h2>
              <p className="text-sm mb-6" style={{ color:'#777587' }}>{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary mx-auto"
              >
                Go to Sign In <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1.5" style={{ color:'#191C1E', letterSpacing:'-0.02em' }}>Create your account</h1>
                <p className="text-sm" style={{ color:'#777587' }}>Get started with your free NeuroLearn account.</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 mb-6 rounded-xl animate-scale-in" style={{ background:'#FFF1F2', border:'1px solid #FFE4E6' }}>
                  <AlertCircle size={16} style={{ color:'#E11D48', marginTop:'1px', flexShrink:0 }} />
                  <p className="text-sm" style={{ color:'#E11D48' }}>{error}</p>
                </div>
              )}

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 mb-6 rounded-xl font-medium text-sm transition-all duration-200"
                style={{ background:'#ffffff', border:'1.5px solid #ECEEF0', color:'#191C1E', boxShadow:'0 1px 3px rgba(25,28,30,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#C3C0FF'; e.currentTarget.style.boxShadow='0 4px 12px rgba(79,70,229,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#ECEEF0'; e.currentTarget.style.boxShadow='0 1px 3px rgba(25,28,30,0.06)'; }}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative flex items-center mb-6">
                <div className="flex-1" style={{ height:'1px', background:'#ECEEF0' }} />
                <span className="px-4 text-xs font-medium" style={{ color:'#777587' }}>or create with email</span>
                <div className="flex-1" style={{ height:'1px', background:'#ECEEF0' }} />
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color:'#464555' }}>Full name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="input-field"
                    style={{ height:'44px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color:'#464555' }}>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="input-field"
                    style={{ height:'44px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color:'#464555' }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="input-field pr-11"
                      style={{ height:'44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color:'#777587', background:'none', border:'none', cursor:'pointer' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 mt-2"
                  style={{
                    background: loading ? '#818CF8' : 'linear-gradient(135deg,#3525CD,#4F46E5)',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(79,70,229,0.3)',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow='0 6px 20px rgba(79,70,229,0.4)'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow='0 4px 12px rgba(79,70,229,0.3)'; }}
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : <>Create Account <ArrowRight size={16} /></>}
                </button>
              </form>

              <p className="text-center text-sm mt-8" style={{ color:'#777587' }}>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-semibold"
                  style={{ color:'#4F46E5', background:'none', border:'none', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration='none'}
                >
                  Sign in
                </button>
              </p>

              <div className="text-center mt-5">
                <button
                  onClick={() => navigate('/')}
                  className="text-xs"
                  style={{ color:'#C7C4D8', background:'none', border:'none', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color='#777587'}
                  onMouseLeave={e => e.currentTarget.style.color='#C7C4D8'}
                >
                  ← Back to homepage
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
