import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Star, BrainCircuit, ArrowRight, Brain, Sparkles } from 'lucide-react';
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

        const isFirst = user?.user_metadata?.isFirstLogin !== false;
        setIsFirstLogin(isFirst);
        
        if (!isFirst) {
          const messages = [
            `Welcome Back, ${firstName} — Your evolution continues`,
            `Systems Synced, ${firstName} — Performance optimized`,
            `Hey ${firstName} — Your neural path is ready`,
            `Synchronicity Restored, ${firstName}`,
            `Welcome to the Atelier, ${firstName}`
          ];
          const subtitles = [
            "Cognitive Status: Optimal",
            "Editorial Intelligence Engaged",
            "Skill Matrix Recalibrated",
            "Next-Gen Learning Active"
          ];
          setWelcomeMessage(messages[Math.floor(Math.random() * messages.length)]);
          setSubtitle(subtitles[Math.floor(Math.random() * subtitles.length)]);
        }

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
             studyPlans: personalizedData.length > 0 ? personalizedData.length : 0,
             skillPoints: calculatedSkillPoints || 0
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
      await supabase.auth.updateUser({
        data: { isFirstLogin: false }
      });
      setIsFirstLogin(false);
      navigate('/dashboard/personalized'); 
    } catch (error) {
       console.error("Failed to update user status", error);
    }
  };

  const formatPoints = (points) => {
    if (points >= 1000) return (points / 1000).toFixed(1) + 'K';
    return points;
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full h-full flex flex-col gap-10">
      
      {/* Dynamic Hero Section */}
      <section className="surface-elevated p-10 md:p-14 relative overflow-hidden group !rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="relative z-10 w-full lg:w-2/3 space-y-8">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Status Alpha</span>
          </div>

          {isFirstLogin ? (
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                 Welcome to the <span className="text-primary italic">Atelier</span>, {firstName}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg font-medium">
                 Your personalized cognitive roadmap starts here. Let's calibrate your learning preferences to begin.
              </p>
              <button 
                onClick={handleStartSetup} 
                className="btn-primary group"
              >
                 <span>Begin Onboarding</span>
                 <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                  {welcomeMessage.split('—')[0]}
                  <span className="block text-primary italic font-medium mt-1">
                    {welcomeMessage.split('—')[1]}
                  </span>
                </h1>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mt-4 ml-1">{subtitle}</p>
              </div>
              
              <p className="text-lg text-slate-500 leading-relaxed font-medium">
                {stats.activeCourses > 0 
                  ? "Your neural curriculum is initialized. Resuming your latest progress." 
                  : "Platform capacity verified. Explore our collection of high-end learning paths."}
              </p>
              
              <button 
                onClick={() => navigate('/dashboard/courses')} 
                className="btn-primary px-10 group"
              >
                 <span>{stats.activeCourses > 0 ? "Resume Learning" : "Explore Curricula"}</span>
                 <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="surface-elevated p-8 flex flex-col gap-8 group hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cognitive Level</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Activity size={20} /></div>
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold tracking-tighter text-slate-900">
              {stats.adaptiveLevel.toFixed(1)}
              <span className="text-sm font-medium text-slate-400 ml-2 tracking-widest uppercase">Rank Alpha</span>
            </p>
          </div>
        </div>

        <div className="surface-elevated p-8 flex flex-col gap-8 group hover:border-secondary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Paths</h3>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
          </div>
          <p className="text-5xl font-bold tracking-tighter text-slate-900">{stats.activeCourses.toString().padStart(2, '0')}</p>
        </div>

        <div className="surface-elevated p-8 flex flex-col gap-8 group hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Blueprints</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 group-hover:scale-110 transition-transform"><BrainCircuit size={20} /></div>
          </div>
          <p className="text-5xl font-bold tracking-tighter text-slate-900">{stats.studyPlans.toString().padStart(2, '0')}</p>
        </div>

        <div className="surface-elevated p-8 flex flex-col gap-8 group hover:border-amber-200 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Skill Points</h3>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><Star size={20} /></div>
          </div>
          <p className="text-5xl font-bold tracking-tighter text-slate-900">{formatPoints(stats.skillPoints)}</p>
        </div>

      </section>

    </div>
  );
}
