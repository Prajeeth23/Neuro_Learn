import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Activity, BookOpen, Brain, Clock, Target, TrendingUp, Sparkles, Loader2, Star, ChevronRight, Zap } from 'lucide-react';
import api from '../lib/api';
import { useScreenTime } from '../hooks/useScreenTime';
import { Button } from '../components/ui/Button';

export default function LearningTrackerPage() {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useScreenTime(); // Track time on this page

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/progress/analytics');
      setAnalytics(data);
    } catch (err) { console.error('Failed to load analytics:', err); } finally { setLoading(false); }
  };

  const fetchInsights = async () => {
    if (!analytics) return;
    setInsightsLoading(true);
    try {
      const { data } = await api.post('/ai/learning-insights', { progressData: analytics });
      setInsights(data);
    } catch (err) { console.error('Failed to get insights:', err); } finally { setInsightsLoading(false); }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-8 grayscale opacity-40">
        <Loader2 className="animate-spin text-black" size={48} />
        <p className="text-[10px] font-black tracking-[0.4em] uppercase">Aggregating Learning Nodes...</p>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="animate-fade-in-up w-full mb-32 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 px-1">
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase italic leading-[0.9] mb-6">
            Spectral <span className="text-gradient-indigo">Pulse</span>
          </h1>
          <p className="text-[11px] font-black tracking-[0.4em] uppercase opacity-60">Real-time Performance / Neural Activity v.2.0</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={insightsLoading}
          className="btn-primary group !py-4 px-8"
        >
          {insightsLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
          <span className="text-[11px] font-black uppercase tracking-widest">{insightsLoading ? 'CALIBRATING...' : 'AI INSIGHT SYNC'}</span>
        </button>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'SCREEN TIME', val: summary.totalScreenTimeMinutes || 0, unit: 'MIN', icon: <Clock size={18} />, glow: 'glow-indigo' },
          { label: 'CALIBRATION', val: summary.avgQuizScore || 0, unit: '%', icon: <Target size={18} />, glow: 'glow-teal' },
          { label: 'ACTIVE NODES', val: summary.coursesEnrolled || 0, unit: 'DOM', icon: <BookOpen size={18} />, glow: 'glow-violet' },
          { label: 'NEURAL RANK', val: summary.avgLevel || 3, unit: '★', icon: <Star size={18} />, glow: 'glow-indigo' },
        ].map((stat, i) => (
          <Card key={i} className="card-luxe !p-8 group hover:scale-[1.03]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-80 transition-opacity">{stat.label}</h3>
              <div className={`w-10 h-10 rounded-xl glass-luxe flex items-center justify-center transition-all ${stat.glow}`}>{stat.icon}</div>
            </div>
            <p className="text-5xl font-black tracking-tighter italic leading-none text-black">
              {stat.val}
              <span className="text-sm ml-2 not-italic font-black tracking-widest opacity-30">{stat.unit}</span>
            </p>
          </Card>
        ))}
      </div>

      {/* AI Diagnostic Layer */}
      {insights && (
        <Card className="card-luxe !bg-black text-white !p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 grayscale group-hover:opacity-10 transition-opacity pointer-events-none duration-1000"><Brain size={180} /></div>
          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-4 border-b border-white/10 pb-10">
               <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white glow-indigo shadow-lg">
                 <Zap size={24} fill="currentColor" />
               </div>
               <div>
                 <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1">Neural Diagnostic</h3>
                 <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">System-wide calibration report</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Study Window</h4>
                <p className="text-lg font-black text-white/90 leading-tight uppercase italic">{insights.bestStudyTime}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Next Target</h4>
                <p className="text-lg font-black text-white/90 leading-tight uppercase italic">{insights.nextRecommendation}</p>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Weak Points</h4>
                <div className="flex flex-wrap gap-2">
                  {(insights.weakAreas || []).map((area, i) => (
                    <span key={i} className="badge-indigo !bg-indigo-500/20 !text-white !border-indigo-500/40">{area}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Maintenance</h4>
                <div className="flex flex-wrap gap-2">
                  {(insights.revisionSuggestions || []).map((topic, i) => (
                    <span key={i} className="badge-teal !bg-teal-500/20 !text-white !border-teal-500/40">{topic}</span>
                  ))}
                </div>
              </div>
            </div>

            {insights.insights && (
              <div className="pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 glass-luxe !bg-white/5 border-white/5 group hover:border-white/20 transition-all rounded-3xl">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 group-hover:scale-125 transition-transform glow-indigo" />
                    <p className="text-[12px] text-white/70 font-bold leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Persistence Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Node Progress */}
        <div className="space-y-8">
           <div className="space-y-1">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none" style={{color:'#191C1E'}}>Node Maturity</h3>
              <p className="text-[9px] font-black tracking-[0.3em] uppercase" style={{color:'#464555'}}>Synchronized domain levels</p>
           </div>
           <div className="grid grid-cols-1 gap-4">
              {(analytics?.progress || []).map((p, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl flex justify-between items-center group transition-all" style={{border:'1px solid #E0E3E5'}}>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase italic" style={{color:'#191C1E'}}>{p.course?.title || 'NODE'}</p>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md inline-block" style={{background:'#EEF2FF', color:'#4F46E5'}}>{p.course?.category?.toUpperCase() || ''}</span>
                  </div>
                  <div className="flex items-center gap-6">
                     <span className="text-xl font-black italic tracking-tighter" style={{color:'#191C1E'}}>{p.level}★</span>
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all" style={{background:'#EEF2FF', color:'#4F46E5'}}><ChevronRight size={18} /></div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Historical Logs */}
        <div className="space-y-8">
           <div className="space-y-1">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none" style={{color:'#191C1E'}}>Historical Logs</h3>
              <p className="text-[9px] font-black tracking-[0.3em] uppercase" style={{color:'#464555'}}>Recent Calibration Signatures</p>
           </div>
           <div className="space-y-3">
              {(analytics?.quizResults || []).slice(0, 8).map((q, i) => (
                <div key={i} className="p-4 rounded-xl flex items-center justify-between group transition-all" style={{background:'#F8FAFC', border:'1px solid #E0E3E5'}}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black italic border ${
                      q.score >= 70 ? 'text-white shadow-lg' : ''
                    }`} style={q.score >= 70 ? {background:'linear-gradient(135deg,#3525CD,#4F46E5)', borderColor:'#4F46E5'} : {background:'#FFFFFF', color:'#464555', border:'1px solid #E0E3E5'}}>
                      {q.score}%
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase italic tracking-tight" style={{color:'#191C1E'}}>{q.quiz_type?.toUpperCase() || 'PROBE'}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest" style={{color:'#464555'}}>{new Date(q.created_at).toLocaleDateString().toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black italic" style={{color:'#464555'}}>{q.total_questions.toString().padStart(2, '0')} NODES</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
