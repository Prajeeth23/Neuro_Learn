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

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (authError) throw authError;

      if (data.session) {
        await supabase.from('users').upsert({ id: data.user.id, email, name });
        navigate('/dashboard');
      } else {
        setMessage('Account created! Please check your email to verify your address.');
      }
    } catch (err) {
      setError(err.message);
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
        className="hidden lg:flex flex-col justify-between w-2/5 p-16 relative overflow-hidden mesh-gradient-aura"
      >
        {/* Floating Orbs for depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-indigo-400/20 blur-[120px] animate-floating" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] rounded-full bg-teal-400/20 blur-[100px] animate-floating-slow" />

        <div className="flex items-center gap-4 relative z-10 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-2xl glass-luxe flex items-center justify-center glow-indigo shadow-2xl transition-transform group-hover:scale-110">
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <span className="font-black text-2xl text-white tracking-tighter uppercase italic">
            Neuro<span className="text-indigo-200">Learn</span>
          </span>
        </div>

        <div className="relative z-10 space-y-10">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 glass-luxe !bg-white/10 !text-white/90 border-white/20">
              JOIN THE PROTOCOL
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter italic uppercase mb-8">
              Start <br /> Learning <br /> <span className="text-indigo-200">Smarter.</span>
            </h2>
            <p className="max-w-md text-sm font-semibold text-white/60 leading-relaxed uppercase tracking-wide">
              Join thousands of pioneers mastering complex domains with AI-driven neural paths.
            </p>
          </div>
          
          <div className="space-y-4">
            {['No-Cost Initialization', 'Predictive Career Mapping', 'Synaptic Growth Tracking'].map(f => (
              <div key={f} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-xl glass-luxe flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white glow-indigo" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.4em] relative z-10 text-white/30">
          © 2026 NEURAL PROTOCOL / ALL RIGHTS RESERVED
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
              <div className="mb-10">
                <h1 className="text-4xl font-black text-black italic tracking-tighter uppercase leading-none mb-4">
                  New <span className="text-indigo-600">Pioneer</span>
                </h1>
                <p className="text-[11px] font-black tracking-[0.2em] uppercase opacity-40"> Initialize your learning footprint </p>
              </div>

              {error && (
                <div className="flex items-start gap-4 p-5 mb-8 rounded-2xl animate-scale-in glass-luxe bg-rose-50 border-rose-200">
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-rose-800 leading-relaxed uppercase tracking-tight">{error}</p>
                </div>
              )}

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-4 py-4 mb-8 rounded-2xl glass-luxe bg-white border-indigo-50 hover:border-indigo-200 transition-all group"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Sync with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center mb-10">
                <div className="flex-1 h-px bg-indigo-50" />
                <span className="px-6 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-900/40">Credential Proxy</span>
                <div className="flex-1 h-px bg-indigo-50" />
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40 mb-3 ml-1">Universal Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="input-glass !h-14"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40 mb-3 ml-1">Synapse ID / Email</label>
                  <input
                    type="email"
                    placeholder="you@neural.engine"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="input-glass !h-14"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40 mb-3 ml-1">Encryption / Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="input-glass !h-14 pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full !py-5 mt-6 group"
                >
                  {loading ? (
                     <><Loader2 size={24} className="animate-spin" /> <span className="text-[12px] font-black tracking-[0.2em] uppercase">Initializing...</span></>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                       <span className="text-[12px] font-black tracking-[0.2em] uppercase">Create Account</span>
                       <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  )}
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
