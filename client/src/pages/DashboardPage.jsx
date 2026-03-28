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

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Learner';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const isFirst = user?.user_metadata?.isFirstLogin !== false;
        setIsFirstLogin(isFirst);
        
        if (!isFirst) {
          const messages = [
            `Welcome back, ${firstName} — Your evolution continue`,
            `Systems synced, ${firstName}`,
            `Hey ${firstName}, Adaptive engine ready`,
            `Progress awaits, ${firstName}`,
            `Neural sync complete, ${firstName}`
          ];
          const subtitles = [
            "Cognitive Link Active",
            "Adaptive Sync Engaged",
            "Skill Matrix Ready",
            "Neural Paths Optimized"
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
             studyPlans: personalizedData.length > 0 ? personalizedData.length : 1,
             skillPoints: calculatedSkillPoints || 1200
           });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  const handleStartSetup = async () => {
    try {
      await supabase.auth.updateUser({ data: { isFirstLogin: false } });
      setIsFirstLogin(false);
      navigate('/dashboard/personalized'); 
    } catch (error) {
       console.error("Setup failed", error);
    }
  };

  const formatPoints = (points) => {
    if (points >= 1000) return (points / 1000).toFixed(1) + 'K';
    return points;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up w-full flex flex-col gap-10">
      
      {/* ===== HERO SECTION — Clean B&W ===== */}
      <section className="bg-white border border-gray-200 rounded-3xl p-10 md:p-14 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-6">
          
          {isFirstLogin ? (
            <div className="space-y-5">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black">
                 Welcome, <span className="underline decoration-gray-200 underline-offset-8">{firstName}</span>
              </h1>
              <h2 className="text-xl md:text-2xl text-gray-500 font-semibold leading-tight">
                 Let's build your personalized learning journey from scratch.
              </h2>
              <p className="text-gray-400 text-sm font-medium">
                 Generate your adaptive roadmap by selecting your preferred domains and goals.
              </p>
              <button 
                onClick={handleStartSetup} 
                className="uiverse-btn !rounded-xl flex items-center gap-2"
              >
                 START CONFIGURATION <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-black">
                  {welcomeMessage.split('—')[0]}
                  <span className="block text-xl md:text-2xl text-gray-400 font-bold mt-2 lowercase tracking-normal">
                    {welcomeMessage.split('—')[1]}
                  </span>
                </h1>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-300 ml-1 mt-6">{subtitle}</p>
              </div>
              
              <p className="text-gray-500 font-medium">
                {stats.activeCourses > 0 
                  ? "Your learning engine is synchronized. Continue where you left off." 
                  : "All systems ready. Start your first course to begin adaptive tracking."}
              </p>
              
              <button 
                onClick={() => navigate('/dashboard/courses')} 
                className="uiverse-btn !rounded-xl"
              >
                 {stats.activeCourses > 0 ? "RESUME LEARNING" : "EXPLORE DOMAINS"}
              </button>
            </div>
          )}

        </div>
        {/* Subtle abstract background element */}
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none select-none">
           <BrainCircuit size={400} />
        </div>
      </section>

      {/* ===== STATS GRID — B&W style ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="stat-card-bw flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Adaptive Level</h3>
            <div className="text-gray-300"><Activity size={18} /></div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tighter text-black">{Math.floor(stats.adaptiveLevel)}</span>
            <span className="text-xl font-bold text-gray-300">.{(stats.adaptiveLevel % 1).toFixed(1).split('.')[1]}</span>
          </div>
        </div>

        <div className="stat-card-bw flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Active Nodes</h3>
            <div className="text-gray-300"><BookOpen size={18} /></div>
          </div>
          <p className="text-5xl font-black tracking-tighter text-black">{stats.activeCourses.toString().padStart(2, '0')}</p>
        </div>

        <div className="stat-card-bw flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Study Vectors</h3>
            <div className="text-gray-300"><BrainCircuit size={18} /></div>
          </div>
          <p className="text-5xl font-black tracking-tighter text-black">{stats.studyPlans.toString().padStart(2, '0')}</p>
        </div>

        <div className="stat-card-bw flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Skill Points</h3>
            <div className="text-gray-300"><Star size={18} /></div>
          </div>
          <p className="text-5xl font-black tracking-tighter text-black">{formatPoints(stats.skillPoints)}</p>
        </div>

      </section>

      {/* ===== RECENT ACTIVITY (Placeholder to fill space) ===== */}
      <section className="glass-card p-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-6">Recent Cognitive Activity</h3>
        <div className="space-y-4">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                    <Activity size={16} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-black">Neural Pathway Sync</h4>
                    <p className="text-xs text-gray-400">Checkpoint reached in Data Structures</p>
                 </div>
               </div>
               <span className="text-[10px] font-black text-gray-300 uppercase">2h ago</span>
             </div>
           ))}
        </div>
      </section>

    </div>
  );
}
