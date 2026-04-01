import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Brain, ArrowRight } from 'lucide-react';

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

      if (data.session) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({ id: data.user.id, email, name });
          
        if (profileError) throw profileError;
        navigate('/dashboard');
      } else {
        setMessage('Success! Please check your email to verify your account.');
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
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-10">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center justify-center space-x-2 cursor-pointer hover:opacity-80 transition-all group mb-4"
          >
            <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">NeuroLearn</span>
          </div>
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">The Cognitive Atelier</p>
        </div>

        <div className="bg-white border border-slate-200/60 shadow-2xl shadow-slate-200/50 p-8 md:p-10 rounded-[2rem]">
          <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-slate-500 text-center mb-8 text-sm">Join the network of neural pioneers</p>
          
          {error && (
            <div className="p-4 mb-6 text-sm bg-red-50 border border-red-100 text-red-600 rounded-2xl animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 mb-6 text-sm bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl animate-in fade-in slide-in-from-top-2">
              {message}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 mb-8 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 group-hover:scale-110 transition-transform"/>
            <span className="text-sm font-semibold text-slate-700">Continue with Google</span>
          </button>

          <div className="relative flex items-center mb-8">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="px-4 text-slate-400 text-[10px] font-bold tracking-widest uppercase">Or email register</span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</label>
              <input 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full bg-slate-50/50 border border-slate-200 h-13 px-4 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-base"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full bg-slate-50/50 border border-slate-200 h-13 px-4 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-base"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full bg-slate-50/50 border border-slate-200 h-13 px-4 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-base"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-4 mt-4 shadow-lg shadow-primary/20">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Joining...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>
          
          <div className="text-center mt-10">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link 
                to="/login"
                className="text-primary font-bold hover:underline transition-all"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
