import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, BookOpen, Star, BrainCircuit, ArrowRight,
  Sparkles, Clock, TrendingUp, CheckCircle2, Zap, Target
} from 'lucide-react';
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

  const greetingByTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const isFirst = user?.user_metadata?.isFirstLogin !== false;
        setIsFirstLogin(isFirst);

        if (!isFirst) {
          const subtitles = [
            'Your learning engine is ready.',
            'Continue where you left off.',
            'Adaptive sync complete.',
            'Your progress awaits.',
          ];
          setWelcomeMessage(`${greetingByTime()}, ${firstName}!`);
          setSubtitle(subtitles[Math.floor(Math.random() * subtitles.length)]);
        }

        const [analyticsRes, personalizedRes] = await Promise.all([
          api.get('/progress/analytics').catch(() => null),
          api.get('/personalized').catch(() => null)
        ]);

        const analyticsData = analyticsRes?.data;
        const personalizedData = personalizedRes?.data?.materials || [];

        if (analyticsData?.summary) {
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
      console.error('Setup failed', error);
    }
  };

  const formatPoints = (points) => {
    if (points >= 1000) return (points / 1000).toFixed(1) + 'K';
    return points;
  };

  const statCards = [
    {
      label: 'Adaptive Level',
      value: stats.adaptiveLevel.toFixed(1),
      icon: <TrendingUp size={18} />,
      color: 'indigo',
      bg: '#EEF2FF',
      accent: '#4F46E5',
      border: '#4F46E5',
      desc: 'Performance score'
    },
    {
      label: 'Active Courses',
      value: stats.activeCourses.toString().padStart(2, '0'),
      icon: <BookOpen size={18} />,
      color: 'violet',
      bg: '#F5F3FF',
      accent: '#7C3AED',
      border: '#7C3AED',
      desc: 'Enrolled courses'
    },
    {
      label: 'Study Plans',
      value: stats.studyPlans.toString().padStart(2, '0'),
      icon: <Target size={18} />,
      color: 'teal',
      bg: '#F0FDFA',
      accent: '#0D9488',
      border: '#0D9488',
      desc: 'Personalized paths'
    },
    {
      label: 'Skill Points',
      value: formatPoints(stats.skillPoints),
      icon: <Zap size={18} />,
      color: 'amber',
      bg: '#FFFBEB',
      accent: '#D97706',
      border: '#D97706',
      desc: 'Points earned'
    },
  ];

  const recentActivities = [
    {
      icon: <CheckCircle2 size={15} />,
      title: 'Completed a quiz checkpoint',
      desc: 'Data Structures — Arrays & Pointers',
      time: '2h ago',
      iconBg: '#F0FDFA',
      iconColor: '#0D9488',
    },
    {
      icon: <BookOpen size={15} />,
      title: 'New lesson unlocked',
      desc: 'Algorithm Design — Dynamic Programming',
      time: '5h ago',
      iconBg: '#EEF2FF',
      iconColor: '#4F46E5',
    },
    {
      icon: <Star size={15} />,
      title: 'Skill milestone reached',
      desc: 'Earned 200 skill points this week',
      time: 'Yesterday',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
  ];

  const quickActions = [
    { label: 'Browse Courses',  icon: <BookOpen size={16} />,   path: '/dashboard/courses',      bg: '#EEF2FF', color: '#4F46E5' },
    { label: 'AI Tutor',        icon: <Sparkles size={16} />,   path: '/dashboard/personalized', bg: '#F0FDFA', color: '#0D9488' },
    { label: 'Track Progress',  icon: <Activity size={16} />,   path: '/dashboard/tracker',      bg: '#F5F3FF', color: '#7C3AED' },
    { label: 'View Analytics',  icon: <TrendingUp size={16} />, path: '/dashboard/analytics',    bg: '#FFFBEB', color: '#D97706' },
  ];

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-[3px] border-transparent animate-spin"
            style={{
              borderTopColor: '#4F46E5',
              borderLeftColor: '#4F46E5',
            }}
          />
          <p className="text-sm" style={{ color: '#777587' }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up w-full flex flex-col gap-8">

      {/* ===== HERO / WELCOME SECTION ===== */}
      <section
        className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-14 group card-luxe !bg-transparent !border-none"
      >
        {/* Deep Aura Background */}
        <div className="absolute inset-0 z-0 opacity-100" style={{ background: 'linear-gradient(135deg, #1A1070 0%, #3525CD 50%, #4F46E5 100%)' }} />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 blur-[120px] animate-floating" />
        <div className="absolute bottom-[-10%] right-[0%] w-[40%] h-[40%] rounded-full bg-teal-400/20 blur-[100px] animate-floating-slow" />

        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', right: '120px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
        }} />

        <div className="relative z-10 max-w-2xl">
          {isFirstLogin ? (
            <div className="space-y-6">
              <div>
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 glass-luxe !bg-white/10 !text-white/90 border-white/20"
                >
                  System Initialization
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter italic uppercase mb-6">
                  Initialize <span className="text-indigo-200">{firstName}</span>
                </h1>
                <p className="max-w-md text-sm font-semibold text-white/60 leading-relaxed uppercase tracking-wide">
                  Personalized learning engine standby. Begin synchronization protocol.
                </p>
              </div>
              <button
                onClick={handleStartSetup}
                className="btn-primary !bg-white !text-indigo-700 !shadow-2xl hover:scale-105"
              >
                Start Setup <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 glass-luxe !bg-white/10 !text-white/90 border-white/20"
                >
                  {subtitle.toUpperCase()}
                </span>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter italic uppercase mb-8">
                  {welcomeMessage.split(',')[0]} <br/> <span className="text-indigo-200">{firstName}</span>
                </h1>
                <p className="max-w-md text-xs font-black text-white/50 leading-relaxed uppercase tracking-[0.1em]">
                  {stats.activeCourses > 0
                    ? 'Spectral progress locked. Resuming active learning nodes.'
                    : 'System idle. Traverse the catalog to initialize your first node.'}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate('/dashboard/courses')}
                  className="btn-primary !bg-white !text-indigo-700 !shadow-2xl hover:scale-105"
                >
                  {stats.activeCourses > 0 ? 'RESUME SYNC' : 'EXPLORE NODES'} <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/dashboard/personalized')}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl glass-luxe !bg-white/10 !text-white/90 border-white/20 font-black text-[11px] uppercase tracking-widest hover:!bg-white/20 transition-all"
                >
                  <Sparkles size={18} className="text-indigo-200" /> Neural AI
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== STATS GRID ===== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="card-luxe !p-8 group hover:scale-[1.03]"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-80 transition-opacity">
                {card.label}
              </span>
              <div
                className="w-10 h-10 rounded-xl glass-luxe flex items-center justify-center glow-indigo transition-all"
                style={{ color: card.accent }}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-4xl font-black italic tracking-tighter text-black">
              {card.value}
            </p>
            <p className="text-[10px] mt-2 font-black uppercase tracking-widest opacity-30">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* ===== QUICK ACTIONS + RECENT ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div className="card-luxe !p-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-black opacity-40">
            Quick Hub
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start gap-4 p-5 rounded-2xl transition-all duration-300 glass-luxe border-indigo-50/50 hover:border-indigo-200 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center glow-indigo group-hover:scale-110 transition-transform"
                  style={{ color: action.color, background: 'white' }}
                >
                  {action.icon}
                </div>
                <span className="text-[11px] font-black uppercase tracking-tight text-black opacity-80">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 card-luxe !p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black opacity-40">
              System Logs
            </h3>
            <button
              onClick={() => navigate('/dashboard/analytics')}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:tracking-[0.2em] transition-all"
            >
              Log History →
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act, i) => (
              <div
                key={i}
                className="flex items-center gap-6 p-4 rounded-2xl glass-luxe border-indigo-50/30 hover:border-indigo-200 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 glow-indigo group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                  style={{ background: 'white', color: act.iconColor }}
                >
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase italic tracking-tight text-black">
                    {act.title}
                  </p>
                  <p className="text-xs font-semibold text-secondary opacity-60 leading-relaxed uppercase tracking-tighter">{act.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 opacity-40">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold">{act.time.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>

          {stats.activeCourses === 0 && (
            <div
              className="mt-4 flex items-center gap-3 p-4 rounded-xl"
              style={{ background: '#EEF2FF' }}
            >
              <BrainCircuit size={18} style={{ color: '#4F46E5', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: '#4F46E5' }}>
                Enroll in your first course to start tracking your real activity.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
