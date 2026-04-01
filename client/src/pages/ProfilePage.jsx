import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Shield, BookOpen, Star, Map, Loader2, Sparkles, ChevronRight, Brain, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Career roles
  const [careerRoles, setCareerRoles] = useState(null);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Roadmap
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
      if (data) {
        setProfile({
          name: data.name || '',
          department: data.department || '',
          year: data.year || '',
          domain_of_interest: data.domain_of_interest || ''
        });
      }
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
      setSaveMsg('Profile synchronized!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('Synchronization failed');
    } finally {
      setSaving(false);
    }
  };

  const fetchCareerRoles = async () => {
    if (!profile.domain_of_interest) return;
    setRolesLoading(true);
    setRoadmap(null);
    setSelectedRole(null);
    try {
      const { data } = await api.post('/ai/career-roles', { domain: profile.domain_of_interest });
      setCareerRoles(data.roles || []);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchRoadmap = async (role) => {
    setSelectedRole(role);
    setRoadmapLoading(true);
    try {
      const { data } = await api.post('/ai/roadmap', { domain: profile.domain_of_interest, role: role.title });
      setRoadmap(data);
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  useEffect(() => {
    if (profile.domain_of_interest) {
      setCareerRoles(null);
      setRoadmap(null);
    }
  }, [profile.domain_of_interest]);

  const levelNames = { 3: 'Beginner', 4: 'Intermediate', 5: 'Advanced' };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-20">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative w-36 h-36 rounded-full bg-white border border-slate-100 flex items-center justify-center text-5xl font-bold text-primary shadow-xl shadow-slate-200">
            {initials}
          </div>
          <div className="absolute bottom-1 right-1 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white border-4 border-white shadow-lg">
             <Star size={18} fill="currentColor" />
          </div>
        </div>
        <div className="text-center md:text-left space-y-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-1">{fullName}</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
              {isAdmin ? 'Senior Administrator' : 'Advanced Learning Scholar'} • Digital Residency
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             {profile.domain_of_interest && <Badge className="bg-primary/5 text-primary border-none px-4 py-1.5">{profile.domain_of_interest}</Badge>}
             {profile.department && <Badge className="bg-secondary/5 text-secondary border-none px-4 py-1.5">{profile.department}</Badge>}
             {userLevel && <Badge variant="outline" className="border-amber-200 text-amber-600 px-4 py-1.5 bg-amber-50">Grade {userLevel}★</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Profile Synthesis */}
        <Card className="surface-elevated p-8 !rounded-[2.5rem]">
          <CardHeader className="p-0 mb-8 flex flex-row items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><User size={20} /></div>
            <CardTitle className="text-xl font-bold text-slate-900">Personal Synthesis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Display</label>
              <input 
                value={profile.name} 
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <select 
                  value={profile.department} 
                  onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="">None Selected</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                <select 
                  value={profile.year} 
                  onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="">None Selected</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Focus Domain</label>
              <select 
                value={profile.domain_of_interest} 
                onChange={e => setProfile(p => ({ ...p, domain_of_interest: e.target.value }))}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="">None Selected</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary !px-10 flex-1 group">
                {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Shield size={18} className="mr-2 group-hover:scale-110 transition-transform" />}
                {saving ? 'Synchronizing...' : 'Update Sync'}
              </button>
              {saveMsg && <span className="text-xs text-green-600 font-bold animate-fade-in">{saveMsg}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Security / System Node */}
        <Card className="surface-elevated p-8 !rounded-[2.5rem]">
          <CardHeader className="p-0 mb-8 flex flex-row items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary"><Shield size={20} /></div>
            <CardTitle className="text-xl font-bold text-slate-900">Security Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2 p-0">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticated Identifier</p>
                 <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate max-w-[220px]">{email}</p>
              </div>
              <Mail size={18} className="text-slate-200 group-hover:text-primary transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol</p>
                   <p className="text-sm font-bold text-slate-900 capitalize">{provider} Auth</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled</p>
                   <p className="text-sm font-bold text-slate-900 truncate">{joinedDate}</p>
                </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clearance Level</span>
              <Badge className={`font-black text-[10px] uppercase tracking-widest px-4 py-1.5 border-none ${isAdmin ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                {isAdmin ? 'System Admin' : 'Standard Access'}
              </Badge>
            </div>
            <div className="p-6 bg-white border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Presence</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Node Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Roles Section */}
      {profile.domain_of_interest && (
        <Card className="surface-elevated p-8 md:p-10 !rounded-[2.5rem] mb-12">
          <CardHeader className="p-0 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                 <Map size={24} />
              </div>
              Career Trajectories: {profile.domain_of_interest}
            </CardTitle>
            <button 
              onClick={fetchCareerRoles} 
              disabled={rolesLoading}
              className="btn-secondary !rounded-full !px-8 group"
            >
              {rolesLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2 group-hover:scale-110 transition-transform text-secondary" />}
              {rolesLoading ? 'Predicting Roles...' : careerRoles ? 'Refresh Paths' : 'Explore Futures'}
            </button>
          </CardHeader>
          
          <AnimatePresence>
          {careerRoles && (
            <CardContent className="p-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {careerRoles.map((role, i) => (
                  <div key={i} className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer group relative overflow-hidden flex flex-col ${
                    selectedRole?.title === role.title 
                      ? 'bg-white border-secondary shadow-xl shadow-slate-200' 
                      : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200'
                  }`} onClick={() => fetchRoadmap(role)}>
                    {selectedRole?.title === role.title && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1 pr-8">
                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-secondary transition-colors">{role.title}</h4>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{role.avgSalary}</span>
                           <span className="text-[10px] font-black uppercase text-secondary/60">{role.demand} Demand</span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-xl transition-all ${selectedRole?.title === role.title ? 'bg-secondary text-white' : 'bg-white text-slate-300'}`}>
                         <ChevronRight size={18} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1">{role.description}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); fetchRoadmap(role); }}
                      className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        selectedRole?.title === role.title
                          ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                          : 'bg-white border border-slate-200 text-slate-400 group-hover:border-secondary/40 group-hover:text-secondary'
                      }`}
                    >
                      {selectedRole?.title === role.title && roadmapLoading ? 'Synthesizing Roadmap...' : 'Initialize Roadmap'}
                    </button>
                  </div>
                ))}
              </motion.div>
            </CardContent>
          )}
          </AnimatePresence>
        </Card>
      )}

      {/* Roadmap Section */}
      <AnimatePresence>
      {(roadmapLoading || roadmap) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          {roadmapLoading ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
               <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">Personalizing Neural Roadmap</p>
            </div>
          ) : roadmap && (
            <Card className="surface-elevated p-8 md:p-12 !rounded-[3rem] bg-gradient-to-br from-white to-slate-50/50">
              <CardHeader className="p-0 mb-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="space-y-2">
                      <h2 className="text-3xl font-bold tracking-tight text-slate-900">{roadmap.title}</h2>
                      <div className="flex items-center gap-3">
                         <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 font-bold">Estimated {roadmap.estimatedDuration}</Badge>
                         <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">Path Identified</p>
                      </div>
                   </div>
                   <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                         <Brain size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-600">Adaptive Sequencing Active</p>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-10">
                {/* Phases */}
                <div className="space-y-6">
                  {(roadmap.phases || []).map((phase, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-8 group">
                      <div className="md:w-32 shrink-0 flex flex-col items-center">
                         <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 text-primary flex flex-col items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <span className="text-[10px] font-black opacity-30 leading-none mb-1">PHASE</span>
                            <span className="text-xl font-black leading-none">{phase.phase}</span>
                         </div>
                         {i < (roadmap.phases.length - 1) && <div className="w-0.5 flex-1 bg-slate-100 my-4"></div>}
                      </div>
                      <div className="flex-1 bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:border-primary/20 transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                          <h4 className="font-bold text-slate-900 text-xl">{phase.title}</h4>
                          <span className="text-[10px] font-black tracking-widest uppercase text-slate-300 bg-slate-50 px-3 py-1 rounded-full h-fit">{phase.duration}</span>
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">{phase.description}</p>
                        <div className="flex flex-wrap gap-2.5">
                          {(phase.skills || []).map((s, j) => (
                            <span key={j} className="text-[10px] px-4 py-2 rounded-full bg-primary/5 text-primary font-bold border border-primary/10">{s}</span>
                          ))}
                          {(phase.tools || []).map((t, j) => (
                            <span key={j} className="text-[10px] px-4 py-2 rounded-full bg-secondary/5 text-secondary font-bold border border-secondary/10">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strategy Notes */}
                {roadmap.tips?.length > 0 && (
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] mt-12">
                    <h4 className="text-[10px] font-black tracking-widest uppercase text-primary/60 mb-6 flex items-center gap-2">
                       <Sparkles size={14} className="text-primary" /> Strategist's Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roadmap.tips.map((tip, i) => (
                        <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                           <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                              <CheckCircle size={16} />
                           </div>
                           <p className="text-sm font-medium text-white/80 leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Enrolled Courses Archive */}
      {enrolledCourses.length > 0 && (
        <Card className="surface-elevated !rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-xl text-secondary"><BookOpen size={18} /></div>
              Learning Portfolio
            </CardTitle>
            <Badge className="bg-slate-100 text-slate-500 border-none px-4 py-1.5">{enrolledCourses.length} Pathways</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {enrolledCourses.map((progress, i) => (
                <div key={i} className="flex items-center justify-between p-7 hover:bg-slate-50/50 transition-colors group">
                  <div className="min-w-0 mr-10">
                    <p className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors truncate">{progress.course?.title || 'Unknown Path'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{progress.course?.category || 'General'}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                     <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">Level {progress.level}★</p>
                        <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mt-1">{levelNames[progress.level] || 'Synthesis Active'}</p>
                     </div>
                     <button className="p-2 rounded-xl bg-slate-50 text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                        <ArrowRight size={18} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
