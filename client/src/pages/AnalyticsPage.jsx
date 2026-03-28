import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const session = (await supabase.auth.getSession()).data.session;
        const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};
        const res = await axios.get('/api/progress/analytics', { headers });
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Failed to load analytics');
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const screenTime = data?.screenTimeThisWeek || [45, 90, 60, 120, 80, 40, 100];
  const maxTime = Math.max(...screenTime, 1);

  const statCards = [
    { label: 'Courses Enrolled',  value: data?.totalCourses      ?? '—', icon: 'library_books',      color: 'var(--cs-purple-light)' },
    { label: 'Completed',         value: data?.completedCourses  ?? '—', icon: 'task_alt',           color: 'var(--cs-teal)'         },
    { label: 'Avg Quiz Score',    value: data?.avgQuizScore      ? `${Math.round(data.avgQuizScore)}%` : '—', icon: 'bar_chart', color: '#22d3ee' },
    { label: 'Study Streak',      value: data?.streak            ? `${data.streak}d` : '—', icon: 'local_fire_department', color: '#f59e0b' },
  ];

  if (error) return (
    <div className="cs-card p-6 flex items-center gap-3 cs-animate-in" style={{ borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
      <span className="material-symbols-outlined text-red-400">error</span>
      <p className="text-sm text-red-400 font-medium">{String(error)}</p>
    </div>
  );

  return (
    <div className="space-y-6 cs-animate-in">
      <div>
        <h1 className="text-2xl font-black text-[var(--cs-text-primary)]">Analytics Dashboard</h1>
        <p className="text-sm text-[var(--cs-text-secondary)] mt-1">Track your cognitive growth and learning patterns</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={s.label} className="cs-stat-card cs-animate-in" style={{ animationDelay: `${i * 0.07}s` }}>
            <span className="material-symbols-outlined material-symbols-filled mb-2" style={{ color: s.color, fontSize: '24px' }}>{s.icon}</span>
            <div className="text-2xl font-black" style={{ color: s.color }}>
              {loading ? <span className="opacity-30">—</span> : s.value}
            </div>
            <div className="text-xs text-[var(--cs-text-muted)] font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Learning time chart */}
      <div className="cs-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="cs-section-title">Weekly Study Time</h2>
          <span className="cs-badge cs-badge-purple">This Week</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-36">
          {weekDays.map((day, i) => {
            const h = (screenTime[i] / maxTime) * 100;
            const isToday = i === (new Date().getDay() + 6) % 7;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: isToday ? 'var(--cs-teal)' : 'var(--cs-text-muted)' }}>
                  {Math.round(screenTime[i])}m
                </span>
                <div className="w-full rounded-t-lg transition-all duration-700" style={{
                  height: `${h}%`,
                  background: isToday
                    ? 'linear-gradient(180deg, var(--cs-teal) 0%, rgba(6,214,160,0.2) 100%)'
                    : 'linear-gradient(180deg, rgba(124,58,237,0.7) 0%, rgba(124,58,237,0.1) 100%)',
                  boxShadow: isToday ? '0 0 16px rgba(6,214,160,0.5)' : undefined,
                  minHeight: '4px',
                }} />
                <span className="text-[10px] font-semibold" style={{ color: isToday ? 'var(--cs-teal)' : 'var(--cs-text-muted)' }}>{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cs-card p-5">
          <h2 className="cs-section-title mb-4">Recent Quiz Results</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(124,58,237,0.05)' }} />
              ))}
            </div>
          ) : (data?.recentQuizzes?.length > 0 ? (
            <div className="space-y-3">
              {data.recentQuizzes.slice(0, 5).map((q, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: q.score >= 70 ? 'rgba(6,214,160,0.15)' : 'rgba(244,63,94,0.15)' }}>
                    <span className="material-symbols-outlined text-sm"
                      style={{ color: q.score >= 70 ? 'var(--cs-teal)' : '#f43f5e', fontSize: '16px' }}>
                      {q.score >= 70 ? 'check_circle' : 'warning'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[var(--cs-text-primary)] truncate">{q.course_title || 'Quiz'}</div>
                    <div className="cs-progress-bar mt-1">
                      <div className="cs-progress-fill" style={{ width: `${q.score}%`, background: q.score >= 70 ? 'var(--cs-teal)' : '#f43f5e' }} />
                    </div>
                  </div>
                  <div className="text-sm font-black" style={{ color: q.score >= 70 ? 'var(--cs-teal)' : '#f43f5e' }}>{q.score}%</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-[var(--cs-text-muted)] mb-2" style={{ fontSize: '36px' }}>quiz</span>
              <p className="text-sm text-[var(--cs-text-muted)]">No quiz results yet. Start a course to begin!</p>
            </div>
          ))}
        </div>

        {/* Course Progress */}
        <div className="cs-card p-5">
          <h2 className="cs-section-title mb-4">Course Progress</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(124,58,237,0.05)' }} />
              ))}
            </div>
          ) : (data?.courseProgress?.length > 0 ? (
            <div className="space-y-4">
              {data.courseProgress.slice(0, 5).map((c, i) => {
                const pct = c.progress_pct || Math.min((c.level / 10) * 100, 100) || 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-[var(--cs-text-secondary)] truncate max-w-[70%]">{c.course_title || c.title || `Course ${i + 1}`}</span>
                      <span className="text-xs font-black" style={{ color: 'var(--cs-purple-light)' }}>{Math.round(pct)}%</span>
                    </div>
                    <div className="cs-progress-bar">
                      <div className="cs-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-[var(--cs-text-muted)] mb-2" style={{ fontSize: '36px' }}>auto_stories</span>
              <p className="text-sm text-[var(--cs-text-muted)]">Enroll in courses to track progress.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
