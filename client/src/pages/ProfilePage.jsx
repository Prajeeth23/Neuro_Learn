import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { User, Mail, Shield, BookOpen, Star, Map, Loader2, Sparkles, ChevronRight, UserCircle, Settings, Award, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import api from '../lib/api';

const DOMAINS = ['AI & Machine Learning', 'Web Development', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'Mobile Development', 'Game Development', 'DevOps'];
const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Business', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate'];

export default function ProfilePage() {
  const { session, user, isAdmin } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userLevel, setUserLevel] = useState(null);
  const [profile, setProfile] = useState({ name: '', department: '', year: '', domain_of_interest: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [careerRoles, setCareerRoles] = useState(null);
  const [rolesLoading, setRolesLoading] = useState(false);

  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const authUser = session?.user || user;
  const fullName = profile.name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Pioneer';
  const initials = fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
  const email = authUser?.email || 'Unknown';
  const joinedDate = authUser?.created_at ? new Date(authUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
  const provider = authUser?.app_metadata?.provider || 'email';

  useEffect(() => {
    fetchProfile();
    fetchProgress();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      if (data) setProfile({ name: data.name || '', department: data.department || '', year: data.year || '', domain_of_interest: data.domain_of_interest || '' });
    } catch (err) { console.error('Failed to load profile:', err); }
  };

  const fetchProgress = async () => {
    try {
      const { data: progressData } = await api.get('/progress');
      if (progressData?.length > 0) {
        setEnrolledCourses(progressData);
        const levels = progressData.map(p => p.level).filter(Boolean);
        if (levels.length > 0) setUserLevel(Math.max(...levels));
      }
    } catch (err) { console.error('Failed to load profile data', err); }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await api.put('/auth/profile', profile);
      setSaveMsg('SYNC COMPLETE');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) { setSaveMsg('SYNC FAILED'); } finally { setSaving(false); }
  };

  const fetchCareerRoles = async () => {
    if (!profile.domain_of_interest) return;
    setRolesLoading(true); setRoadmap(null); setSelectedRole(null);
    try {
      const { data } = await api.post('/ai/career-roles', { domain: profile.domain_of_interest });
      setCareerRoles(data.roles || []);
    } catch (err) { console.error('Failed to fetch roles:', err); } finally { setRolesLoading(false); }
  };

  const fetchRoadmap = async (role) => {
    setSelectedRole(role); setRoadmapLoading(true);
    try {
      const { data } = await api.post('/ai/roadmap', { domain: profile.domain_of_interest, role: role.title });
      setRoadmap(data);
    } catch (err) { console.error('Failed to generate roadmap:', err); } finally { setRoadmapLoading(false); }
  };

  useEffect(() => { if (profile.domain_of_interest) { setCareerRoles(null); setRoadmap(null); } }, [profile.domain_of_interest]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up pb-32">
      
      {/* Page Header */}
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 rounded-full mb-5 shadow-lg shadow-indigo-200">
          <User size={13} className="text-white" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-white">Learner Identity</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-4" style={{fontFamily:'Inter,sans-serif'}}>
          <span className="text-[#191C1E]">My </span><span className="text-[#4F46E5]">Profile</span>
        </h1>
        <div className="w-20 h-1 rounded-full bg-indigo-500" />
      </div>

      {/* Dossier Header */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-card-lg flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none grayscale"><UserCircle size={200} /></div>
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-indigo-900/10">
            {initials}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#191C1E]">
             <Award size={20} />
          </div>
        </div>
        <div className="text-center md:text-left space-y-4">
          <div className="space-y-1">
             <h1 className="text-4xl font-black italic tracking-tighter text-[#191C1E] uppercase leading-none">{fullName}</h1>
             <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">IDENTIFIER: {email.toUpperCase()}</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             <span className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest leading-none">
                {isAdmin ? 'ADMINISTRATOR' : 'PIONEER LEARNER'}
             </span>
             {userLevel && (
               <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-[#191C1E] text-[9px] font-black rounded-lg uppercase tracking-widest leading-none">
                  RANK: {userLevel}★ {userLevel === 5 ? 'ELITE' : userLevel === 4 ? 'STRUCTURALIST' : 'INITIATE'}
               </span>
             )}
             <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-400 text-[9px] font-black rounded-lg uppercase tracking-widest leading-none">
                AUTH: {provider.toUpperCase()}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Synthesis */}
        <Card className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
             <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#191C1E]"><Settings size={20} /></div>
             <h3 className="text-sm font-black text-[#191C1E] uppercase tracking-widest">Configuration Sync</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Universal Name</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-[#191C1E] focus:border-indigo-600 focus:outline-none transition-all uppercase" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Institutional Domain</label>
              <select value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-[#191C1E] focus:border-indigo-600 focus:outline-none transition-all uppercase">
                <option value="">SELECT DOMAIN</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Temporal Phase</label>
              <select value={profile.year} onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-[#191C1E] focus:border-indigo-600 focus:outline-none transition-all uppercase">
                <option value="">SELECT PHASE</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Core Vector</label>
              <select value={profile.domain_of_interest} onChange={e => setProfile(p => ({ ...p, domain_of_interest: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-[#191C1E] focus:border-indigo-600 focus:outline-none transition-all uppercase">
                <option value="">SELECT VECTOR</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-12 flex items-center justify-between gap-6 pt-10 border-t border-gray-50">
             <p className="text-[9px] font-black text-[#191C1E] uppercase tracking-widest italic">{saveMsg || 'STANDBY FOR SYNCHRONIZATION'}</p>
             <Button variant="primary" onClick={handleSave} disabled={saving} className="!rounded-xl !px-12 !py-4 shadow-xl shadow-indigo-900/5">
                {saving ? 'SYNCING...' : 'SAVE CONFIGURATION'}
             </Button>
          </div>
        </Card>

        {/* System Ledger */}
        <Card className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black italic">!</div>
             <h3 className="text-sm font-black text-[#191C1E] uppercase tracking-widest">System Ledger</h3>
          </div>
          <div className="space-y-6 flex-1">
             {[
               { icon: <Mail size={14} />, label: 'GATEWAY', val: email.toUpperCase() },
               { icon: <Shield size={14} />, label: 'ACCESS', val: provider.toUpperCase() },
               { icon: <Star size={14} />, label: 'ORIGIN', val: joinedDate.toUpperCase() },
               { icon: <Award size={14} />, label: 'PRIORITY', val: isAdmin ? 'LEVEL 10' : 'LEVEL 01' },
             ].map((item, i) => (
               <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3 text-gray-200">
                     {item.icon}
                     <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-black text-[#191C1E] tracking-tight">{item.val}</span>
               </div>
             ))}
          </div>
          <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-gray-100">
             <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1 text-center">SESSION PULSE</p>
             <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                <span className="text-[10px] font-black text-[#191C1E] uppercase">LIVE ENCRYPTED</span>
             </div>
          </div>
        </Card>
      </div>

      {/* Discovery Layer */}
      {profile.domain_of_interest && (
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h2 className="text-3xl font-black italic tracking-tighter text-[#191C1E] uppercase">Career Vectors</h2>
                 <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase">PREDICTIVE NODES FOR {profile.domain_of_interest}</p>
              </div>
              <button onClick={fetchCareerRoles} disabled={rolesLoading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-gray-800 transition-all flex items-center gap-3 shadow-xl shadow-indigo-900/5 leading-none">
                {rolesLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {rolesLoading ? 'ANALYZING...' : 'MAP NEW VECTORS'}
              </button>
           </div>

           {careerRoles && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
                {careerRoles.map((role, i) => (
                  <button key={i} onClick={() => fetchRoadmap(role)} 
                    className={`text-left p-8 rounded-[2rem] border transition-all relative overflow-hidden group ${
                      selectedRole?.title === role.title ? 'bg-indigo-600 text-white border-indigo-600 shadow-card-lg shadow-black/20' : 'bg-white border-gray-100 hover:border-indigo-600'
                    }`}>
                    <div className="relative z-10 space-y-4">
                       <h4 className="text-sm font-black uppercase italic tracking-tight leading-none">{role.title}</h4>
                       <p className={`text-[10px] font-medium leading-relaxed line-clamp-2 ${selectedRole?.title === role.title ? 'text-gray-400' : 'text-gray-300'}`}>{role.description}</p>
                       <div className="flex gap-2">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest border ${selectedRole?.title === role.title ? 'bg-white/10 border-white/10 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>{role.avgSalary}</span>
                       </div>
                    </div>
                    <div className={`absolute -bottom-2 -right-2 opacity-5 scale-150 grayscale transition-opacity ${selectedRole?.title === role.title ? 'opacity-20' : 'group-hover:opacity-10'}`}><Layers size={60} /></div>
                  </button>
                ))}
              </div>
           )}
        </div>
      )}

      {/* Roadmap Visualization */}
      {roadmapLoading && (
        <div className="py-24 flex flex-col items-center gap-6 opacity-40 grayscale">
          <Loader2 size={40} className="animate-spin text-[#191C1E]" />
          <p className="text-[10px] font-black tracking-[0.4em] uppercase">Synthesizing personalized growth vector...</p>
        </div>
      )}
      
      {roadmap && !roadmapLoading && (
        <Card className="bg-white border border-gray-200 rounded-[3rem] p-12 shadow-card-lg animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 grayscale pointer-events-none"><Map size={240} /></div>
          <div className="relative z-10 space-y-12">
             <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-10 bg-indigo-600" />
                   <h3 className="text-4xl font-black italic tracking-tighter text-[#191C1E] uppercase leading-none">{roadmap.title}</h3>
                </div>
                <p className="text-[10px] font-black tracking-[0.3em] text-gray-300 uppercase ml-5">PROJECTION DURATION: {roadmap.estimatedDuration.toUpperCase()}</p>
             </div>

             <div className="space-y-6">
                {(roadmap.phases || []).map((phase, i) => (
                  <div key={i} className="group relative pl-12 border-l border-gray-100 pb-12 last:pb-0">
                     <div className="absolute top-0 left-[-8px] w-4 h-4 rounded-full bg-white border-2 border-indigo-600 z-10" />
                     <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 space-y-4 hover:border-indigo-600 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="space-y-1">
                              <h4 className="text-lg font-black uppercase italic text-[#191C1E]">{phase.title}</h4>
                              <p className="text-[9px] font-black uppercase text-gray-300 tracking-widest">PHASE {phase.phase} | {phase.duration.toUpperCase()}</p>
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {(phase.skills || []).map((s, j) => (
                                <span key={j} className="text-[9px] px-3 py-1 bg-indigo-600 text-white rounded-lg font-black uppercase tracking-widest leading-none">{s}</span>
                              ))}
                           </div>
                        </div>
                        <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-2xl">{phase.description}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {(phase.tools || []).map((t, j) => (
                             <span key={j} className="text-[8px] px-2 py-1 bg-white border border-gray-100 rounded-md text-gray-300 font-black uppercase tracking-widest">{t}</span>
                           ))}
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             {roadmap.tips?.length > 0 && (
               <div className="pt-10 border-t border-gray-100">
                  <h4 className="text-[9px] font-black tracking-[0.3em] text-gray-300 uppercase mb-6 text-center">PRACTICAL GUIDELINES</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roadmap.tips.map((tip, i) => (
                      <div key={i} className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex gap-4">
                         <Star size={14} className="text-[#191C1E] shrink-0 mt-0.5" />
                         <p className="text-[11px] text-gray-400 font-bold leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
        </Card>
      )}

      {/* Course Sync History */}
      {enrolledCourses.length > 0 && (
        <div className="space-y-8">
           <div className="space-y-1">
              <h2 className="text-3xl font-black italic tracking-tighter text-[#191C1E] uppercase">Active Nodes</h2>
              <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase">DOMAIN ENROLLMENT LOG</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((progress, i) => (
                <div key={i} className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:border-indigo-600 transition-all flex justify-between items-center group">
                  <div className="space-y-1">
                    <p className="font-black text-[#191C1E] uppercase italic tracking-tight text-sm leading-none">{progress.course?.title || 'NODE'}</p>
                    <p className="text-[9px] font-black tracking-widest uppercase text-gray-300 italic">{progress.course?.category?.toUpperCase() || ''}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <span className="text-xs font-black">{progress.level}★</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
