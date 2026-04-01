import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Shield, Plus, Trash2, BookOpen, Users, BarChart3, Loader2, ChevronDown, ChevronUp, Brain, ArrowRight } from 'lucide-react';
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
      setError(err.response?.data?.error || err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users', err);
      setError(err.response?.data?.error || err.message || 'Failed to load users');
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
      setError(err.response?.data?.error || err.message || 'Failed to create course');
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
      <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-red-200">
        <Shield size={64} className="mx-auto text-red-100 mb-6" />
        <p className="text-slate-400 font-bold text-xl uppercase tracking-widest leading-none">Security Lockdown</p>
        <p className="text-slate-400 mt-2">Administrative credentials required to access this protocol.</p>
        <button className="btn-primary mt-8" onClick={() => window.location.href='/dashboard'}>Return to Safety</button>
      </div>
    );
  }

  const tabs = [
    { id: 'courses', label: 'Curricula', icon: <BookOpen size={18} /> },
    { id: 'users', label: 'Scholars', icon: <Users size={18} /> },
  ];

  return (
    <div className="animate-fade-in w-full mb-20">
      <div className="mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Authority Node</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">
          Platform <span className="text-primary italic">Governance</span>
        </h1>
        <p className="text-slate-500 font-medium">Configure neural pathways and monitor scholar performance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 relative whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/30 hover:text-primary shadow-sm'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold mb-8 flex items-center gap-3">
          <Shield size={18} className="shrink-0" />
          <span>{typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 text-green-600 rounded-2xl p-4 mb-8 text-sm font-bold flex items-center gap-3">
           <Shield size={18} className="shrink-0" />
           <span>{success}</span>
        </div>
      )}

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="space-y-10">
          {/* Add Course Form */}
          <Card className="surface-elevated p-8 md:p-10 !rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Plus size={24} className="text-primary" />
                </div>
                Draft New Curriculum
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Path Title</label>
                    <input 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)} 
                      placeholder="e.g. Advanced Machine Learning"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Intellectual Domain</label>
                    <select 
                      value={newDomain} 
                      onChange={e => setNewDomain(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">YouTube Playlist Reference</label>
                  <input 
                    value={newPlaylistUrl} 
                    onChange={e => setNewPlaylistUrl(e.target.value)} 
                    placeholder="https://www.youtube.com/playlist?list=..."
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={creating} 
                  className="btn-primary !px-10 !py-4 group"
                >
                  {creating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}
                  {creating ? 'Synthesizing Path...' : 'Deploy Curriculum'}
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Course List */}
          <Card className="surface-elevated overflow-hidden !rounded-[2.5rem]">
            <CardHeader className="p-8 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-900">Active Curricula Archive</CardTitle>
              <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1.5">{courses.length} Paths</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-20">
                  <Loader2 size={32} className="animate-spin mx-auto text-primary opacity-20" />
                </div>
              ) : !Array.isArray(courses) || courses.length === 0 ? (
                <div className="text-center py-20 px-8">
                   <BookOpen size={48} className="mx-auto text-slate-100 mb-4" />
                   <p className="text-slate-400 font-bold">The archive is currently empty</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all group">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-slate-900 truncate text-lg group-hover:text-primary transition-colors">{course.title}</span>
                          <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary shrink-0">{course.domain || 'General'}</span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1">{course.description || 'Neural link active. Description pending.'}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(course.id, course.title)}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:shadow-md transition-all sm:opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SCHOLARS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          {usersLoading ? (
            <div className="text-center py-32">
              <Loader2 size={32} className="animate-spin mx-auto text-primary opacity-20" />
            </div>
          ) : !Array.isArray(users) || users.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
               <Users size={48} className="mx-auto text-slate-100 mb-4" />
               <p className="text-slate-400 font-bold">No scholars currently enrolled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map(u => (
                <Card key={u.id} className="surface-elevated overflow-hidden !rounded-3xl hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-slate-200/50">
                  <button 
                    onClick={() => fetchUserPerformance(u.id)}
                    className="w-full flex flex-col sm:flex-row items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-6 min-w-0 flex-1 w-full mb-6 sm:mb-0">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-primary flex items-center justify-center text-lg font-bold shrink-0 shadow-sm shadow-slate-100">
                        {(u.name || u.email || '??').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate text-xl">{u.name || 'Anonymous Scholar'}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-slate-400 truncate">{u.email}</p>
                          {u.domain_of_interest && (
                            <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-secondary/5 border border-secondary/10 text-secondary">{u.domain_of_interest}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-10 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex gap-8 text-right">
                        <div>
                          <p className="text-2xl font-black text-slate-900 leading-none mb-1">{u.stats?.coursesEnrolled || 0}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Paths</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-primary leading-none mb-1">{u.stats?.avgQuizScore || 0}%</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Cognition</p>
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                        {expandedUser === u.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedUser === u.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                      >
                        <div className="p-8 space-y-8">
                          {perfLoading[u.id] ? (
                            <div className="text-center py-12"><Loader2 size={24} className="animate-spin mx-auto text-primary opacity-30" /></div>
                          ) : userPerformance[u.id] ? (
                            <div className="space-y-10">
                              {/* Course Progress */}
                              {userPerformance[u.id].progress?.length > 0 && (
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-l-2 border-primary pl-3">Neural Advancement</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {userPerformance[u.id].progress.map((p, i) => (
                                      <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                                        <span className="text-sm font-bold text-slate-700 truncate mr-4">{p.course?.title || 'Unknown Path'}</span>
                                        <Badge className="bg-primary/5 text-primary border-none font-bold">Level {p.level || 1}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Recent Quizzes */}
                              {userPerformance[u.id].quizResults?.length > 0 && (
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-l-2 border-secondary pl-3">Diagnostic Ledger</h4>
                                  <div className="flex gap-2 flex-wrap">
                                    {userPerformance[u.id].quizResults.slice(0, 10).map((q, i) => (
                                      <div key={i} className={`text-xs font-bold px-4 py-2 rounded-2xl border-2 flex items-center gap-2 shadow-sm ${
                                        q.score >= 70 ? 'bg-green-50 border-green-100 text-green-700' :
                                        q.score >= 40 ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                        'bg-red-50 border-red-100 text-red-700'
                                      }`}>
                                        <span className="opacity-50">{q.score}%</span>
                                        <div className="w-1 h-1 rounded-full bg-current opacity-30"></div>
                                        <span>{q.quiz_type}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Summary Info */}
                              <div className="flex flex-wrap gap-10 pt-4 border-t border-slate-200/50">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Neural Input</p>
                                  <p className="text-xl font-bold text-slate-900">
                                    {Math.round(userPerformance[u.id].screenTime?.reduce((s, st) => s + st.duration_seconds, 0) / 60) || 0} min
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Engagement Sessions</p>
                                  <p className="text-xl font-bold text-slate-900">{userPerformance[u.id].screenTime?.length || 0}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                              <p className="text-slate-400 font-medium">No performance telemetry available for this scholar</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
