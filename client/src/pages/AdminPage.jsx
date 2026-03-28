import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ title: '', playlist_url: '', domain: '' });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [addError, setAddError] = useState(null);

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Admin';

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    fetchData();
  }, [isAdmin]);

  const getHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const [coursesRes, usersRes] = await Promise.all([
        axios.get('/api/admin/courses', { headers }).catch(() => axios.get('/api/courses', { headers })),
        axios.get('/api/admin/users', { headers }).catch(() => ({ data: [] })),
      ]);
      setCourses(coursesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to load admin data');
    }
    setLoading(false);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!form.title || !form.playlist_url) { setAddError('Title and Playlist URL are required.'); return; }
    setAdding(true);
    setAddError(null);
    try {
      const headers = await getHeaders();
      await axios.post('/api/admin/courses', form, { headers });
      setForm({ title: '', playlist_url: '', domain: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setAddError(err?.response?.data?.error || err.message || 'Failed to add course.');
    }
    setAdding(false);
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const headers = await getHeaders();
      await axios.delete(`/api/admin/courses/${id}`, { headers });
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Delete failed: ' + (err?.response?.data?.error || err.message));
    }
    setDeleting(null);
  };

  const tabs = [
    { id: 'courses', label: 'Courses',      icon: 'auto_stories',  count: courses.length },
    { id: 'users',   label: 'Users',         icon: 'group',         count: users.length   },
  ];

  return (
    <div className="space-y-6 cs-animate-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined material-symbols-filled text-[var(--cs-teal)]" style={{ fontSize: '20px' }}>admin_panel_settings</span>
            <span className="cs-badge cs-badge-teal">Admin</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--cs-text-primary)]">
            Welcome back, <span className="cs-text-gradient">{userName}</span>
          </h1>
          <p className="text-sm text-[var(--cs-text-secondary)] mt-1">Manage platform content and users</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="cs-btn-primary hidden sm:flex"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Course
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: courses.length,        icon: 'library_books',       color: 'var(--cs-purple-light)' },
          { label: 'Total Users',   value: users.length,          icon: 'group',               color: 'var(--cs-teal)'         },
          { label: 'Active Today',  value: users.filter(u => u.stats?.coursesEnrolled > 0).length, icon: 'trending_up', color: '#22d3ee' },
          { label: 'Avg Score',     value: users.length > 0 ? Math.round(users.reduce((a, u) => a + (u.stats?.avgQuizScore || 0), 0) / users.length) + '%' : '—', icon: 'bar_chart', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={s.label} className="cs-stat-card cs-animate-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <span className="material-symbols-outlined material-symbols-filled mb-2" style={{ color: s.color, fontSize: '22px' }}>{s.icon}</span>
            <div className="text-2xl font-black" style={{ color: s.color }}>
              {loading ? <span className="opacity-30">—</span> : s.value}
            </div>
            <div className="text-xs text-[var(--cs-text-muted)] font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <div className="cs-card-featured p-5 cs-animate-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="cs-section-title">Add New Course</h2>
            <button onClick={() => { setShowAddForm(false); setAddError(null); }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[var(--cs-text-muted)] text-xl">close</span>
            </button>
          </div>
          {addError && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}>
              <span className="material-symbols-outlined text-sm">error</span> {addError}
            </div>
          )}
          <form onSubmit={handleAddCourse} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--cs-text-muted)] mb-1">Course Title *</label>
                <input className="cs-input" placeholder="e.g., Machine Learning Basics" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--cs-text-muted)] mb-1">Domain</label>
                <input className="cs-input" placeholder="e.g., Data Science" value={form.domain}
                  onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--cs-text-muted)] mb-1">YouTube Playlist URL *</label>
              <input className="cs-input" placeholder="https://youtube.com/playlist?list=..." value={form.playlist_url}
                onChange={e => setForm(p => ({ ...p, playlist_url: e.target.value }))} required />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={adding} className="cs-btn-primary">
                <span className="material-symbols-outlined text-base">{adding ? 'hourglass_empty' : 'add'}</span>
                {adding ? 'Adding...' : 'Add Course'}
              </button>
              <button type="button" onClick={() => { setShowAddForm(false); setAddError(null); }} className="cs-btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}>
          <span className="material-symbols-outlined text-base">error</span>
          {String(error)}
          <button onClick={fetchData} className="ml-auto text-xs underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex items-center gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: 'rgba(124,58,237,0.1)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={activeTab === tab.id ? {
                background: 'linear-gradient(135deg, var(--cs-purple), var(--cs-purple-light))',
                color: 'white', boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
              } : { color: 'var(--cs-text-muted)' }}>
              <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(124,58,237,0.15)' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Courses Table */}
        {activeTab === 'courses' && (
          <div className="cs-card overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(124,58,237,0.05)' }} />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-[var(--cs-text-muted)] mb-3" style={{ fontSize: '48px' }}>library_books</span>
                <p className="text-[var(--cs-text-secondary)]">No courses yet.</p>
                <button onClick={() => setShowAddForm(true)} className="cs-btn-primary mt-4 mx-auto">
                  <span className="material-symbols-outlined text-base">add</span> Add First Course
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--cs-border-subtle)' }}>
                      {['Title', 'Category', 'Domain', 'Actions'].map(h => (
                        <th key={h} className="p-4 text-left text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--cs-text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course, i) => (
                      <tr key={course.id} className="transition-colors hover:bg-white/[0.02]"
                        style={{ borderBottom: i < courses.length - 1 ? '1px solid var(--cs-border-subtle)' : 'none' }}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.15)' }}>
                              <span className="material-symbols-outlined text-[var(--cs-purple-light)]" style={{ fontSize: '16px' }}>auto_stories</span>
                            </div>
                            <span className="text-sm font-semibold text-[var(--cs-text-primary)]">{course.title}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="cs-badge cs-badge-purple">{course.category || '—'}</span>
                        </td>
                        <td className="p-4 text-sm text-[var(--cs-text-muted)]">{course.domain || '—'}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            disabled={deleting === course.id}
                            className="p-2 rounded-lg transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}
                            title="Delete course"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              {deleting === course.id ? 'hourglass_empty' : 'delete'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="cs-card overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(124,58,237,0.05)' }} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-[var(--cs-text-muted)] mb-3" style={{ fontSize: '48px' }}>group</span>
                <p className="text-[var(--cs-text-secondary)]">No users registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--cs-border-subtle)' }}>
                      {['User', 'Email', 'Courses', 'Avg Score', 'Role'].map(h => (
                        <th key={h} className="p-4 text-left text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--cs-text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => {
                      const initials = u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || u.email?.substring(0, 2).toUpperCase() || '??';
                      return (
                        <tr key={u.id} className="transition-colors hover:bg-white/[0.02]"
                          style={{ borderBottom: i < users.length - 1 ? '1px solid var(--cs-border-subtle)' : 'none' }}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="cs-avatar">{initials}</div>
                              <span className="text-sm font-semibold text-[var(--cs-text-primary)]">{u.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-[var(--cs-text-muted)] truncate max-w-[180px]">{u.email}</td>
                          <td className="p-4 text-sm font-bold text-[var(--cs-purple-light)]">{u.stats?.coursesEnrolled ?? 0}</td>
                          <td className="p-4">
                            <span className="text-sm font-bold" style={{ color: (u.stats?.avgQuizScore ?? 0) >= 70 ? 'var(--cs-teal)' : 'var(--cs-text-muted)' }}>
                              {u.stats?.avgQuizScore ? `${u.stats.avgQuizScore}%` : '—'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`cs-badge ${u.role === 'admin' ? 'cs-badge-teal' : 'cs-badge-purple'}`}>
                              {u.role || 'student'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sm:hidden">
        <button onClick={() => setShowAddForm(true)} className="cs-btn-primary w-full justify-center">
          <span className="material-symbols-outlined text-base">add</span>
          Add New Course
        </button>
      </div>
    </div>
  );
}
