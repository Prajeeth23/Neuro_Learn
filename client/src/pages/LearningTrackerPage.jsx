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
        <Loader2 className="animate-spin text-indigo-900" size={48} />
        <p className="text-[10px] font-black tracking-[0.4em] uppercase">Aggregating Learning Nodes...</p>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="animate-fade-in-up w-full mb-32 space-y-12">
      <div className="mb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 rounded-full mb-5 shadow-lg shadow-indigo-200">
          <Activity size={13} className="text-white" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-white">Real-time Performance Metrics / Neural Activity Log</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-4" style={{fontFamily:'Inter,sans-serif'}}>
          <span className="text-[#191C1E]">Learning </span><span className="text-[#4F46E5]">Pulse</span>
        </h1>
        <div className="w-20 h-1 rounded-full bg-indigo-500 mb-8" />
        <button
          onClick={fetchInsights}
          disabled={insightsLoading}
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-xs font-bold tracking-tight hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-100"
        >
          {insightsLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {insightsLoading ? 'CALIBRATING...' : 'AI INSIGHT SYNC'}
        </button>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'SCREEN TIME', val: summary.totalScreenTimeMinutes || 0, unit: 'MIN', icon: <Clock size={20} />, color: 'indigo' },
          { label: 'CALIBRATION', val: summary.avgQuizScore || 0, unit: '%', icon: <Target size={20} />, color: 'teal' },
          { label: 'ACTIVE NODES', val: summary.coursesEnrolled || 0, unit: 'DOM', icon: <BookOpen size={20} />, color: 'violet' },
          { label: 'NEURAL RANK', val: summary.avgLevel || 3, unit: '★', icon: <Star size={20} />, color: 'amber' },
        ].map((stat, i) => {
          const colors = {
            indigo: 'text-indigo-600 bg-indigo-50',
            teal: 'text-teal-600 bg-teal-50',
            violet: 'text-violet-600 bg-violet-50',
            amber: 'text-amber-600 bg-amber-50'
          };
          return (
            <Card key={i} className="bg-white border border-[#ECEEF0] p-8 rounded-[2.5rem] shadow-sm hover:shadow-card-lg transition-all duration-500 group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#777587]">{stat.label}</h3>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${colors[stat.color]}`}>{stat.icon}</div>
              </div>
              <p className="text-5xl font-extrabold tracking-tight text-[#191C1E] leading-none">{stat.val}<span className="text-sm text-[#C7C4D8] ml-2 font-bold tracking-normal">{stat.unit}</span></p>
            </Card>
          );
        })}
      </div>

      {/* AI Diagnostic Layer */}
      {insights && (
        <Card className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white p-12 rounded-[3.5rem] shadow-xl shadow-indigo-200/50 animate-in zoom-in duration-500 relative overflow-hidden border-none text-white">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white"><Brain size={180} /></div>
          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-4 border-b border-white/10 pb-8">
               <Zap className="text-[#818CF8]" size={28} />
               <h3 className="text-2xl font-bold tracking-tight uppercase leading-none">Neural Insights</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-indigo-300/60">OPTIMAL STUDY WINDOW</h4>
                <p className="text-sm font-semibold text-indigo-100 leading-relaxed uppercase">{insights.bestStudyTime}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-indigo-300/60">NEXT SYNC TARGET</h4>
                <p className="text-sm font-semibold text-indigo-100 leading-relaxed uppercase">{insights.nextRecommendation}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-indigo-300/60">RECALIBRATION REQUIRED</h4>
                <div className="flex flex-wrap gap-2">
                  {(insights.weakAreas || []).map((area, i) => (
                    <span key={i} className="text-[9px] px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-white font-bold tracking-tight uppercase">{area}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-indigo-300/60">MAINTENANCE NODES</h4>
                <div className="flex flex-wrap gap-2">
                  {(insights.revisionSuggestions || []).map((topic, i) => (
                    <span key={i} className="text-[9px] px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-white font-bold tracking-tight uppercase">{topic}</span>
                  ))}
                </div>
              </div>
            </div>

            {insights.insights && (
              <div className="pt-10 border-t border-white/10 flex flex-wrap gap-4">
                {insights.insights.map((insight, i) => (
                  <div key={i} className="flex-1 min-w-[300px] flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#818CF8] mt-1.5 shrink-0" />
                    <p className="text-[11px] text-indigo-100 font-medium leading-relaxed">{insight}</p>
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
              <h3 className="text-3xl font-black italic tracking-tighter text-indigo-900 uppercase leading-none">Node Maturity</h3>
              <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase">Synchronized domain levels</p>
           </div>
           <div className="grid grid-cols-1 gap-4">
              {(analytics?.progress || []).map((p, i) => (
                <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl flex justify-between items-center group hover:border-indigo-600 transition-all">
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase italic text-indigo-900">{p.course?.title || 'NODE'}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 italic">{p.course?.category?.toUpperCase() || ''}</p>
                  </div>
                  <div className="flex items-center gap-6">
                     <span className="text-xl font-black italic tracking-tighter text-indigo-900">{p.level}★</span>
                     <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-200 group-hover:text-indigo-900 transition-all"><ChevronRight size={18} /></div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Historical Logs */}
        <div className="space-y-8">
           <div className="space-y-1">
              <h3 className="text-3xl font-black italic tracking-tighter text-indigo-900 uppercase leading-none">Historical Logs</h3>
              <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase">Recent Calibration Signatures</p>
           </div>
           <div className="space-y-3">
              {(analytics?.quizResults || []).slice(0, 8).map((q, i) => (
                <div key={i} className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between group hover:bg-white hover:border-indigo-600 transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black italic border ${
                      q.score >= 70 ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-900/10' :
                      'bg-white text-gray-400 border-gray-100'
                    }`}>
                      {q.score}%
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase text-indigo-900 italic tracking-tight">{q.quiz_type?.toUpperCase() || 'PROBE'}</p>
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{new Date(q.created_at).toLocaleDateString().toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-200 italic">{q.total_questions.toString().padStart(2, '0')} NODES</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
