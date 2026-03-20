import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      if (err.message.includes('Email not confirmed')) {
        setError('Please verify your email address before signing in.');
      } else if (err.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        setError(err.message || 'Invalid login credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      // OAuth redirects, no need to manually navigate
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Immersive Background Effects */}
      <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse pointer-events-none z-0"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-accent/15 blur-[140px] mix-blend-screen pointer-events-none z-0"></div>
      <div className="fixed top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[100px] mix-blend-screen pointer-events-none z-0"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            NEURO<span className="text-accent">LEARN</span>
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wide">INNOVATE WITHOUT LIMITS</p>
        </div>

        <div className="glass-card-premium p-10 relative neon-border-primary">
          <h2 className="text-3xl font-bold text-center mb-8 text-gradient-primary">Welcome Back</h2>
          
          {error && (
            <div className="p-4 mb-6 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 mb-8 bg-white/[0.05] border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg"
          >
            <div className="bg-white p-1 rounded-full group-hover:scale-110 transition-transform">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4"/>
            </div>
            <span className="text-sm font-semibold text-white/90">Sign in with Google</span>
          </button>

          <div className="relative flex items-center mb-8">
            <div className="flex-1 border-t border-white/5"></div>
            <span className="px-4 text-white/20 text-[10px] font-black tracking-widest uppercase">Or secure login</span>
            <div className="flex-1 border-t border-white/5"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 ml-1 uppercase tracking-wider">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-primary/50 focus:border-primary/50 text-base"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 ml-1 uppercase tracking-wider">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-primary/50 focus:border-primary/50 text-base"
              />
            </div>

            <button type="submit" disabled={loading} className="uiverse-btn w-full !py-4 mt-4 shadow-xl shadow-primary/20">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : 'Sign In to Dashboard'}
            </button>
          </form>
          
          <div className="text-center mt-10">
            <p className="text-sm text-white/40">
              New to the platform?{' '}
              <button 
                onClick={() => navigate('/signup')}
                className="text-primary font-bold hover:text-accent transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
