import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Star, BrainCircuit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Pioneer';

  return (
    <div className="animate-in fade-in duration-700 w-full h-full flex flex-col gap-8">
      
      {/* Welcome Banner */}
      <section className="glass-card-premium neon-border-primary p-12 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/20 transition-all duration-700"></div>
        <div className="relative z-10 w-full lg:w-2/3 space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
               Welcome back, <span className="text-secondary underline decoration-primary/30 underline-offset-8">{firstName}</span>
            </h1>
            <p className="text-white/40 font-medium tracking-[0.3em] uppercase text-[10px] ml-1">Cognitive Synchronization Active</p>
          </div>
          <p className="text-lg text-white/50 leading-relaxed font-medium">
            Your personalized learning node is active. The adaptive engine has synthesized new data structures suited for your precise cognitive parameters.
          </p>
          <button 
            onClick={() => navigate('/dashboard/courses')} 
            className="uiverse-btn !px-10 !py-5 shadow-2xl shadow-primary/20 active:scale-95 transition-transform"
          >
             RESUME NEURAL LINK ✦
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div className="glass-card-premium neon-border-primary border-white/5 p-8 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Adaptive Level</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Activity size={20} /></div>
          </div>
          <p className="text-6xl font-black tracking-tighter italic">4<span className="text-2xl text-primary/40 ml-1">.2</span></p>
        </div>

        <div className="glass-card-premium neon-border-primary border-white/5 p-8 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Active Courses</h3>
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
          </div>
          <p className="text-6xl font-black tracking-tighter italic">02</p>
        </div>

        <div className="glass-card-premium neon-border-primary border-white/5 p-8 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Study Plans</h3>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><BrainCircuit size={20} /></div>
          </div>
          <p className="text-6xl font-black tracking-tighter italic">01</p>
        </div>

        <div className="glass-card-premium neon-border-primary border-white/5 p-8 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Skill Points</h3>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform"><Star size={20} /></div>
          </div>
          <p className="text-6xl font-black tracking-tighter italic text-gradient-primary">1.2K</p>
        </div>

      </section>

    </div>
  );
}
