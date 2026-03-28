import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api from '../lib/api';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
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
        options: {
          data: { full_name: name }
        }
      });
      if (authError) throw authError;

      // Sync user profile to our backend public.users table
      if (data.session) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({ id: data.user.id, email, name });
          
        if (profileError) throw profileError;
        navigate('/dashboard');
      } else {
        setMessage('Succes! Please check your email to verify your account.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Immersive Background Effects */}
      <div className="fixed top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[120px] mix-blend-screen animate-pulse pointer-events-none z-0"></div>
      <div className="fixed bottom-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-primary/15 blur-[140px] mix-blend-screen pointer-events-none z-0"></div>
      <div className="fixed top-[30%] left-[10%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[100px] mix-blend-screen pointer-events-none z-0"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            NEURO<span className="text-accent">LEARN</span>
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wide">INNOVATE WITHOUT LIMITS</p>
        </div>

        <div className="glass-card-premium p-10 relative neon-border-primary">
          <h2 className="text-3xl font-bold text-center mb-8 text-gradient-primary">Create Account</h2>
          
          {error && (
            <div className="p-4 mb-6 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 mb-6 text-sm bg-primary/10 border border-primary/30 text-white rounded-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              {message}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 mb-8 bg-white/[0.05] border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg"
          >
            <div className="bg-white p-1 rounded-full group-hover:scale-110 transition-transform">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4"/>
            </div>
            <span className="text-sm font-semibold text-white/90">Sign up with Google</span>
          </button>

          <div className="relative flex items-center mb-8">
            <div className="flex-1 border-t border-white/5"></div>
            <span className="px-4 text-white/20 text-[10px] font-black tracking-widest uppercase">Or register here</span>
            <div className="flex-1 border-t border-white/5"></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 ml-1 uppercase tracking-wider">Full Name</label>
              <Input 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="bg-white/[0.03] border-white/10 h-13 rounded-2xl focus:ring-primary/50 focus:border-primary/50 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 ml-1 uppercase tracking-wider">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-white/[0.03] border-white/10 h-13 rounded-2xl focus:ring-primary/50 focus:border-primary/50 text-base"
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
                className="bg-white/[0.03] border-white/10 h-13 rounded-2xl focus:ring-primary/50 focus:border-primary/50 text-base"
              />
            </div>

            <button type="submit" disabled={loading} className="uiverse-btn w-full !py-4 mt-6 shadow-xl shadow-primary/20">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : 'Get Started Now'}
            </button>
          </form>
          
          <div className="text-center mt-10">
            <p className="text-sm text-white/40">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-accent font-bold hover:text-primary transition-colors"
              >
                Sign In instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
