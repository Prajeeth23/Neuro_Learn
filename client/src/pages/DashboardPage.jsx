import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Star, BrainCircuit, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    adaptiveLevel: 4.2,
    activeCourses: 0,
    studyPlans: 0,
    skillPoints: 0
  });

  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [subtitle, setSubtitle] = useState('');

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Pioneer';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Check if first login (if true or undefined)
        const isFirst = user?.user_metadata?.isFirstLogin !== false;
        setIsFirstLogin(isFirst);
        
        // Randomize messages for returning users
        if (!isFirst) {
          const messages = [
            `Welcome Back, ${firstName} — Your learning evolution continues`,
            `Good to see you, ${firstName} — Systems synced and ready`,
            `Hey ${firstName}, Your adaptive engine is recalibrated`,
            `Welcome back, ${firstName} — Progress awaits`,
            `Neural sync complete, ${firstName}`
          ];
          const subtitles = [
            "Cognitive Synchronization Active",
            "Adaptive Learning Mode Engaged",
            "Skill Matrix Updating",
            "Neural Pathways Optimized"
          ];
          setWelcomeMessage(messages[Math.floor(Math.random() * messages.length)]);
          setSubtitle(subtitles[Math.floor(Math.random() * subtitles.length)]);
        }

        // Fetch Analytics and Study Plans
        const [analyticsRes, personalizedRes] = await Promise.all([
          api.get('/progress/analytics').catch(() => null),
          api.get('/personalized').catch(() => null)
        ]);
        
        const analyticsData = analyticsRes?.data;
        const personalizedData = personalizedRes?.data?.materials || [];

        if (analyticsData && analyticsData.summary) {
           const calculatedSkillPoints = (analyticsData.summary.totalQuizzes * 100) + (analyticsData.summary.totalScreenTimeMinutes * 5);
           setStats({
             adaptiveLevel: analyticsData.summary.avgLevel || 4.2,
             activeCourses: analyticsData.summary.coursesEnrolled || 0,
             studyPlans: personalizedData.length > 0 ? personalizedData.length : 1, // At least 1 template
             skillPoints: calculatedSkillPoints || 1200
           });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleStartSetup = async () => {
    try {
      // Update user metadata in Supabase
      await supabase.auth.updateUser({
        data: { isFirstLogin: false }
      });
      setIsFirstLogin(false);
      
      // Navigate to onboarding / personalized page
      navigate('/dashboard/personalized'); 
    } catch (error) {
       console.error("Failed to update user status", error);
    }
  };

  const formatPoints = (points) => {
    if (points >= 1000) return (points / 1000).toFixed(1) + 'K';
    return points;
  };

  const getAdaptiveDecimal = (val) => {
    return (val % 1).toFixed(1).split('.')[1];
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 w-full h-full flex flex-col gap-8">
      
      {/* Dynamic Hero Section */}
      <section className="glass-card-premium neon-border-primary p-12 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/20 transition-all duration-700"></div>
        <div className="relative z-10 w-full lg:w-2/3 space-y-6">
          
          {isFirstLogin ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter capitalize">
                 Welcome, <span className="text-secondary underline decoration-primary/30 underline-offset-8">{firstName}</span>
              </h1>
              <h2 className="text-xl md:text-2xl text-white/80 font-bold tracking-wide">
                 Let's build your personalized learning path
              </h2>
              <p className="text-lg text-white/50 leading-relaxed max-w-lg mt-2 font-medium">
                 Select your domain of interest and preferred role to generate your adaptive roadmap.
              </p>
              <button 
                onClick={handleStartSetup} 
                className="uiverse-btn !px-8 !py-4 shadow-lg shadow-primary/20 mt-6 flex items-center gap-3 active:scale-95 transition-transform"
              >
                 START SETUP <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-1000">
              <div className="space-y-2 flex flex-col items-start pr-4">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight italic uppercase">
                  <span className="text-white">
                    {welcomeMessage.split('—')[0]}
                  </span>
                  <span className="block text-xl md:text-2xl text-primary/80 mt-2 lowercase tracking-wider pl-1">
                    — {welcomeMessage.split('—')[1]}
                  </span>
                </h1>
                <p className="text-white/40 font-medium tracking-[0.3em] uppercase text-[10px] ml-1 mt-4">{subtitle}</p>
              </div>
              
              <p className="text-lg text-white/50 leading-relaxed font-medium">
                {stats.activeCourses > 0 
                  ? "Your personalized learning node is active. Continue your journey." 
                  : "Your learning system is ready. Explore new courses to begin."}
              </p>
              
              <button 
                onClick={() => navigate('/dashboard/courses')} 
                className="uiverse-btn !px-10 !py-4 shadow-2xl shadow-primary/20 mt-2 active:scale-95 transition-transform"
              >
                 {stats.activeCourses > 0 ? "RESUME LEARNING ✦" : "EXPLORE COURSES ✦"}
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Dynamic Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
        
        <div className="glass-card-premium neon-border-primary border-white/5 p-8 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Adaptive Level</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Activity size={20} /></div>
          </div>
          <p className="text-6xl font-black tracking-tighter italic relative z-10">
            {Math.floor(stats.adaptiveLevel)}<span className="text-2xl text-primary/40 ml-1">.{getAdaptiveDecimal(stats.adaptiveLevel)}</span>
          </p>
        </div>

        <div className="glass-card-premium neon-border-primary border-white/5 p-8 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Active Courses</h3>
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
          </div>
          <p className="text-6xl font-black tracking-tighter italic relative z-10">{stats.activeCourses.toString().padStart(2, '0')}</p>
        </div>

        <div className="glass-card-premium neon-border-primary border-white/5 p-8 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Study Plans</h3>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><BrainCircuit size={20} /></div>
          </div>
          <p className="text-6xl font-black tracking-tighter italic relative z-10">{stats.studyPlans.toString().padStart(2, '0')}</p>
        </div>

        <div className="glass-card-premium neon-border-primary border-white/5 p-8 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Skill Points</h3>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform"><Star size={20} /></div>
          </div>
          <p className="text-6xl font-black tracking-tighter italic text-gradient-primary relative z-10">{formatPoints(stats.skillPoints)}</p>
        </div>

      </section>

    </div>
  );
}
