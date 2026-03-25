import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Activity, BookOpen, Brain, Clock, Target, TrendingUp, Sparkles, Loader2, Star } from 'lucide-react';
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
  const levelStars = { 3: '⭐⭐⭐', 4: '⭐⭐⭐⭐', 5: '⭐⭐⭐⭐⭐' };
  const levelColors = { 3: 'text-green-400', 4: 'text-yellow-400', 5: 'text-purple-400' };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/30 text-sm">Loading learning data...</p>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Learning <span className="text-secondary underline decoration-accent/30 underline-offset-8">Tracker</span>
          </h1>
          <p className="text-white/40 font-medium tracking-widest uppercase text-[10px]">Your performance at a glance</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={insightsLoading}
          className="uiverse-btn !text-xs !px-6 !py-3 font-black tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20"
        >
          {insightsLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-accent" />}
          {insightsLoading ? 'Analyzing...' : 'AI Study Suggestions'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="glass-card-premium neon-border-primary p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Screen Time</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><Clock size={20} /></div>
          </div>
          <p className="text-4xl font-black tracking-tighter">{summary.totalScreenTimeMinutes || 0}<span className="text-lg text-white/30 ml-1">min</span></p>
        </Card>

        <Card className="glass-card-premium neon-border-primary p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Avg Quiz Score</h3>
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent"><Target size={20} /></div>
          </div>
          <p className="text-4xl font-black tracking-tighter">{summary.avgQuizScore || 0}<span className="text-lg text-white/30 ml-1">%</span></p>
        </Card>

        <Card className="glass-card-premium neon-border-primary p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Courses</h3>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary"><BookOpen size={20} /></div>
          </div>
          <p className="text-4xl font-black tracking-tighter">{summary.coursesEnrolled || 0}</p>
        </Card>

        <Card className="glass-card-premium neon-border-primary p-6 group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Avg Level</h3>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400"><Star size={20} /></div>
          </div>
          <p className="text-4xl font-black tracking-tighter">{summary.avgLevel || 3}<span className="text-lg text-white/30 ml-1">★</span></p>
        </Card>
      </div>

      {/* AI Insights */}
      {insights && (
        <Card className="glass-card-premium neon-border-primary p-8 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-black tracking-tight text-gradient-primary flex items-center gap-3">
              <Brain size={24} /> AI Learning Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best Study Time */}
              <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 space-y-2">
                <h4 className="text-xs font-black tracking-widest uppercase text-accent/60 flex items-center gap-2">
                  <Clock size={14} /> Best Study Time
                </h4>
                <p className="text-sm text-white/70">{insights.bestStudyTime}</p>
              </div>

              {/* Next Recommendation */}
              <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 space-y-2">
                <h4 className="text-xs font-black tracking-widest uppercase text-primary/60 flex items-center gap-2">
                  <TrendingUp size={14} /> Next Step
                </h4>
                <p className="text-sm text-white/70">{insights.nextRecommendation}</p>
              </div>

              {/* Weak Areas */}
              <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 space-y-2">
                <h4 className="text-xs font-black tracking-widest uppercase text-red-400/60 flex items-center gap-2">
                  <Target size={14} /> Areas to Improve
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(insights.weakAreas || []).map((area, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold">{area}</span>
                  ))}
                </div>
              </div>

              {/* Revision Suggestions */}
              <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 space-y-2">
                <h4 className="text-xs font-black tracking-widest uppercase text-green-400/60 flex items-center gap-2">
                  <BookOpen size={14} /> Revision Suggestions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(insights.revisionSuggestions || []).map((topic, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-bold">{topic}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* General Insights */}
            {insights.insights && insights.insights.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-black tracking-widest uppercase text-white/40">Performance Insights</h4>
                {insights.insights.map((insight, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/60 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <Sparkles size={14} className="text-accent shrink-0" />
                    {insight}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Progress */}
      {(analytics?.progress || []).length > 0 && (
        <Card className="glass-card-premium p-8 mb-10">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-black tracking-tight">Course Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {analytics.progress.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-bold text-white/80 truncate">{p.course?.title || 'Course'}</p>
                  <p className="text-xs text-white/30 mt-0.5">{p.course?.category || ''}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className={`text-sm font-black ${levelColors[p.level] || 'text-white/40'}`}>
                      {levelStars[p.level] || '⭐⭐⭐'}
                    </span>
                    <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mt-0.5">
                      {levelNames[p.level] || 'Beginner'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Quiz Results */}
      {(analytics?.quizResults || []).length > 0 && (
        <Card className="glass-card-premium p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-black tracking-tight">Recent Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            {analytics.quizResults.slice(0, 10).map((q, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                    q.score >= 70 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    q.score >= 40 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {q.score}%
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/70 capitalize">{q.quiz_type || 'Quiz'}</p>
                    <p className="text-[10px] text-white/30">{new Date(q.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs font-black tracking-widest uppercase text-white/20">
                  {q.total_questions} Q
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
