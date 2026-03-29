import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Shield, Plus, Trash2, BookOpen, Users, BarChart3, Loader2, ChevronDown, ChevronUp, Eye, Search, Layers, ShieldCheck, UserCircle2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

const DOMAINS = ['General', 'AI & Machine Learning', 'Web Development', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'Mobile Development', 'Game Development', 'DevOps'];

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [newDomain, setNewDomain] = useState('General');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userPerformance, setUserPerformance] = useState({});
  const [perfLoading, setPerfLoading] = useState({});

  useEffect(() => { if (isAdmin) { fetchCourses(); } }, [isAdmin]);
  useEffect(() => { if (activeTab === 'users' && users.length === 0) { fetchUsers(); } }, [activeTab]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load courses');
    } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setUsersLoading(true); setError('');
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load users');
    } finally { setUsersLoading(false); }
  };

  const fetchUserPerformance = async (userId) => {
    if (userPerformance[userId]) { setExpandedUser(expandedUser === userId ? null : userId); return; }
    setExpandedUser(userId);
    setPerfLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const { data } = await api.get(`/admin/users/${userId}/performance`);
      setUserPerformance(prev => ({ ...prev, [userId]: data }));
    } catch (err) { console.error('Error loading performance:', err); } finally { setPerfLoading(prev => ({ ...prev, [userId]: false })); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPlaylistUrl.trim()) { setError('Title and Playlist URL required'); return; }
    setCreating(true); setError(''); setSuccess('');
    try {
      await api.post('/admin/courses', { title: newTitle, playlist_url: newPlaylistUrl, domain: newDomain });
      setSuccess(`Course "${newTitle}" synchronized. AI indexing active.`);
      setNewTitle(''); setNewPlaylistUrl(''); setNewDomain('General');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create course');
    } finally { setCreating(false); }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      setCourses(courses.filter(c => c.id !== courseId));
      setSuccess(`Course "${courseTitle}" removed.`);
    } catch (err) { setError('Failed to delete course'); }
  };

  if (!isAdmin) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-6 grayscale opacity-30">
        <Shield size={64} className="text-black" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Administrative Access Required</p>
      </div>
    );
  }

  const tabs = [
    { id: 'courses', label: 'DOMAIN CONTROL', icon: <BookOpen size={14} /> },
    { id: 'users', label: 'USER LEDGER', icon: <Users size={14} /> },
  ];

  return (
    <div className="animate-fade-in-up w-full mb-32 space-y-12">
      <div className="flex items-end justify-between border-b border-indigo-50/30 pb-10">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase italic leading-none">
            Control <span className="text-indigo-600">Phase</span>
          </h1>
          <p className="text-indigo-900/40 text-[11px] font-black tracking-[0.4em] uppercase ml-1">Universal Platform Override / Administrative Matrix</p>
        </div>
        {!isAdmin && (
           <div className="px-6 py-3 glass-luxe bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3">
              <Shield size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">ACCESS RESTRICTED</span>
           </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex p-2 glass-luxe !bg-white/40 border-indigo-50/50 rounded-[2rem] max-w-sm">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'glass-luxe bg-black text-white glow-indigo shadow-2xl' 
                : 'text-indigo-900/40 hover:text-indigo-900'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="glass-luxe bg-rose-50 border-rose-200 text-rose-800 p-8 rounded-[3rem] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-6 shadow-2xl animate-scale-in">
           <Shield size={24} /> ERROR OVERRIDE: {typeof error === 'object' ? error.message : error}
        </div>
      )}
      {success && (
        <div className="glass-luxe bg-emerald-50 border-emerald-200 text-emerald-800 p-8 rounded-[3rem] text-[11px] font-black uppercase tracking-widest text-center shadow-2xl glow-teal animate-scale-in">
           SYNCHRONIZATION SUCCESSFUL: {success}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-12">
          {/* Add Course Matrix */}
          <Card className="card-luxe p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] grayscale pointer-events-none group-hover:scale-110 transition-transform duration-700"><Plus size={300} /></div>
             <div className="flex items-center gap-6 mb-12 pb-8 border-b border-indigo-50/50 relative z-10">
                <div className="w-14 h-14 rounded-2xl glass-luxe bg-black text-white flex items-center justify-center glow-indigo"><Plus size={24} /></div>
                <div>
                   <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter leading-none">Register New Domain</h3>
                   <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40 mt-1">Initialize learning node registration</p>
                </div>
             </div>
             
             <form onSubmit={handleCreate} className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Domain Title</label>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="NETWORKS 101"
                      className="input-glass !h-14 uppercase" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Classification</label>
                    <select value={newDomain} onChange={e => setNewDomain(e.target.value)}
                      className="input-glass !h-14 uppercase">
                      {DOMAINS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Source Vector (Playlist URL)</label>
                  <input value={newPlaylistUrl} onChange={e => setNewPlaylistUrl(e.target.value)} placeholder="HTTPS://..."
                    className="input-glass !h-14" />
                </div>
                <button type="submit" disabled={creating} className="btn-primary !py-5 shadow-2xl flex items-center justify-center gap-6 w-full md:w-auto md:px-20">
                  {creating ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                  <span className="text-[12px] uppercase font-black tracking-[0.2em]">{creating ? 'SYNCHRONIZING...' : 'INITIALIZE REGISTER'}</span>
                </button>
             </form>
          </Card>

          <div className="space-y-10">
             <div className="space-y-2">
                <h3 className="text-4xl font-black italic tracking-tighter text-black uppercase">Active Nodes</h3>
                <p className="text-[11px] font-black tracking-[0.4em] text-indigo-900/40 uppercase">SYNCHRONIZED DOMAINS: {courses.length}</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? <div className="col-span-full py-40 grayscale opacity-40 flex justify-center"><Loader2 size={48} className="animate-spin text-black" /></div> :
                  !courses.length ? <div className="col-span-full py-40 glass-luxe !bg-white/40 border-indigo-100/30 rounded-[3rem] shadow-sm flex flex-col items-center justify-center space-y-6">
                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-900/40 italic">Null Node Matrix</p>
                  </div> :
                  courses.map(course => (
                    <div key={course.id} className="card-luxe !p-10 flex group hover:scale-[1.03] transition-all relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] grayscale pointer-events-none group-hover:opacity-10 transition-opacity"><Layers size={140} /></div>
                       <div className="flex-1 min-w-0 mr-16 relative z-10">
                          <div className="flex flex-wrap items-center gap-4 mb-6">
                             <h4 className="text-2xl font-black text-black uppercase italic tracking-tighter leading-none group-hover:text-indigo-600 transition-colors truncate max-w-[240px]">{course.title}</h4>
                             {course.domain && course.domain !== 'General' && (
                               <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl glass-luxe bg-indigo-50 text-indigo-600 border-indigo-100">{course.domain}</span>
                             )}
                          </div>
                          <p className="text-[11px] text-secondary opacity-40 font-black leading-relaxed uppercase tracking-tighter italic line-clamp-2">{course.description}</p>
                       </div>
                       <button onClick={() => handleDelete(course.id, course.title)}
                         className="absolute right-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl glass-luxe bg-white border-indigo-50 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 text-indigo-900/20 transition-all z-10 flex items-center justify-center">
                         <Trash2 size={20} />
                       </button>
                    </div>
                  ))
                }
             </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-10">
           <div className="space-y-2">
              <h3 className="text-4xl font-black italic tracking-tighter text-black uppercase">Universal Ledger</h3>
              <p className="text-[11px] font-black tracking-[0.4em] text-indigo-900/40 uppercase">IDENTIFIED AGENTS: {users.length}</p>
           </div>
           
           <div className="space-y-6">
              {usersLoading ? <div className="py-40 flex justify-center grayscale opacity-40"><Loader2 size={48} className="animate-spin text-black" /></div> :
                !users.length ? <div className="py-40 glass-luxe !bg-white/40 border-indigo-100/30 rounded-[3rem] shadow-sm flex flex-col items-center justify-center space-y-6">
                  <p className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-900/40 italic">Null Agent Directory</p>
                </div> :
                users.map(u => (
                  <div key={u.id} className="glass-luxe border-indigo-50/30 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/60 group">
                    <button onClick={() => fetchUserPerformance(u.id)}
                      className="w-full flex items-center justify-between p-10 text-left">
                      <div className="flex items-center gap-8 min-w-0 flex-1">
                        <div className="w-16 h-16 rounded-2xl glass-luxe bg-black text-white flex items-center justify-center text-xl font-black shrink-0 shadow-2xl glow-indigo group-hover:scale-110 transition-transform">
                          {(u.name || u.email || '??').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-xl font-black text-black uppercase italic tracking-tighter truncate group-hover:text-indigo-600 transition-colors">{u.name || 'ANONYMOUS AGENT'}</p>
                          <p className="text-[11px] font-black text-indigo-900/40 tracking-[0.2em] uppercase truncate italic">{u.email}</p>
                        </div>
                        {u.domain_of_interest && (
                          <span className="hidden lg:inline text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-2xl glass-luxe bg-indigo-50 text-indigo-600 border-indigo-100">{u.domain_of_interest}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-12 shrink-0 ml-10">
                        <div className="hidden xl:flex gap-12 text-right">
                          <div className="space-y-1">
                             <p className="text-3xl font-black italic leading-none text-black">{(u.stats?.coursesEnrolled || 0).toString().padStart(2, '0')}</p>
                             <p className="text-[9px] text-indigo-900/40 font-black uppercase tracking-widest italic text-center">NODES</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-3xl font-black italic leading-none text-black">{u.stats?.avgQuizScore || 0}%</p>
                             <p className="text-[9px] text-indigo-900/40 font-black uppercase tracking-widest italic text-center">ACCURACY</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-3xl font-black italic leading-none text-black">{(u.stats?.highestLevel || 3).toString().padStart(2, '0')}★</p>
                             <p className="text-[9px] text-indigo-900/40 font-black uppercase tracking-widest italic text-center">RANK</p>
                          </div>
                        </div>
                        <div className="w-14 h-14 rounded-2xl glass-luxe bg-white border-indigo-50 flex items-center justify-center text-indigo-900/20 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                           {expandedUser === u.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </div>
                      </div>
                    </button>

                    {expandedUser === u.id && (
                      <div className="p-12 border-t border-indigo-50/50 bg-white/40 animate-in slide-in-from-top-4 duration-500">
                        {perfLoading[u.id] ? <div className="text-center py-16 grayscale opacity-40"><Loader2 size={32} className="animate-spin text-black" /></div> : 
                         userPerformance[u.id] ? (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Course Progress Matrix */}
                            <div className="space-y-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full glow-indigo" />
                                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Active Node Synchronization</h4>
                               </div>
                               <div className="space-y-4">
                                  {userPerformance[u.id].progress?.length ? userPerformance[u.id].progress.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center p-6 glass-luxe bg-white/60 border-indigo-50/50 rounded-2xl hover:border-indigo-200 transition-all">
                                      <span className="text-sm font-black text-black uppercase italic truncate mr-6">{p.course?.title || 'DOMAIN NODE'}</span>
                                      <span className="text-[11px] font-black text-white bg-black px-4 py-1.5 rounded-xl shrink-0 shadow-lg glow-indigo">LEVEL {(p.level || 3).toString().padStart(2, '0')}</span>
                                    </div>
                                  )) : <p className="text-[11px] font-black text-indigo-900/30 italic uppercase tracking-widest py-8 text-center border border-dashed border-indigo-100 rounded-[2rem]">No active nodes detected.</p>}
                               </div>
                            </div>
                            {/* Quiz Results Matrix */}
                            <div className="space-y-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full glow-indigo" />
                                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Historical Calibration Data</h4>
                               </div>
                               <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                  {userPerformance[u.id].quizResults?.length ? userPerformance[u.id].quizResults.slice(0, 12).map((q, i) => (
                                    <div key={i} className="px-4 py-5 glass-luxe bg-white/60 border-indigo-50/50 rounded-2xl flex flex-col items-center hover:scale-105 transition-transform">
                                       <span className="text-xl font-black italic text-black leading-none mb-1">{q.score}%</span>
                                       <span className="text-[8px] font-black text-indigo-900/40 uppercase tracking-tighter text-center">{q.quiz_type}</span>
                                    </div>
                                  )) : <p className="col-span-full text-[11px] font-black text-indigo-900/30 italic uppercase tracking-widest py-8 text-center border border-dashed border-indigo-100 rounded-[2rem]">No historical data found.</p>}
                               </div>
                            </div>
                          </div>
                        ) : <p className="text-center py-16 text-[11px] font-black text-indigo-900/30 uppercase tracking-widest italic">Null data sector overflow.</p>}
                      </div>
                    )}
                  </div>
                ))
              }
           </div>
        </div>
      )}
    </div>
  );
}
