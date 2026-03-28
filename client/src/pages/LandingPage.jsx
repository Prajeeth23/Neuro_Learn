import React, { useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Play, Activity, Cpu, Code2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background text-white font-sans relative overflow-hidden">
      {/* Abstract Animated Glow Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] mix-blend-screen pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-secondary/10 blur-[150px] mix-blend-screen pointer-events-none"></div>

      {/* Navbar equivalent */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-widest text-white">
          NEURO<span className="text-primary">LEARN</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-white/70">EN ▾</div>
          <button onClick={() => navigate('/login')} className="uiverse-btn-outline px-6 py-2 text-sm rounded-full">
            Contact Us
          </button>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 max-w-5xl mx-auto">
        


        {/* Hero Title */}
        <h1 className="text-6xl md:text-[5.5rem] font-bold leading-[1.1] tracking-tight mb-12">
          Innovate <br/> Without <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-white">Limits</span>
        </h1>

        {/* Action Buttons & Stats */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-3xl">
          
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="uiverse-btn text-lg">
              Get Started ✦
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md">
              <Play fill="white" size={18} className="ml-1" />
            </button>
          </div>

          <div className="h-12 w-[1px] bg-white/20 hidden md:block"></div>

          <div className="flex gap-10 text-left">
            <div>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">320M+</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Course Views</p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">NeuroLens</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Active Learners</p>
            </div>
          </div>

        </div>

      </main>

      {/* Bottom Cards Row */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="glass-card p-8 flex flex-col justify-between group h-64">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 group-hover:bg-primary group-hover:text-white transition-colors">
              <Code2 size={20} />
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-background bg-blue-500"></div>
              <div className="w-8 h-8 rounded-full border-2 border-background bg-purple-500"></div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Courses</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] uppercase font-bold text-white/50 bg-white/10 px-2 py-1 rounded">Development</span>
              <span className="text-[10px] uppercase font-bold text-white/50 bg-white/10 px-2 py-1 rounded">API Integration</span>
            </div>
            <button onClick={() => navigate('/dashboard/courses')} className="uiverse-btn-outline w-full py-1 text-sm flex justify-center items-center gap-2">
              View Playlist <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        {/* Card 2 - Center piece with Robot/Abstract Graphic */}
        <div className="glass-card flex flex-col justify-end p-8 relative overflow-hidden group h-64">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/40 opacity-80 z-0"></div>
          {/* Abstract Robot Head placeholder using CSS shapes/icons */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700 z-0">
            <Cpu size={160} className="text-white" strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Continuous AI <br/> Optimization</h3>
            <p className="text-sm text-white/60">Adaptive engine adjusting in real-time.</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-8 flex flex-col justify-between h-64 group relative overflow-hidden">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 blur-3xl rounded-full"></div>
           <div>
              <p className="text-sm text-white/70 mb-1 flex justify-between">
                <span>99.7%</span>
                <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px]">↘</span>
              </p>
              <p className="text-xs text-white/40">Knowledge Retention</p>
           </div>
           
           {/* Abstract Chart */}
           <div className="flex-1 w-full flex items-end justify-between py-4 gap-1 relative z-10">
              <div className="w-1/6 bg-white/10 rounded-t-sm h-[30%] group-hover:h-[40%] transition-all"></div>
              <div className="w-1/6 bg-white/20 rounded-t-sm h-[50%] group-hover:h-[60%] transition-all backdrop-blur-md border border-white/30"></div>
              <div className="w-1/6 bg-primary rounded-t-sm h-[80%] shadow-[0_0_15px_rgba(124,58,237,0.8)] relative">
                 <div className="absolute -top-3 -right-3 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white]"></div>
              </div>
              <div className="w-1/6 bg-white/10 rounded-t-sm h-[40%] group-hover:h-[50%] transition-all"></div>
           </div>

           <div className="relative z-10 mt-auto">
              <h3 className="text-xl font-bold">AI-Driven Skill <br/> Acceleration</h3>
           </div>
        </div>

      </section>

    </div>
  );
}
