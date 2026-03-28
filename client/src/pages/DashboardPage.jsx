import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Scholar';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = (await import('../lib/supabase')).supabase.auth.getSession
          ? (await (await import('../lib/supabase')).supabase.auth.getSession()).data.session?.access_token
          : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [coursesRes, analyticsRes] = await Promise.all([
          axios.get('/api/courses', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/progress/analytics', { headers }).catch(() => ({ data: null })),
        ]);
        setCourses(coursesRes.data?.slice(0, 3) || []);
        setAnalytics(analyticsRes.data);
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Courses In Progress', value: analytics?.coursesInProgress ?? '—', icon: 'play_circle', color: 'var(--cs-purple-light)' },
    { label: 'Completed Courses',   value: analytics?.completedCourses  ?? '—', icon: 'task_alt',    color: 'var(--cs-teal)'         },
    { label: 'Learning Streak',     value: analytics?.streak            ? `${analytics.streak}d` : '—', icon: 'local_fire_department', color: '#f59e0b' },
    { label: 'Cognitive Score',     value: analytics?.cognitiveScore    ?? 84,  icon: 'psychology',   color: 'var(--cs-cyan)'         },
  ];

  const recommendations = [
    { type: 'Continue',       icon: 'play_circle',     color: 'var(--cs-purple-light)', label: 'Continue: Neural Networks Basics',   desc: "You left off at Backpropagation. Pick up right where you started to keep the flow." },
    { type: 'Revise',         icon: 'refresh',          color: '#f59e0b',               label: 'Revise: Matrix Multiplication',       desc: 'Your performance in the last quiz dropped here. AI suggests a 10-minute refresher.' },
    { type: 'Adaptive Test',  icon: 'quiz',             color: 'var(--cs-teal)',         label: 'Adaptive Test: Phase 4',             desc: "Ready for Next Assessment? Based on your mastery, we've unlocked the next tier of tests." },
  ];

  return (
    <div className="space-y-8 cs-animate-in">
      {/* ===== WELCOME HEADER ===== */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--cs-text-primary)] leading-tight">
              Welcome back, <span className="cs-text-gradient">{userName}</span>
            </h1>
            <p className="text-sm text-[var(--cs-text-secondary)] mt-1.5">
              Your cognitive capacity is up 12% this week. Keep the momentum.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/courses')}
            className="cs-btn-teal hidden sm:flex flex-shrink-0"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Explore Courses
          </button>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="cs-stat-card cs-animate-in" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="flex items-center justify-between mb-3">
              <span
                className="material-symbols-outlined material-symbols-filled"
                style={{ color: stat.color, fontSize: '22px' }}
              >
                {stat.icon}
              </span>
              <span className="text-xs text-[var(--cs-text-muted)] font-semibold">{loading ? '...' : ''}</span>
            </div>
            <div className="text-2xl md:text-3xl font-black" style={{ color: stat.color }}>
              {loading ? <span className="opacity-30">—</span> : stat.value}
            </div>
            <div className="text-xs font-medium text-[var(--cs-text-muted)] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ===== MAIN GRID: Charts + Recommendations ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Learning Velocity */}
        <div className="lg:col-span-2 cs-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="cs-section-title">Weekly Learning Velocity</h2>
            <span className="cs-badge cs-badge-teal">This Week</span>
          </div>
          {/* Mini Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-28">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const heights = [45, 70, 55, 85, 60, 40, 90];
              const isToday = i === new Date().getDay() - 1;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${heights[i]}%`,
                      background: isToday
                        ? 'linear-gradient(180deg, var(--cs-teal) 0%, rgba(6,214,160,0.3) 100%)'
                        : 'linear-gradient(180deg, rgba(124,58,237,0.7) 0%, rgba(124,58,237,0.15) 100%)',
                      boxShadow: isToday ? '0 0 12px rgba(6,214,160,0.5)' : 'none',
                    }}
                  />
                  <span className="text-[10px] font-semibold" style={{ color: isToday ? 'var(--cs-teal)' : 'var(--cs-text-muted)' }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Mastery */}
        <div className="cs-card p-5">
          <h2 className="cs-section-title mb-4">Skill Mastery</h2>
          <div className="space-y-4">
            {[
              { skill: 'Machine Learning', pct: 72, color: 'var(--cs-purple-light)' },
              { skill: 'Linear Algebra',   pct: 58, color: 'var(--cs-teal)'         },
              { skill: 'Python',           pct: 88, color: '#22d3ee'                },
              { skill: 'Statistics',       pct: 44, color: '#f59e0b'                },
            ].map((item) => (
              <div key={item.skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--cs-text-secondary)]">{item.skill}</span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.pct}%</span>
                </div>
                <div className="cs-progress-bar">
                  <div className="cs-progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ADAPTIVE RECOMMENDATIONS ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="cs-section-title">Adaptive Learning Recommendations</h2>
          <button className="cs-badge cs-badge-purple hover:opacity-80 transition-opacity cursor-pointer">AI-Powered</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div
              key={rec.label}
              className="cs-card p-5 cursor-pointer cs-animate-in"
              style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
              onClick={() => navigate('/dashboard/courses')}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined material-symbols-filled" style={{ color: rec.color, fontSize: '20px' }}>
                  {rec.icon}
                </span>
                <span className="cs-badge" style={{ background: `${rec.color}20`, color: rec.color, border: `1px solid ${rec.color}30` }}>
                  {rec.type}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--cs-text-primary)] mb-2 leading-tight">{rec.label}</h3>
              <p className="text-xs text-[var(--cs-text-muted)] leading-relaxed">{rec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RECENT COURSES ===== */}
      {courses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="cs-section-title">Your Courses</h2>
            <button onClick={() => navigate('/dashboard/courses')} className="text-xs font-semibold text-[var(--cs-purple-light)] hover:text-[var(--cs-teal)] transition-colors flex items-center gap-1">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, i) => (
              <div
                key={course.id}
                className="cs-card p-5 cursor-pointer cs-animate-in"
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => navigate(`/dashboard/courses/${course.id}`)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,58,237,0.2)' }}>
                    <span className="material-symbols-outlined material-symbols-filled text-[var(--cs-purple-light)] text-lg">auto_stories</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[var(--cs-text-primary)] truncate leading-tight">{course.title}</h3>
                    <p className="text-xs text-[var(--cs-text-muted)] mt-0.5">{course.category || 'General'}</p>
                  </div>
                </div>
                <div className="cs-progress-bar">
                  <div className="cs-progress-fill" style={{ width: `${Math.floor(Math.random() * 60 + 20)}%` }} />
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-xs font-semibold text-[var(--cs-teal)]">Continue →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
