import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Activity, BookOpen, Brain, Clock, Target, TrendingUp, Sparkles, Loader2, Star, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import api from '../lib/api';
import { useScreenTime } from '../hooks/useScreenTime';

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
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    if (!analytics) return;
    setInsightsLoading(true);
    try {
      const { data } = await api.post('/ai/learning-insights', { progressData: analytics });
      setInsights(data);
    } catch (err) {
      console.error('Failed to get insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const levelNames = { 3: 'Beginner', 4: 'Intermediate', 5: 'Advanced' };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="animate-fade-in w-full mb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Intelligence Node</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">
            Learning <span className="text-primary italic">Analytics</span>
          </h1>
          <p className="text-slate-500 font-medium">Real-time telemetry and cognitive performance metrics</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={insightsLoading}
          className="btn-primary group"
        >
          {insightsLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="text-white mr-2 group-hover:scale-110 transition-transform" />}
          {insightsLoading ? 'Analyzing Performance...' : 'Generate AI Insights'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="surface-elevated p-8 flex flex-col gap-8 group hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Input</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><Clock size={20} /></div>
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold tracking-tighter text-slate-900">
              {summary.totalScreenTimeMinutes || 0}
              <span className="text-sm font-bold text-slate-300 ml-2 uppercase tracking-widest">Min</span>
            </p>
          </div>
        </Card>

        <Card className="surface-elevated p-8 flex flex-col gap-8 group hover:border-secondary/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg Cognition</h3>
            <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all"><Target size={20} /></div>
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold tracking-tighter text-slate-900">
              {summary.avgQuizScore || 0}
              <span className="text-sm font-bold text-slate-300 ml-2 uppercase tracking-widest">%</span>
            </p>
          </div>
        </Card>

        <Card className="surface-elevated p-8 flex flex-col gap-8 group hover:border-primary/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Paths Sync</h3>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all"><BookOpen size={20} /></div>
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold tracking-tighter text-slate-900">
              {summary.coursesEnrolled || 0}
              <span className="text-sm font-bold text-slate-300 ml-2 uppercase tracking-widest">Active</span>
            </p>
          </div>
        </Card>

        <Card className="surface-elevated p-8 flex flex-col gap-8 group hover:border-amber-200 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Synthesizer</h3>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all"><Star size={20} /></div>
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold tracking-tighter text-slate-900">
              {summary.avgLevel || 3}
              <span className="text-sm font-bold text-slate-300 ml-2 uppercase tracking-widest">Grade</span>
            </p>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      {insights && (
        <Card className="surface-elevated p-8 md:p-10 !rounded-[2.5rem] mb-12 bg-gradient-to-br from-white to-slate-50/50 border-secondary/20">
          <CardHeader className="p-0 mb-10">
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-2xl">
                 <Brain size={28} className="text-secondary" />
              </div>
              Executive Learning Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Best Study Time */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-amber-50 rounded-xl">
                      <Clock size={18} className="text-amber-500" />
                   </div>
                   <h4 className="text-xs font-bold tracking-widest uppercase text-slate-400">Peak Performance Window</h4>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed italic">"{insights.bestStudyTime}"</p>
              </div>

              {/* Next Recommendation */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/5 rounded-xl">
                      <TrendingUp size={18} className="text-primary" />
                   </div>
                   <h4 className="text-xs font-bold tracking-widest uppercase text-slate-400">Strategic Next Step</h4>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed italic">"{insights.nextRecommendation}"</p>
              </div>

              {/* Weak Areas */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-50 rounded-xl">
                      <Shield size={18} className="text-red-400" />
                   </div>
                   <h4 className="text-xs font-bold tracking-widest uppercase text-slate-400">Vulnerabilities</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(insights.weakAreas || []).map((area, i) => (
                    <span key={i} className="text-[10px] px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-bold border border-red-100">{area}</span>
                  ))}
                  {(!insights.weakAreas || insights.weakAreas.length === 0) && <p className="text-slate-400 text-sm font-medium">None detected.</p>}
                </div>
              </div>

              {/* Revision Suggestions */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-50 rounded-xl">
                      <CheckCircle size={18} className="text-green-500" />
                   </div>
                   <h4 className="text-xs font-bold tracking-widest uppercase text-slate-400">Maintenance Paths</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(insights.revisionSuggestions || []).map((topic, i) => (
                    <span key={i} className="text-[10px] px-3 py-1.5 rounded-full bg-green-50 text-green-600 font-bold border border-green-100">{topic}</span>
                  ))}
                  {(!insights.revisionSuggestions || insights.revisionSuggestions.length === 0) && <p className="text-slate-400 text-sm font-medium">Optimized status reached.</p>}
                </div>
              </div>
            </div>

            {/* General Insights */}
            {insights.insights && insights.insights.length > 0 && (
              <div className="mt-10 space-y-4">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 ml-2">Contextual Observations</h4>
                <div className="grid grid-cols-1 gap-3">
                  {insights.insights.map((insight, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm text-slate-600 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group hover:border-secondary/30 transition-all">
                      <Sparkles size={16} className="text-secondary opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
                      <span className="font-medium leading-relaxed">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Progress */}
        <Card className="surface-elevated !rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>Curriculum Progression</span>
              <BookOpen size={18} className="text-slate-300" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(!analytics?.progress || analytics.progress.length === 0) ? (
               <div className="p-12 text-center text-slate-400 font-medium italic">No curriculum data archived.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {analytics.progress.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex-1 min-w-0 mr-6">
                      <p className="font-bold text-slate-900 truncate text-base">{p.course?.title || 'Unknown Path'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{p.course?.category || 'General'}</p>
                    </div>
                    <div className="text-right shrink-0">
                       <Badge className="bg-primary/5 text-primary border-none font-bold px-4">Level {p.level || 1}</Badge>
                       <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1.5">{levelNames[p.level] || 'Entry'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quiz Results */}
        <Card className="surface-elevated !rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>Diagnostic Ledger</span>
              <Activity size={18} className="text-slate-300" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(!analytics?.quizResults || analytics.quizResults.length === 0) ? (
              <div className="p-12 text-center text-slate-400 font-medium italic">No diagnostic results recorded.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {analytics.quizResults.slice(0, 8).map((q, i) => (
                  <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm border ${
                        q.score >= 70 ? 'bg-green-50 text-green-600 border-green-100' :
                        q.score >= 50 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        <span className="text-sm font-black leading-none">{q.score}%</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate capitalize">{q.quiz_type || 'General Diagnostic'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(q.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.total_questions} Questions</span>
                       <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <div key={s} className={`w-1 h-1 rounded-full ${s <= (q.score/20) ? 'bg-primary' : 'bg-slate-200'}`}></div>
                          ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
