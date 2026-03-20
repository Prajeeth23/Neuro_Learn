import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { User, Mail, Shield, BookOpen, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function ProfilePage() {
  const { session, user, isAdmin } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userLevel, setUserLevel] = useState(null);

  // Derive display info from the session user object
  const authUser = session?.user || user;
  const fullName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Pioneer';
  const initials = authUser?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || authUser?.email?.substring(0, 2).toUpperCase() || '??';
  const email = authUser?.email || 'Unknown';
  const joinedDate = authUser?.created_at ? new Date(authUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
  const provider = authUser?.app_metadata?.provider || 'email';

  useEffect(() => {
    async function fetchProfileData() {
      try {
        // Fetch enrolled courses and levels
        const { data: progressData } = await api.get('/progress');
        if (progressData && progressData.length > 0) {
          setEnrolledCourses(progressData);
          // Get the most recent/highest level
          const levels = progressData.map(p => p.level).filter(Boolean);
          if (levels.length > 0) {
            setUserLevel(Math.max(...levels));
          }
        }
      } catch (err) {
        console.error('Failed to load profile data', err);
      }
    }
    fetchProfileData();
  }, []);

  const levelNames = { 3: 'Beginner', 4: 'Intermediate', 5: 'Advanced' };
  const levelColors = { 3: 'text-green-400', 4: 'text-yellow-400', 5: 'text-purple-400' };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="glass-card-premium p-6 neon-border-primary">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <User size={20} />
            </div>
            <CardTitle className="text-xl">Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Full Name</span>
              <span className="text-white/90 font-medium">{fullName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Email</span>
              <span className="text-white/90 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{email}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Joined</span>
              <span className="text-white/90 font-medium">{joinedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">Role</span>
              <span className={`font-bold text-xs uppercase tracking-widest px-2 py-1 rounded ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                {isAdmin ? 'Admin' : 'Student'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="glass-card-premium p-6 neon-border-primary">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
              <Shield size={20} />
            </div>
            <CardTitle className="text-xl">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Auth Provider</span>
              <span className="text-white/90 font-medium capitalize">{provider}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Account ID</span>
              <span className="text-white/50 font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">{authUser?.id || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">Session</span>
              <span className="text-green-400 font-bold text-xs uppercase tracking-widest bg-green-400/10 px-2 py-1 rounded">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <Card className="glass-card-premium p-6 neon-border-primary">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
              <BookOpen size={20} />
            </div>
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
