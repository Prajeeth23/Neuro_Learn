import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { User, Mail, Shield, BookOpen, Star, Map, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
      setSaveMsg('Profile updated!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('Failed to save');
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

  // Auto-fetch roles when domain changes
  useEffect(() => {
    if (profile.domain_of_interest) {
      setCareerRoles(null);
      setRoadmap(null);
    }
  }, [profile.domain_of_interest]);

  const levelNames = { 3: 'Beginner', 4: 'Intermediate', 5: 'Advanced' };
  const levelColors = { 3: 'text-green-400', 4: 'text-yellow-400', 5: 'text-purple-400' };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative w-32 h-32 rounded-full bg-black flex items-center justify-center text-4xl font-black border-2 border-white/10 ring-4 ring-black">
            {initials}
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">{fullName}</h1>
          <p className="text-white/40 font-medium tracking-widest uppercase text-xs">
            {isAdmin ? 'Administrator' : 'Learner'} • {provider === 'google' ? 'Google Auth' : 'Email Auth'}
            {userLevel && (
              <span className={`ml-3 ${levelColors[userLevel] || 'text-white/60'}`}>
                {userLevel}★ {levelNames[userLevel] || ''}
              </span>
            )}
          </p>
          {profile.department && <p className="text-white/30 text-sm mt-1">{profile.department} • {profile.year}</p>}
          {profile.domain_of_interest && (
            <span className="inline-block mt-2 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              {profile.domain_of_interest}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editable Profile Info */}
        <Card className="glass-card-premium p-6 neon-border-primary">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><User size={20} /></div>
            <CardTitle className="text-xl">Student Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Full Name</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Department</label>
              <select value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none transition-all">
                <option value="" className="bg-black">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Year</label>
              <select value={profile.year} onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none transition-all">
                <option value="" className="bg-black">Select Year</option>
                {YEARS.map(y => <option key={y} value={y} className="bg-black">{y}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Domain of Interest</label>
              <select value={profile.domain_of_interest} onChange={e => setProfile(p => ({ ...p, domain_of_interest: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none transition-all">
                <option value="" className="bg-black">Select Domain</option>
                {DOMAINS.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={saving} className="uiverse-btn !py-2.5 !px-6 !text-xs flex-1">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              {saveMsg && <span className="text-xs text-green-400 font-bold">{saveMsg}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="glass-card-premium p-6 neon-border-primary">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent"><Shield size={20} /></div>
            <CardTitle className="text-xl">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Email</span>
              <span className="text-white/90 font-medium text-sm truncate max-w-[200px]">{email}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Auth Provider</span>
              <span className="text-white/90 font-medium capitalize">{provider}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Joined</span>
              <span className="text-white/90 font-medium">{joinedDate}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Role</span>
              <span className={`font-bold text-xs uppercase tracking-widest px-2 py-1 rounded ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                {isAdmin ? 'Admin' : 'Student'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">Session</span>
              <span className="text-green-400 font-bold text-xs uppercase tracking-widest bg-green-400/10 px-2 py-1 rounded">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Roles Section */}
      {profile.domain_of_interest && (
        <Card className="glass-card-premium p-6 neon-border-primary">
          <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <Map size={20} className="text-accent" /> Career Roles for {profile.domain_of_interest}
            </CardTitle>
            <button onClick={fetchCareerRoles} disabled={rolesLoading}
              className="uiverse-btn-outline !px-4 !py-2 !text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
              {rolesLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {rolesLoading ? 'Generating...' : careerRoles ? 'Refresh Roles' : 'Discover Roles'}
            </button>
          </CardHeader>
          {careerRoles && (
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {careerRoles.map((role, i) => (
                  <div key={i} className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                    selectedRole?.title === role.title 
                      ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                  }`} onClick={() => fetchRoadmap(role)}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-white/80 text-sm">{role.title}</h4>
                      <ChevronRight size={16} className="text-white/20 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-white/40 mb-3">{role.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-bold">{role.avgSalary}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-bold">{role.demand} Demand</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Roadmap Section */}
      {roadmapLoading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/40 text-sm">Generating your personalized roadmap...</p>
        </div>
      )}
      {roadmap && !roadmapLoading && (
        <Card className="glass-card-premium p-8 neon-border-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-black tracking-tight text-gradient-primary">{roadmap.title}</CardTitle>
            <p className="text-white/40 text-xs mt-1">Estimated Duration: {roadmap.estimatedDuration}</p>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {/* Phases */}
            <div className="space-y-4">
              {(roadmap.phases || []).map((phase, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-black">
                      P{phase.phase}
                    </div>
                    <div>
                      <h4 className="font-bold text-white/80">{phase.title}</h4>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{phase.duration}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/50">{phase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {(phase.skills || []).map((s, j) => (
                      <span key={j} className="text-[10px] px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">{s}</span>
                    ))}
                    {(phase.tools || []).map((t, j) => (
                      <span key={j} className="text-[10px] px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent font-bold">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Tips */}
            {roadmap.tips?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black tracking-widest uppercase text-white/30">Pro Tips</h4>
                {roadmap.tips.map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/50 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <Star size={14} className="text-yellow-400 shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <Card className="glass-card-premium p-6 neon-border-primary">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary"><BookOpen size={20} /></div>
            <CardTitle className="text-xl">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {enrolledCourses.map((progress, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div>
                  <p className="font-bold text-white/80">{progress.course?.title || 'Course'}</p>
                  <p className="text-xs text-white/30">{progress.course?.category || ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${levelColors[progress.level] || 'text-white/40'}`}>
                    {progress.level}★
                  </span>
                  <span className="text-[10px] font-black tracking-widest uppercase text-white/30">
                    {levelNames[progress.level] || 'Level ' + progress.level}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
