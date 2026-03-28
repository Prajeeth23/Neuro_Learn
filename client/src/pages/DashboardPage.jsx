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
        className="relative overflow-hidden rounded-2xl p-8 md:p-10"
        style={{
          background: 'linear-gradient(135deg, #3525CD 0%, #4F46E5 60%, #6D63F0 100%)',
          boxShadow: '0 8px 32px rgba(79, 70, 229, 0.25)',
        }}
      >
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
            <div className="space-y-5">
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
                >
                  Welcome Onboard
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ letterSpacing: '-0.02em' }}>
                  Welcome, <span style={{ color: '#C3C0FF' }}>{firstName}</span> 👋
                </h1>
                <p className="mt-3 text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Let's set up your personalized learning journey. It only takes a minute.
                </p>
              </div>
              <button
                onClick={handleStartSetup}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: '#ffffff',
                  color: '#4F46E5',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
              >
                Start Setup <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
                >
                  {subtitle}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ letterSpacing: '-0.02em' }}>
                  {welcomeMessage}
                </h1>
                <p className="mt-3 text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {stats.activeCourses > 0
                    ? 'Your progress is on track. Continue your active courses below.'
                    : 'Everything is ready. Start your first course to begin learning.'}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => navigate('/dashboard/courses')}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    background: '#ffffff',
                    color: '#4F46E5',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                >
                  {stats.activeCourses > 0 ? 'Resume Learning' : 'Explore Courses'} <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/dashboard/personalized')}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  <Sparkles size={16} /> Ask AI Tutor
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== STATS GRID ===== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="animate-fade-in-up"
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '20px 22px',
              boxShadow: '0 1px 3px rgba(25,28,30,0.06)',
              borderLeft: `4px solid ${card.border}`,
              cursor: 'default',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(25,28,30,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(25,28,30,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#777587' }}>
                {card.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: card.bg, color: card.accent }}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: '#191C1E', letterSpacing: '-0.02em' }}>
              {card.value}
            </p>
            <p className="text-xs mt-1" style={{ color: '#777587' }}>{card.desc}</p>
          </div>
        ))}
      </section>

      {/* ===== QUICK ACTIONS + RECENT ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(25,28,30,0.06)',
          }}
        >
          <h3 className="text-sm font-semibold mb-5" style={{ color: '#191C1E', letterSpacing: '-0.01em' }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start gap-3 p-4 rounded-xl transition-all duration-150 text-left border-none cursor-pointer"
                style={{ background: '#F8FAFC' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = action.bg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F8FAFC';
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: action.bg, color: action.color }}
                >
                  {action.icon}
                </div>
                <span className="text-xs font-semibold" style={{ color: '#191C1E', letterSpacing: '-0.01em' }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="lg:col-span-2"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(25,28,30,0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold" style={{ color: '#191C1E', letterSpacing: '-0.01em' }}>
              Recent Activity
            </h3>
            <button
              onClick={() => navigate('/dashboard/analytics')}
              className="text-xs font-medium transition-colors"
              style={{ color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              View all
            </button>
          </div>

          <div className="space-y-1">
            {recentActivities.map((act, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: act.iconBg, color: act.iconColor }}
                >
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#191C1E', letterSpacing: '-0.01em' }}>
                    {act.title}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#777587' }}>{act.desc}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock size={11} style={{ color: '#C7C4D8' }} />
                  <span className="text-[11px]" style={{ color: '#C7C4D8' }}>{act.time}</span>
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
