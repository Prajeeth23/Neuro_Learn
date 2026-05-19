import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Shield, Plus, Trash2, BookOpen, Users, BarChart3, Loader2, ChevronDown, ChevronUp, Eye, Search, Layers, ShieldCheck, UserCircle2, Check, Clock, X, Download, RefreshCw, TrendingUp } from 'lucide-react';
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

  // Cohort Progress Heatmap States
  const [cohortData, setCohortData] = useState({ students: [], courses: [], evaluations: [] });
  const [cohortLoading, setCohortLoading] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('Jan 2025');
  const [selectedCell, setSelectedCell] = useState(null);
  const [evalSaving, setEvalSaving] = useState(false);
  const [evalStatus, setEvalStatus] = useState('pending');
  const [evalFeedback, setEvalFeedback] = useState('');

  useEffect(() => { if (isAdmin) { fetchCourses(); } }, [isAdmin]);
  useEffect(() => { if (activeTab === 'users' && users.length === 0) { fetchUsers(); } }, [activeTab]);
  useEffect(() => { if (activeTab === 'cohort_progress') { fetchCohortProgress(); } }, [activeTab]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/admin/courses');
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

  const fetchCohortProgress = async () => {
    setCohortLoading(true); setError('');
    try {
      const { data } = await api.get('/admin/cohort-progress');
      setCohortData(data || { students: [], courses: [], evaluations: [] });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load cohort progress');
    } finally { setCohortLoading(false); }
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedCell) return;
    setEvalSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/admin/evaluate', {
        user_id: selectedCell.student.id,
        course_id: selectedCell.course.id,
        status: evalStatus,
        feedback_notes: evalFeedback
      });
      setSuccess(`Evaluation updated successfully for ${selectedCell.student.name || selectedCell.student.email}`);
      
      setCohortData(prev => {
        const updatedEvals = [...prev.evaluations];
        const existingIdx = updatedEvals.findIndex(ev => ev.user_id === selectedCell.student.id && ev.course_id === selectedCell.course.id);
        
        const newEval = {
          user_id: selectedCell.student.id,
          course_id: selectedCell.course.id,
          status: evalStatus,
          feedback_notes: evalFeedback,
          updated_at: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          updatedEvals[existingIdx] = newEval;
        } else {
          updatedEvals.push(newEval);
        }

        return { ...prev, evaluations: updatedEvals };
      });

      setSelectedCell(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save evaluation');
    } finally { setEvalSaving(false); }
  };

  const handleExportCSV = () => {
    if (!cohortData.students?.length || !cohortData.courses?.length) return;
    let csvContent = "Steps\\Students," + cohortData.students.map(s => `"${s.name || s.email}"`).join(",") + "\n";
    cohortData.courses.forEach((c, idx) => {
      const rowLabel = `"${idx + 1}. ${c.title}"`;
      const rowCells = cohortData.students.map(s => {
        const evaluation = cohortData.evaluations.find(ev => ev.user_id === s.id && ev.course_id === c.id);
        return evaluation ? `"${evaluation.status.toUpperCase()}"` : '"PENDING"';
      });
      csvContent += rowLabel + "," + rowCells.join(",") + "\n";
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cohort_progress_${selectedCohort.toLowerCase().replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoting, setPromoting] = useState(false);

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!promoteEmail.trim()) { setError('Email required'); return; }
    setPromoting(true); setError(''); setSuccess('');
    try {
      const { data } = await api.post('/admin/promote', { email: promoteEmail.toLowerCase() });
      setSuccess(data.message);
      setPromoteEmail('');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to promote user');
    } finally { setPromoting(false); }
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
        <Shield size={64} className="text-[#191C1E]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Administrative Access Required</p>
      </div>
    );
  }

  const tabs = [
    { id: 'courses', label: 'DOMAIN CONTROL', icon: <BookOpen size={14} /> },
    { id: 'users', label: 'USER LEDGER', icon: <Users size={14} /> },
    { id: 'cohort_progress', label: 'COHORT PROGRESS', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div className="animate-fade-in-up w-full mb-32 space-y-12">
      <div className="mb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 rounded-full mb-5 shadow-lg shadow-indigo-200">
          <Shield size={13} className="text-white" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-white">Universal Platform Override / Administrative Matrix</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-4" style={{fontFamily:'Inter,sans-serif'}}>
          <span className="text-[#191C1E]">Control </span><span className="text-[#4F46E5]">Phase</span>
        </h1>
        <div className="w-20 h-1 rounded-full bg-indigo-500" />
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 max-w-sm">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white shadow-sm text-[#191C1E] border border-gray-100' 
                : 'text-gray-300 hover:text-[#191C1E]'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-gray-50 border border-indigo-600/10 text-[#191C1E] p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4">
           <Shield className="text-[#191C1E]" size={16} /> ERROR: {typeof error === 'object' ? error.message : error}
        </div>
      )}
      {success && (
        <div className="bg-indigo-600 text-white p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-center shadow-xl shadow-indigo-900/10">
           {success}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-12">
          {/* Add Course Matrix */}
          <Card className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 grayscale pointer-events-none"><Plus size={160} /></div>
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><Plus size={20} /></div>
                <h3 className="text-sm font-black text-[#191C1E] uppercase tracking-widest">Register New Domain</h3>
             </div>
             
             <form onSubmit={handleCreate} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Domain Title</label>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="E.G. NEURAL NETWORKS 101"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-[#191C1E] focus:border-indigo-600 focus:outline-none transition-all uppercase" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Classification</label>
                    <select value={newDomain} onChange={e => setNewDomain(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-[#191C1E] focus:border-indigo-600 focus:outline-none transition-all uppercase">
                      {DOMAINS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Source Vector (YouTube Playlist URL)</label>
                  <input value={newPlaylistUrl} onChange={e => setNewPlaylistUrl(e.target.value)} placeholder="HTTPS://YOUTUBE.COM/..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-[#191C1E] focus:border-indigo-600 focus:outline-none transition-all" />
                </div>
                <button type="submit" disabled={creating} className="uiverse-btn !rounded-xl !py-4 shadow-xl shadow-indigo-900/5 flex items-center justify-center gap-4 w-full md:w-auto md:px-12">
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span className="text-[10px] uppercase font-black tracking-widest">{creating ? 'SYNCHRONIZING (AI PROCESSING)...' : 'INITIALIZE DOMAIN REGISTER'}</span>
                </button>
             </form>
          </Card>

          {/* Active Domains Matrix */}
          <div className="space-y-8">
             <div className="space-y-1">
                <h3 className="text-3xl font-black italic tracking-tighter text-[#191C1E] uppercase">Active Nodes</h3>
                <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase">SYNCHRONIZED DOMAINS: {courses.length}</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? <div className="col-span-full py-20 grayscale opacity-40 flex justify-center"><Loader2 size={32} className="animate-spin text-[#191C1E]" /></div> :
                  !courses.length ? <p className="col-span-full text-center py-20 text-[10px] font-black text-gray-300 uppercase tracking-widest border border-dashed border-gray-100 rounded-[2.5rem]">No nodes registered in the matrix.</p> :
                  courses.map(course => (
                    <div key={course.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:border-indigo-600 transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5 grayscale pointer-events-none group-hover:opacity-10 transition-opacity"><Layers size={100} /></div>
                       <div className="flex-1 min-w-0 mr-12 relative z-10">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                             <h4 className="text-sm font-black text-[#191C1E] uppercase italic tracking-tight leading-none truncate max-w-[200px]">{course.title}</h4>
                             {course.domain && course.domain !== 'General' && (
                               <span className="text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded bg-indigo-600 text-white">{course.domain}</span>
                             )}
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold leading-relaxed line-clamp-1 italic">{course.description}</p>
                       </div>
                       <button onClick={() => handleDelete(course.id, course.title)}
                         className="absolute right-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white text-gray-300 transition-all z-10">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  ))
                }
             </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8">
           <div className="space-y-1">
              <h3 className="text-3xl font-black italic tracking-tighter text-[#191C1E] uppercase">Universal Ledger</h3>
              <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase">IDENTIFIED AGENTS: {users.length}</p>
           </div>

           {/* Promote User Feature */}
           <Card className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
             <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><Shield size={20} /></div>
                <h3 className="text-sm font-black text-[#191C1E] uppercase tracking-widest">Elevate User Access</h3>
             </div>
             <form onSubmit={handlePromote} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Target Agent Email</label>
                  <input value={promoteEmail} onChange={e => setPromoteEmail(e.target.value)} placeholder="agent@neurolearn.ai" type="email"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-[#191C1E] focus:border-indigo-600 focus:outline-none transition-all" />
                </div>
                <button type="submit" disabled={promoting} className="bg-indigo-600 hover:bg-gray-800 text-white rounded-xl py-4 px-8 text-[10px] font-black tracking-widest uppercase transition-all shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-3 w-full md:w-auto">
                  {promoting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} 
                  {promoting ? 'PROCESSING...' : 'GRANT ADMINISTRATOR PRIVILEGES'}
                </button>
             </form>
           </Card>
           
           <div className="space-y-4">
              {usersLoading ? <div className="py-20 flex justify-center grayscale opacity-40"><Loader2 size={32} className="animate-spin text-[#191C1E]" /></div> :
                !users.length ? <p className="text-center py-20 text-[10px] font-black text-gray-300 uppercase tracking-widest border border-dashed border-gray-100 rounded-[2.5rem]">No user data detected.</p> :
                users.map(u => (
                  <div key={u.id} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden transition-all hover:bg-gray-50/50">
                    <button onClick={() => fetchUserPerformance(u.id)}
                      className="w-full flex items-center justify-between p-8 text-left">
                      <div className="flex items-center gap-6 min-w-0 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black shrink-0 shadow-lg shadow-indigo-900/5">
                          {(u.name || u.email || '??').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-black text-[#191C1E] uppercase italic tracking-tight truncate">{u.name || 'ANONYMOUS'}</p>
                          <p className="text-[10px] font-black text-gray-300 tracking-widest uppercase truncate italic">{u.email}</p>
                        </div>
                        {u.domain_of_interest && (
                          <span className="hidden sm:inline text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-400">{u.domain_of_interest}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-10 shrink-0 ml-8">
                        <div className="hidden lg:flex gap-10 text-right">
                          <div className="space-y-1">
                             <p className="text-xl font-black italic leading-none text-[#191C1E]">{u.stats?.coursesEnrolled || 0}</p>
                             <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest italic">NODES</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-xl font-black italic leading-none text-[#191C1E]">{u.stats?.avgQuizScore || 0}%</p>
                             <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest italic">ACCURACY</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-xl font-black italic leading-none text-[#191C1E]">{u.stats?.highestLevel || 3}★</p>
                             <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest italic">RANK</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
                           {expandedUser === u.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </button>

                    {expandedUser === u.id && (
                      <div className="p-10 border-t border-gray-50 bg-white animate-in slide-in-from-top-4 duration-500">
                        {perfLoading[u.id] ? <div className="text-center py-10 grayscale opacity-40"><Loader2 size={24} className="animate-spin text-[#191C1E]" /></div> : 
                         userPerformance[u.id] ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Course Progress Matrix */}
                            <div className="space-y-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-1 h-4 bg-indigo-600" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#191C1E]">Active Node Synchronization</h4>
                               </div>
                               <div className="space-y-3">
                                  {userPerformance[u.id].progress?.length ? userPerformance[u.id].progress.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                                      <span className="text-xs font-black text-[#191C1E] uppercase italic truncate mr-4">{p.course?.title || 'DOMAIN'}</span>
                                      <span className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1 rounded-lg shrink-0">{p.level || 3}★</span>
                                    </div>
                                  )) : <p className="text-[10px] font-bold text-gray-300 italic uppercase">No active nodes detected.</p>}
                               </div>
                            </div>
                            {/* Quiz Results Matrix */}
                            <div className="space-y-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-1 h-4 bg-indigo-600" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#191C1E]">Historical Calibration Data</h4>
                               </div>
                               <div className="flex flex-wrap gap-2">
                                  {userPerformance[u.id].quizResults?.length ? userPerformance[u.id].quizResults.slice(0, 12).map((q, i) => (
                                    <div key={i} className="px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 flex flex-col items-center min-w-[60px]">
                                       <span className="text-sm font-black italic">{q.score}%</span>
                                       <span className="text-[7px] font-black text-gray-300 uppercase tracking-tighter">{q.quiz_type}</span>
                                    </div>
                                  )) : <p className="text-[10px] font-bold text-gray-300 italic uppercase">No historical data found.</p>}
                               </div>
                            </div>
                          </div>
                        ) : <p className="text-center py-10 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Null data sector.</p>}
                      </div>
                    )}
                  </div>
                ))
              }
           </div>
        </div>
      )}

      {activeTab === 'cohort_progress' && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Heatmap Card Header */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-50">
              <div className="space-y-2">
                <h2 className="text-3xl font-black italic tracking-tight text-[#191C1E] uppercase">Cohort Progress Heatmap</h2>
                <p className="text-[11px] text-gray-400 font-black tracking-widest uppercase">
                  Grid: rows = steps, columns = students. Color = status (green=done, yellow=pending, red=rejected). Instantly shows bottlenecks.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <select
                  value={selectedCohort}
                  onChange={e => setSelectedCohort(e.target.value)}
                  className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 text-xs font-black text-[#191C1E] uppercase tracking-wider focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
                >
                  <option value="Jan 2025">Cohort: Jan 2025</option>
                  <option value="Feb 2025">Cohort: Feb 2025</option>
                  <option value="Mar 2025">Cohort: Mar 2025</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  disabled={!cohortData.students?.length}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-100 bg-white hover:border-indigo-600 text-[#191C1E] hover:text-indigo-600 text-xs font-black tracking-wider uppercase transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            {/* Legend and Refresh */}
            <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-b border-gray-50">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#15803D]">
                    <Check size={12} />
                  </span>
                  <span className="text-[10px] font-black tracking-widest text-[#191C1E] uppercase">Completed (Approved)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
                    <Clock size={12} />
                  </span>
                  <span className="text-[10px] font-black tracking-widest text-[#191C1E] uppercase">Pending Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#FEE2E2] border border-[#FCA5A5] flex items-center justify-center text-[#DC2626]">
                    <X size={12} />
                  </span>
                  <span className="text-[10px] font-black tracking-widest text-[#191C1E] uppercase">Rejected / Needs Resubmission</span>
                </div>
              </div>

              <button
                onClick={fetchCohortProgress}
                disabled={cohortLoading}
                className="flex items-center gap-2 text-gray-300 hover:text-[#191C1E] transition-all text-[10px] font-black tracking-widest uppercase disabled:opacity-40"
              >
                {cohortLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                Last updated: Just now
              </button>
            </div>

            {/* Matrix Data Grid Table */}
            <div className="mt-8 overflow-x-auto rounded-[2rem] border border-gray-50">
              {cohortLoading ? (
                <div className="py-32 flex justify-center items-center grayscale opacity-40">
                  <Loader2 size={32} className="animate-spin text-[#191C1E]" />
                </div>
              ) : !cohortData.students?.length ? (
                <div className="py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                  No active students registered in database.
                </div>
              ) : (
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      {/* Top Left Cell */}
                      <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-b border-gray-100 min-w-[260px]">
                        Steps \ Students
                      </th>
                      {/* Student Headers */}
                      {cohortData.students.map(student => (
                        <th key={student.id} className="p-6 text-center border-b border-gray-100 min-w-[140px]">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-indigo-900/5 uppercase">
                              {(student.name || student.email || '??').substring(0, 2)}
                            </div>
                            <span className="text-[10px] font-black text-[#191C1E] tracking-tight uppercase leading-tight max-w-[120px] truncate block">
                              {student.name || student.email.split('@')[0]}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.courses.map((course, cIdx) => (
                      <tr key={course.id} className="hover:bg-gray-50/20 transition-all border-b border-gray-100">
                        {/* Step Description Cell */}
                        <td className="p-6 font-black text-xs text-[#191C1E] uppercase italic tracking-tight border-r border-gray-100">
                          {cIdx + 1}. {course.title}
                        </td>
                        {/* Evaluation Status Cells */}
                        {cohortData.students.map(student => {
                          const ev = cohortData.evaluations.find(e => e.user_id === student.id && e.course_id === course.id);
                          const status = ev ? ev.status.toLowerCase() : 'pending';

                          let cellBg = 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] hover:bg-[#FDE68A]';
                          let cellIcon = <Clock size={16} />;

                          if (status === 'approved') {
                            cellBg = 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] hover:bg-[#C6F6D5]';
                            cellIcon = <Check size={16} />;
                          } else if (status === 'rejected') {
                            cellBg = 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5] hover:bg-[#FCA5A5]';
                            cellIcon = <X size={16} />;
                          }

                          return (
                            <td key={student.id} className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedCell({ student, course, evaluation: ev });
                                  setEvalStatus(status);
                                  setEvalFeedback(ev ? ev.feedback_notes || '' : '');
                                }}
                                className={`w-12 h-12 rounded-2xl ${cellBg} flex items-center justify-center mx-auto border transition-all duration-200 active:scale-95 shadow-sm font-bold`}
                                title={`Review: ${student.name || student.email} on ${course.title}`}
                              >
                                {cellIcon}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Cohort Summary Footer Cards */}
            {!cohortLoading && cohortData.students?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12 pt-10 border-t border-gray-50">
                {/* 1. Avg Completion Card */}
                <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-[#15803D] flex items-center justify-center shadow-sm">
                    <Check size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic text-[#191C1E] leading-none">
                      {cohortData.students.length * cohortData.courses.length > 0 ? (
                        Math.round((cohortData.evaluations.filter(e => e.status === 'approved').length / (cohortData.students.length * cohortData.courses.length)) * 100)
                      ) : 0}%
                    </h4>
                    <p className="text-[8px] font-black uppercase text-gray-300 tracking-widest mt-1">Avg. Completion</p>
                  </div>
                </div>

                {/* 2. Pending Card */}
                <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center shadow-sm">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic text-[#191C1E] leading-none">
                      {(cohortData.students.length * cohortData.courses.length) - cohortData.evaluations.filter(e => e.status === 'approved' || e.status === 'rejected').length}
                    </h4>
                    <p className="text-[8px] font-black uppercase text-gray-300 tracking-widest mt-1">Pending (Total)</p>
                  </div>
                </div>

                {/* 3. Rejected Card */}
                <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center shadow-sm">
                    <X size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic text-[#191C1E] leading-none">
                      {cohortData.evaluations.filter(e => e.status === 'rejected').length}
                    </h4>
                    <p className="text-[8px] font-black uppercase text-gray-300 tracking-widest mt-1">Rejected (Total)</p>
                  </div>
                </div>

                {/* 4. Total Students Card */}
                <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic text-[#191C1E] leading-none">{cohortData.students.length}</h4>
                    <p className="text-[8px] font-black uppercase text-gray-300 tracking-widest mt-1">Total Students</p>
                  </div>
                </div>

                {/* 5. Bottleneck Card */}
                <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4 lg:col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                    <TrendingUp size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-black text-[#191C1E] uppercase leading-tight truncate italic">
                      {(() => {
                        let worstIdx = 0;
                        let worstCount = -1;
                        cohortData.courses.forEach((c, i) => {
                          const issues = cohortData.students.filter(s => {
                            const ev = cohortData.evaluations.find(e => e.user_id === s.id && e.course_id === c.id);
                            return !ev || ev.status === 'pending' || ev.status === 'rejected';
                          }).length;
                          if (issues > worstCount) {
                            worstCount = issues;
                            worstIdx = i;
                          }
                        });
                        return cohortData.courses[worstIdx] ? `${worstIdx + 1}. ${cohortData.courses[worstIdx].title}` : 'None';
                      })()}
                    </h4>
                    <p className="text-[8px] font-black uppercase text-gray-300 tracking-widest mt-1">Top Bottleneck Step</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Modal Popover */}
      {selectedCell && (
        <div className="fixed inset-0 bg-[#191C1E]/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full border border-gray-100 shadow-2xl relative overflow-hidden animate-fade-in-up">
            <button
              onClick={() => setSelectedCell(null)}
              className="absolute right-8 top-8 p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-[#191C1E] transition-all"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-50">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#191C1E] uppercase tracking-widest">Evaluate Student Task</h3>
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">Admin Assessment Module</p>
              </div>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-6">
              {/* Target info */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-2">
                <div>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">STUDENT AGENT</p>
                  <p className="text-xs font-black text-[#191C1E] uppercase italic">
                    {selectedCell.student.name || 'ANONYMOUS'} ({selectedCell.student.email})
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">MODULE / COURSE</p>
                  <p className="text-xs font-black text-[#191C1E] uppercase italic">{selectedCell.course.title}</p>
                </div>
              </div>

              {/* Status selectors */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">EVALUATION STATUS</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setEvalStatus('approved')}
                    className={`py-3 px-4 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-2 border ${
                      evalStatus === 'approved'
                        ? 'bg-[#DCFCE7] border-[#15803D] text-[#15803D] shadow-sm'
                        : 'bg-white border-gray-100 text-gray-400 hover:text-[#191C1E]'
                    }`}
                  >
                    <Check size={14} /> Approved
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvalStatus('pending')}
                    className={`py-3 px-4 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-2 border ${
                      evalStatus === 'pending'
                        ? 'bg-[#FEF3C7] border-[#D97706] text-[#D97706] shadow-sm'
                        : 'bg-white border-gray-100 text-gray-400 hover:text-[#191C1E]'
                    }`}
                  >
                    <Clock size={14} /> Pending
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvalStatus('rejected')}
                    className={`py-3 px-4 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-2 border ${
                      evalStatus === 'rejected'
                        ? 'bg-[#FEE2E2] border-[#DC2626] text-[#DC2626] shadow-sm'
                        : 'bg-white border-gray-100 text-gray-400 hover:text-[#191C1E]'
                    }`}
                  >
                    <X size={14} /> Rejected
                  </button>
                </div>
              </div>

              {/* Feedback text area */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">FEEDBACK / INSTRUCTIONS</label>
                <textarea
                  value={evalFeedback}
                  onChange={e => setEvalFeedback(e.target.value)}
                  placeholder="Enter details, corrections required, or praise for student execution..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-xs font-bold text-[#191C1E] focus:border-indigo-600 focus:outline-none transition-all placeholder-gray-300"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="flex-1 bg-gray-50 border border-gray-100 hover:border-[#191C1E] rounded-xl py-4 text-[10px] font-black tracking-widest uppercase transition-all text-[#191C1E] text-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={evalSaving}
                  className="flex-1 bg-indigo-600 hover:bg-gray-800 text-white rounded-xl py-4 text-[10px] font-black tracking-widest uppercase transition-all shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-2"
                >
                  {evalSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  {evalSaving ? 'SAVING...' : 'SAVE EVALUATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
