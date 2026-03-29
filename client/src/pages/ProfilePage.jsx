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
      
      {/* Dossier Header */}
      <div className="glass-luxe border-indigo-100/30 rounded-[3rem] p-12 shadow-2xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none grayscale group-hover:scale-110 transition-transform duration-700">
           <UserCircle size={300} />
        </div>
        <div className="relative shrink-0">
          <div className="w-40 h-40 rounded-[3rem] bg-black flex items-center justify-center text-5xl font-black text-white glow-indigo shadow-[0_20px_50px_rgba(0,0,0,0.3)] italic tracking-tighter">
            {initials}
          </div>
          <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl glass-luxe bg-white border-indigo-50 shadow-xl flex items-center justify-center text-indigo-600">
             <Award size={24} />
          </div>
        </div>
        <div className="text-center md:text-left space-y-6">
          <div className="space-y-2">
             <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-black uppercase leading-none">{fullName}</h1>
             <p className="text-[11px] font-black tracking-[0.4em] uppercase opacity-40">System Node ID: {email.toUpperCase()}</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
             <span className="px-5 py-2 glass-luxe bg-black text-white text-[10px] font-black rounded-xl uppercase tracking-widest leading-none glow-indigo">
                {isAdmin ? 'ADMINISTRATOR' : 'PIONEER LEARNER'}
             </span>
             {userLevel && (
               <span className="px-5 py-2 glass-luxe bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-black rounded-xl uppercase tracking-widest leading-none">
                  RANK: {userLevel}★ {userLevel === 5 ? 'ELITE' : userLevel === 4 ? 'STRUCTURALIST' : 'INITIATE'}
               </span>
             )}
             <span className="px-5 py-2 glass-luxe bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] font-black rounded-xl uppercase tracking-widest leading-none">
                PROTOCOL: {provider.toUpperCase()}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Synthesis */}
        <Card className="lg:col-span-2 card-luxe p-12">
          <div className="flex items-center gap-6 mb-12 pb-8 border-b border-indigo-50/50">
             <div className="w-14 h-14 rounded-2xl glass-luxe bg-indigo-50 text-indigo-600 flex items-center justify-center glow-indigo"><Settings size={24} /></div>
             <div>
               <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black leading-none">Configuration Sync</h3>
               <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40 mt-1">Adjust learning parameters</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40 ml-1">Universal Name</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="input-glass !h-14 uppercase" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40 ml-1">Institutional Domain</label>
              <select value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                className="input-glass !h-14 uppercase">
                <option value="">SELECT DOMAIN</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40 ml-1">Temporal Phase</label>
              <select value={profile.year} onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}
                className="input-glass !h-14 uppercase">
                <option value="">SELECT PHASE</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40 ml-1">Core Vector</label>
              <select value={profile.domain_of_interest} onChange={e => setProfile(p => ({ ...p, domain_of_interest: e.target.value }))}
                className="input-glass !h-14 uppercase">
                <option value="">SELECT VECTOR</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-16 flex items-center justify-between gap-8 pt-12 border-t border-indigo-50/50">
             <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${saveMsg ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-300'}`} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] italic text-indigo-900/60 leading-none">{saveMsg || 'READY FOR SYNCHRONIZATION'}</p>
             </div>
             <Button variant="black" onClick={handleSave} disabled={saving} className="btn-primary !rounded-2xl !px-16 !py-5 shadow-2xl">
                {saving ? 'SYNCING...' : 'SAVE CONFIGURATION'}
             </Button>
          </div>
        </Card>

        {/* System Ledger */}
        <Card className="card-luxe p-12 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none" />
          <div className="flex items-center gap-6 mb-12 pb-8 border-b border-indigo-50/50">
             <div className="w-14 h-14 rounded-2xl glass-luxe bg-black text-white flex items-center justify-center glow-indigo font-black italic text-2xl">!</div>
             <div>
               <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black leading-none">System Ledger</h3>
               <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40 mt-1">Core node meta</p>
             </div>
          </div>
          <div className="space-y-8 flex-1">
             {[
               { icon: <Mail size={16} />, label: 'GATEWAY', val: email.toUpperCase() },
               { icon: <Shield size={16} />, label: 'ACCESS', val: provider.toUpperCase() },
               { icon: <Star size={16} />, label: 'ORIGIN', val: joinedDate.toUpperCase() },
               { icon: <Award size={16} />, label: 'PRIORITY', val: isAdmin ? 'LEVEL 10' : 'LEVEL 01' },
             ].map((item, i) => (
               <div key={i} className="flex justify-between items-center pb-4 border-b border-indigo-50/30 last:border-0 group">
                  <div className="flex items-center gap-4 text-indigo-600 transition-transform group-hover:translate-x-1">
                     {item.icon}
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-900/40">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-black tracking-tight text-black">{item.val}</span>
               </div>
             ))}
          </div>
          <div className="mt-12 p-8 rounded-[2rem] glass-luxe bg-indigo-50/50 border-indigo-100 flex flex-col items-center justify-center space-y-3">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600/60">SESSION PULSE</p>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-black animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                <span className="text-[12px] font-black text-black uppercase tracking-widest italic">LIVE ENCRYPTED</span>
             </div>
          </div>
        </Card>
      </div>

      {/* Discovery Layer */}
      {profile.domain_of_interest && (
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h2 className="text-3xl font-black italic tracking-tighter text-black uppercase">Career Vectors</h2>
                 <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase">PREDICTIVE NODES FOR {profile.domain_of_interest}</p>
              </div>
              <button onClick={fetchCareerRoles} disabled={rolesLoading}
                className="bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-gray-800 transition-all flex items-center gap-3 shadow-xl shadow-black/5 leading-none">
                {rolesLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {rolesLoading ? 'ANALYZING...' : 'MAP NEW VECTORS'}
              </button>
           </div>

            {careerRoles && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-1000">
                {careerRoles.map((role, i) => (
                  <button key={i} onClick={() => fetchRoadmap(role)} 
                    className={`text-left p-10 rounded-[3rem] border transition-all relative overflow-hidden group scale-100 active:scale-95 ${
                      selectedRole?.title === role.title ? 'glass-luxe bg-black text-white border-black shadow-2xl glow-indigo' : 'glass-luxe bg-white/40 border-indigo-50 hover:border-indigo-200'
                    }`}>
                    <div className="relative z-10 space-y-6">
                       <h4 className="text-xl font-black uppercase italic tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">{role.title}</h4>
                        <p className={`text-[11px] font-black uppercase tracking-tighter leading-relaxed line-clamp-3 opacity-60 ${selectedRole?.title === role.title ? 'text-white/80' : 'text-indigo-900'}`}>{role.description}</p>
                        <div className="flex gap-3">
                           <span className={`text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest border ${selectedRole?.title === role.title ? 'bg-white/10 border-white/10 text-white' : 'glass-luxe bg-indigo-50 border-indigo-100 text-indigo-600'}`}>{role.avgSalary}</span>
                       </div>
                    </div>
                    <div className={`absolute -bottom-4 -right-4 opacity-[0.05] grayscale transition-all duration-700 group-hover:scale-125 group-hover:opacity-10 ${selectedRole?.title === role.title ? 'scale-125 opacity-20' : ''}`}><Layers size={100} /></div>
                  </button>
                ))}
              </div>
            )}
        </div>
      )}

      {/* Roadmap Visualization */}
      {roadmapLoading && (
        <div className="py-24 flex flex-col items-center gap-6 opacity-40 grayscale">
          <Loader2 size={40} className="animate-spin text-black" />
          <p className="text-[10px] font-black tracking-[0.4em] uppercase">Synthesizing personalized growth vector...</p>
        </div>
      )}
      
      {roadmap && !roadmapLoading && (
        <Card className="bg-white border border-gray-200 rounded-[3rem] p-12 shadow-card-lg animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 grayscale pointer-events-none"><Map size={240} /></div>
          <div className="relative z-10 space-y-12">
             <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-10 bg-black" />
                   <h3 className="text-4xl font-black italic tracking-tighter text-black uppercase leading-none">{roadmap.title}</h3>
                </div>
                 <p className="text-[10px] font-black tracking-[0.3em] uppercase ml-5" style={{color:'#464555'}}>PROJECTION DURATION: {roadmap.estimatedDuration.toUpperCase()}</p>
             </div>

             <div className="space-y-10">
                {(roadmap.phases || []).map((phase, i) => (
                  <div key={i} className="group relative pl-16 border-l-2 border-indigo-50 pb-16 last:pb-0">
                     <div className="absolute top-0 left-[-11px] w-5 h-5 rounded-full glass-luxe bg-white border-2 border-black z-10 glow-indigo" />
                     <div className="glass-luxe bg-white/40 border-indigo-50/50 rounded-[3rem] p-10 space-y-6 hover:border-indigo-300 hover:translate-x-2 transition-all group shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div className="space-y-2">
                              <h4 className="text-3xl font-black uppercase italic text-black tracking-tighter">{phase.title}</h4>
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">SYNERGY PHASE {String(phase.phase).padStart(2, '0')} | {phase.duration.toUpperCase()}</p>
                           </div>
                           <div className="flex flex-wrap gap-3">
                              {(phase.skills || []).map((s, j) => (
                                <span key={j} className="text-[10px] px-5 py-2 glass-luxe bg-black text-white rounded-xl font-black uppercase tracking-widest leading-none glow-indigo group-hover:scale-110 transition-transform">{s}</span>
                              ))}
                           </div>
                        </div>
                        <p className="text-sm text-indigo-900/60 font-black uppercase leading-relaxed max-w-4xl tracking-tight">{phase.description}</p>
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-indigo-50/50">
                            {(phase.tools || []).map((t, j) => (
                              <span key={j} className="text-[9px] px-4 py-2 rounded-xl font-black uppercase tracking-widest glass-luxe bg-indigo-50 border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">{t}</span>
                            ))}
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             {roadmap.tips?.length > 0 && (
               <div className="pt-10 border-t border-gray-100">
                   <h4 className="text-[9px] font-black tracking-[0.3em] uppercase mb-6 text-center" style={{color:'#464555'}}>PRACTICAL GUIDELINES</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {roadmap.tips.map((tip, i) => (
                       <div key={i} className="p-6 rounded-2xl flex gap-4" style={{background:'#EEF2FF', border:'1px solid #E2DFFF'}}>
                          <Star size={14} style={{color:'#4F46E5'}} className="shrink-0 mt-0.5" />
                          <p className="text-[11px] font-bold leading-relaxed" style={{color:'#464555'}}>{tip}</p>
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
              <h2 className="text-3xl font-black italic tracking-tighter text-black uppercase">Active Nodes</h2>
              <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase">DOMAIN ENROLLMENT LOG</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {enrolledCourses.map((progress, i) => (
                 <div key={i} className="p-8 bg-white rounded-[2rem] shadow-sm transition-all flex justify-between items-center group" style={{border:'1px solid #E0E3E5'}}>
                   <div className="space-y-1">
                     <p className="font-black uppercase italic tracking-tight text-sm leading-none" style={{color:'#191C1E'}}>{progress.course?.title || 'NODE'}</p>
                     <span className="text-[9px] font-black tracking-widest uppercase inline-block rounded-md px-2 py-0.5" style={{background:'#EEF2FF', color:'#4F46E5'}}>{progress.course?.category?.toUpperCase() || ''}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
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
