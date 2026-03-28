import React, { useEffect } from 'react';
import { Play, Activity, Cpu, Code2, ArrowRight, Sparkles, Brain, Target, Zap, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#191C1E] font-sans selection:bg-[#4F46E5] selection:text-white">

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3525CD, #4F46E5)' }}>
            <GraduationCap size={20} color="#ffffff" />
          </div>
          <span className="font-bold text-xl" style={{ letterSpacing: '-0.02em', color: '#191C1E' }}>
            Neuro<span style={{ color: '#4F46E5' }}>Learn</span>
          </span>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8 text-sm font-medium" style={{ color: '#777587' }}>
            <a href="#features" className="hover:text-[#4F46E5] transition-colors">Features</a>
            <a href="#stats" className="hover:text-[#4F46E5] transition-colors">Platform</a>
            <a href="#about" className="hover:text-[#4F46E5] transition-colors">About</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 max-w-5xl mx-auto">

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#E0E3E5] rounded-full mb-8 animate-fade-in-up"
             style={{ boxShadow: '0 2px 8px rgba(25,28,30,0.04)' }}>
          <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse"></span>
          <span className="text-xs font-semibold" style={{ color: '#464555' }}>NeuroLearn 3.0 is now live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-8" style={{ color: '#191C1E', letterSpacing: '-0.03em' }}>
          Master new skills with<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3525CD] to-[#4F46E5]">
            Adaptive AI Learning
          </span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl font-medium leading-relaxed mb-12 px-4" style={{ color: '#464555' }}>
          The professional platform that personalizes your educational journey. Learn faster through adaptive courses, AI-driven tutoring, and real-time performance analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary !px-8 !py-3.5 !text-base shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
          >
            Start Learning Free <ArrowRight className="ml-2" size={18} />
          </button>
          <button
            className="btn-secondary !px-8 !py-3.5 !text-base bg-white w-full sm:w-auto flex items-center gap-2"
          >
            <Play fill="currentColor" size={14} className="text-[#4F46E5] ml-1" />
            Watch Demo
          </button>
        </div>

        {/* Global Level Stats */}
        <div id="stats" className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full pt-16 border-t border-[#ECEEF0]">
          {[
            { label: 'Active Learners', val: '50k+', color: '#4F46E5' },
            { label: 'Courses Mastered', val: '120k+', color: '#0D9488' },
            { label: 'Completion Rate', val: '94%', color: '#D97706' },
            { label: 'Avg. Rating', val: '4.9/5', color: '#7C3AED' }
          ].map((s, i) => (
            <div key={i} className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#777587' }}>{s.label}</p>
              <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1 */}
        <div className="card p-8 flex flex-col justify-between group h-80 border border-[#ECEEF0] hover:border-[#C3C0FF]">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] mb-6 transition-colors group-hover:bg-[#4F46E5] group-hover:text-white">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#191C1E', letterSpacing: '-0.01em' }}>Personalized Paths</h3>
            <p className="text-sm font-medium leading-relaxed" style={{ color: '#464555' }}>
              Adaptive learning routes that continuously align with your goals and optimize for your unique retention pace.
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-semibold text-[#4F46E5] mt-6 group-hover:gap-3 transition-all w-fit">
            Explore paths <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 2 - Center piece */}
        <div className="card p-8 flex flex-col justify-between h-80 relative overflow-hidden group shadow-md"
             style={{ background: 'linear-gradient(135deg, #3525CD 0%, #4F46E5 100%)' }}>
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
            <Cpu size={240} strokeWidth={1} color="#ffffff" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
              <Sparkles size={24} color="#ffffff" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white" style={{ letterSpacing: '-0.01em' }}>AI-Powered Tutor</h3>
            <p className="text-sm font-medium leading-relaxed text-white/80">
              Stuck on a concept? Our generative AI tutor explains complex topics, generates quizzes, and provides instant feedback.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card p-8 flex flex-col justify-between group h-80 border border-[#ECEEF0] hover:border-[#6BD8CB]">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] flex items-center justify-center text-[#0D9488] mb-6 transition-colors group-hover:bg-[#0D9488] group-hover:text-white">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#191C1E', letterSpacing: '-0.01em' }}>Deep Analytics</h3>
            <p className="text-sm font-medium leading-relaxed" style={{ color: '#464555' }}>
              Visualize your progress with beautiful, real-time metrics tracking your mastery, study time, and skill growth.
            </p>
          </div>

          <div className="flex items-end gap-1.5 h-12 w-full mt-6">
            {[40, 70, 45, 90, 60, 80].map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-sm transition-all duration-500`}
                   style={{ height: `${h}%`, background: i === 3 ? '#0D9488' : '#ECEEF0' }}></div>
            ))}
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-[#ECEEF0]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#4F46E5' }}>
              <GraduationCap size={12} color="#ffffff" />
            </div>
            <span className="font-bold text-sm" style={{ color: '#191C1E', letterSpacing: '-0.01em' }}>NeuroLearn</span>
          </div>
          <div className="flex gap-8 text-sm font-medium" style={{ color: '#777587' }}>
            <a href="#" className="hover:text-[#4F46E5] transition-colors">Platform</a>
            <a href="#" className="hover:text-[#4F46E5] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#4F46E5] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#4F46E5] transition-colors">Contact</a>
          </div>
          <div className="text-xs" style={{ color: '#C7C4D8' }}>
            © 2025 NeuroLearn Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
