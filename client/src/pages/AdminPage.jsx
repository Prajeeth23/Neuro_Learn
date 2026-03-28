import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Shield, Plus, Trash2, BookOpen, Users, BarChart3, Loader2, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const DOMAINS = ['General', 'AI & Machine Learning', 'Web Development', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'Mobile Development', 'Game Development', 'DevOps'];

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  // Courses state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [newDomain, setNewDomain] = useState('General');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userPerformance, setUserPerformance] = useState({});
  const [perfLoading, setPerfLoading] = useState({});

  useEffect(() => {
    if (isAdmin) { fetchCourses(); }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) { fetchUsers(); }
  }, [activeTab]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data || []);
    } catch (err) {
      console.error('Error loading courses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserPerformance = async (userId) => {
    if (userPerformance[userId]) {
      setExpandedUser(expandedUser === userId ? null : userId);
      return;
    }
    setExpandedUser(userId);
    setPerfLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const { data } = await api.get(`/admin/users/${userId}/performance`);
      setUserPerformance(prev => ({ ...prev, [userId]: data }));
    } catch (err) {
      console.error('Error loading performance:', err);
    } finally {
      setPerfLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPlaylistUrl.trim()) {
      setError('Title and Playlist URL are required');
      return;
    }
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/courses', { title: newTitle, playlist_url: newPlaylistUrl, domain: newDomain });
      setSuccess(`Course "${newTitle}" created successfully! AI is generating the description.`);
      setNewTitle('');
      setNewPlaylistUrl('');
      setNewDomain('General');
      fetchCourses();
    } catch (err) {
      console.error('Failed to create course:', err);
      const errorData = err.response?.data?.error || err.message || 'Failed to create course';
      const errorMsg = typeof errorData === 'object' 
        ? (errorData.message || JSON.stringify(errorData)) 
        : errorData;
      setError(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      setCourses(courses.filter(c => c.id !== courseId));
      setSuccess(`Course "${courseTitle}" deleted.`);
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield size={48} className="mx-auto text-red-400/30 mb-4" />
        <p className="text-white/40">Access Denied</p>
      </div>
    );
  }

  const tabs = [
    { id: 'courses', label: 'Courses', icon: <BookOpen size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-20">
      <div className="mb-10 space-y-2">
        <h1 className="text-5xl font-black tracking-tighter text-white">
          Admin <span className="text-primary underline decoration-accent/30 underline-offset-8">Panel</span>
        </h1>
        <p className="text-white/40 font-medium tracking-widest uppercase text-xs">Manage platform</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-primary/10 text-primary border border-primary/30' 
                : 'bg-white/[0.03] text-white/40 border border-white/5 hover:bg-white/[0.06]'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 text-sm font-bold">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-6 text-sm font-bold">{success}</div>}

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="space-y-8">
          {/* Add Course Form */}
          <Card className="glass-card-premium p-8 neon-border-primary">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Plus size={20} className="text-primary" /> Add New Course
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Course Title</label>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Advanced Machine Learning"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Domain</label>
                    <select value={newDomain} onChange={e => setNewDomain(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none">
                      {DOMAINS.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">YouTube Playlist URL</label>
                  <input value={newPlaylistUrl} onChange={e => setNewPlaylistUrl(e.target.value)} placeholder="https://www.youtube.com/playlist?list=..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none" />
                </div>
                <button type="submit" disabled={creating} className="uiverse-btn !py-3 !px-8 flex items-center gap-2">
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {creating ? 'Creating (AI generating description)...' : 'Create Course'}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Course List */}
          <Card className="glass-card-premium p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black">All Courses ({courses.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 size={20} className="animate-spin mx-auto text-primary" />
                </div>
              ) : !Array.isArray(courses) || courses.length === 0 ? (
                <p className="text-white/30 text-center py-8">No courses yet. Create one above!</p>
              ) : (
                courses.map(course => (
                  <div key={course.id} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 group">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-white/80 truncate">{course.title}</span>
                        {course.domain && course.domain !== 'General' && (
                          <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent shrink-0">{course.domain}</span>
                        )}
                      </div>
                      <p className="text-xs text-white/30 line-clamp-1">{course.description}</p>
                    </div>
                    <button onClick={() => handleDelete(course.id, course.title)}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {usersLoading ? (
            <div className="text-center py-12">
              <Loader2 size={24} className="animate-spin mx-auto text-primary mb-3" />
              <p className="text-white/30 text-sm">Loading users...</p>
            </div>
          ) : !Array.isArray(users) || users.length === 0 ? (
            <p className="text-white/30 text-center py-12">No users found.</p>
          ) : (
            users.map(u => (
              <div key={u.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all">
                <button onClick={() => fetchUserPerformance(u.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all text-left">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-black shrink-0">
                      {(u.name || u.email || '??').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white/80 truncate">{u.name || 'Unknown'}</p>
                      <p className="text-xs text-white/30 truncate">{u.email}</p>
                    </div>
                    {u.domain_of_interest && (
                      <span className="hidden sm:inline text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">{u.domain_of_interest}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="hidden sm:flex gap-4 text-right">
                      <div>
                        <p className="text-lg font-black">{u.stats?.coursesEnrolled || 0}</p>
                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Courses</p>
                      </div>
                      <div>
                        <p className="text-lg font-black">{u.stats?.avgQuizScore || 0}%</p>
                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Avg Score</p>
                      </div>
                      <div>
                        <p className="text-lg font-black">{u.stats?.highestLevel || 3}★</p>
                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Level</p>
                      </div>
                    </div>
                    {expandedUser === u.id ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                  </div>
                </button>

                {/* Expanded Performance */}
                {expandedUser === u.id && (
                  <div className="px-5 pb-5 border-t border-white/5">
                    {perfLoading[u.id] ? (
                      <div className="text-center py-6"><Loader2 size={18} className="animate-spin mx-auto text-primary" /></div>
                    ) : userPerformance[u.id] ? (
                      <div className="pt-4 space-y-4">
                        {/* Course Progress */}
                        {userPerformance[u.id].progress?.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Course Progress</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {userPerformance[u.id].progress.map((p, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                  <span className="text-xs font-bold text-white/60 truncate mr-2">{p.course?.title || 'Course'}</span>
                                  <span className="text-xs font-black text-primary shrink-0">{p.level || 3}★</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Recent Quizzes */}
                        {userPerformance[u.id].quizResults?.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Recent Quizzes</h4>
                            <div className="flex gap-2 flex-wrap">
                              {userPerformance[u.id].quizResults.slice(0, 8).map((q, i) => (
                                <span key={i} className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                                  q.score >= 70 ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                  q.score >= 40 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                  {q.score}% · {q.quiz_type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Screen Time */}
                        {userPerformance[u.id].screenTime?.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Screen Time (last 14 days)</h4>
                            <p className="text-sm text-white/50">
                              Total: {Math.round(userPerformance[u.id].screenTime.reduce((s, st) => s + st.duration_seconds, 0) / 60)} minutes across {userPerformance[u.id].screenTime.length} sessions
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-white/30 py-4">No performance data available</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
