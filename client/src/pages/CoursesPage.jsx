import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../lib/supabase';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'In Progress', 'Completed', 'Not Started'];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const session = (await supabase.auth.getSession()).data.session;
        const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};
        const [coursesRes, progressRes] = await Promise.all([
          axios.get('/api/courses', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/progress', { headers }).catch(() => ({ data: [] })),
        ]);
        setCourses(coursesRes.data || []);
        const progressMap = {};
        (progressRes.data || []).forEach(p => { progressMap[p.course_id] = p; });
        setUserProgress(progressMap);
      } catch (_) {}
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const getCourseProgress = (courseId) => userProgress[courseId]?.level
    ? Math.min((userProgress[courseId].level / 10) * 100, 100)
    : 0;

  const getStatusBadge = (courseId) => {
    const p = userProgress[courseId];
    if (!p) return { label: 'Not Started', color: 'var(--cs-text-muted)', bg: 'rgba(122,106,154,0.15)', border: 'rgba(122,106,154,0.25)' };
    if (p.completed) return { label: 'Completed', color: 'var(--cs-teal)', bg: 'rgba(6,214,160,0.15)', border: 'rgba(6,214,160,0.25)' };
    return { label: 'In Progress', color: 'var(--cs-purple-light)', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.25)' };
  };

  const filteredCourses = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === 'All') return true;
    const status = getStatusBadge(c.id).label;
    return status === activeFilter;
  });

  const categoryIconMap = {
    'Machine Learning': 'smart_toy',
    'Data Science': 'analytics',
    'Web Development': 'code',
    'Python': 'terminal',
    'Mathematics': 'calculate',
    'General': 'auto_stories',
  };

  const getCategoryIcon = (cat) => categoryIconMap[cat] || 'auto_stories';

  const gradients = [
    'linear-gradient(135deg, rgba(124,58,237,0.7) 0%, rgba(79,70,229,0.5) 100%)',
    'linear-gradient(135deg, rgba(6,214,160,0.6) 0%, rgba(34,211,238,0.4) 100%)',
    'linear-gradient(135deg, rgba(251,191,36,0.6) 0%, rgba(245,158,11,0.4) 100%)',
    'linear-gradient(135deg, rgba(244,63,94,0.5) 0%, rgba(168,85,247,0.4) 100%)',
  ];

  return (
    <div className="space-y-6 cs-animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[var(--cs-text-primary)]">My Courses</h1>
        <p className="text-sm text-[var(--cs-text-secondary)] mt-1">Continue your personalized learning journey</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cs-text-muted)] text-xl pointer-events-none">search</span>
          <input
            className="cs-input pl-10"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={activeFilter === f ? {
                background: 'linear-gradient(135deg, var(--cs-purple), var(--cs-purple-light))',
                color: 'white',
                boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
              } : {
                background: 'rgba(124,58,237,0.1)',
                color: 'var(--cs-text-secondary)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="cs-card h-52 animate-pulse" style={{ background: 'rgba(124,58,237,0.05)' }} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="cs-card p-12 text-center">
          <span className="material-symbols-outlined text-[var(--cs-text-muted)] mb-3" style={{ fontSize: '48px' }}>library_books</span>
          <p className="text-[var(--cs-text-secondary)] font-semibold">
            {searchQuery ? 'No courses match your search.' : 'No courses available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course, i) => {
            const progress = getCourseProgress(course.id);
            const status = getStatusBadge(course.id);
            const gradient = gradients[i % gradients.length];
            return (
              <div
                key={course.id}
                className="cs-card overflow-hidden cursor-pointer cs-animate-in group"
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => navigate(`/dashboard/courses/${course.id}`)}
              >
                {/* Header Banner */}
                <div className="h-28 relative flex items-end p-4" style={{ background: gradient }}>
                  <div className="absolute top-3 right-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <span className="material-symbols-outlined material-symbols-filled text-white text-xl">
                      {getCategoryIcon(course.category)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="font-bold text-[var(--cs-text-primary)] leading-tight mb-1 group-hover:text-[var(--cs-purple-light)] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[var(--cs-text-muted)] mb-3 line-clamp-2">
                    {course.description || 'Enhance your skills with this comprehensive course.'}
                  </p>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[var(--cs-text-muted)] font-medium">Progress</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--cs-teal)' }}>{Math.round(progress)}%</span>
                    </div>
                    <div className="cs-progress-bar">
                      <div className="cs-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--cs-text-muted)', border: '1px solid rgba(124,58,237,0.15)' }}
                    >
                      {course.category || 'General'}
                    </span>
                    <button className="text-xs font-bold flex items-center gap-1 transition-colors"
                      style={{ color: 'var(--cs-teal)' }}>
                      {progress > 0 ? 'Continue' : 'Start'}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
