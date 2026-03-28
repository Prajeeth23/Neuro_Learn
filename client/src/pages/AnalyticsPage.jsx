import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BarChart3, TrendingUp, Clock, Brain, Loader2, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import api from '../lib/api';
import { useScreenTime } from '../hooks/useScreenTime';

const chartTheme = {
  bg: 'rgba(255,255,255,0.02)',
  grid: 'rgba(255,255,255,0.05)',
  text: 'rgba(255,255,255,0.4)',
  primary: '#7c3aed',
  accent: '#06b6d4',
  secondary: '#f59e0b',
  green: '#22c55e',
  red: '#ef4444',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-xs text-white/50 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useScreenTime();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const { data } = await api.get('/progress/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      const errorData = err.response?.data?.error || err.message || 'Failed to load analytics';
      setError(typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : errorData);
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

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/30 text-sm">Loading analytics...</p>
      </div>
    );
  }

  // Prepare chart data
  const screenTimeData = (analytics?.screenTime || []).map(s => ({
    date: new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    minutes: Math.round(s.duration_seconds / 60),
  })).reverse();

  const quizScoreData = (analytics?.quizResults || []).map((q, i) => ({
    quiz: `Q${i + 1}`,
    score: q.score,
    type: q.quiz_type,
    date: new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const levelProgressData = (analytics?.progress || []).map(p => ({
    course: p.course?.title?.substring(0, 20) || 'Course',
    level: p.level || 3,
  }));

  // Combine screen time with quiz performance for correlation chart
  const correlationData = screenTimeData.map((st, i) => {
    const matchingQuiz = quizScoreData.find(q => q.date === st.date);
    return {
      date: st.date,
      screenTime: st.minutes,
      quizScore: matchingQuiz?.score || null,
    };
  }).filter(d => d.quizScore !== null);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-20">
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchData} className="text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors">Retry</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Analytics <span className="text-accent underline decoration-primary/30 underline-offset-8">Dashboard</span>
          </h1>
          <p className="text-white/40 font-medium tracking-widest uppercase text-[10px]">Performance visualization & insights</p>
        </div>
        <button onClick={fetchInsights} disabled={insightsLoading}
          className="uiverse-btn !text-xs !px-6 !py-3 font-black tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20">
          {insightsLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-accent" />}
          {insightsLoading ? 'Analyzing...' : 'Generate AI Insights'}
        </button>
      </div>

      {/* AI Insights Banner */}
      {insights && (
        <Card className="glass-card-premium neon-border-primary p-8 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <Brain size={22} className="text-accent" />
            <h3 className="text-lg font-black tracking-tight text-gradient-primary">AI Performance Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(insights.insights || []).map((insight, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/60 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <Sparkles size={14} className="text-accent shrink-0" />
                {insight}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Screen Time Chart */}
        <Card className="glass-card-premium p-6 border-white/5">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Clock size={18} className="text-primary" /> Screen Time (minutes/day)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {screenTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={screenTimeData}>
                  <defs>
                    <linearGradient id="colorScreenTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartTheme.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="date" tick={{ fill: chartTheme.text, fontSize: 10 }} />
                  <YAxis tick={{ fill: chartTheme.text, fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="minutes" name="Minutes" stroke={chartTheme.primary} fill="url(#colorScreenTime)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-white/20 text-sm">No screen time data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Scores Chart */}
        <Card className="glass-card-premium p-6 border-white/5">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <BarChart3 size={18} className="text-accent" /> Quiz Scores Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {quizScoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={quizScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="quiz" tick={{ fill: chartTheme.text, fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: chartTheme.text, fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" name="Score" fill={chartTheme.accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-white/20 text-sm">No quiz data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Screen Time vs Performance (correlation) */}
        <Card className="glass-card-premium p-6 border-white/5">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-green-400" /> Screen Time vs Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {correlationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="date" tick={{ fill: chartTheme.text, fontSize: 10 }} />
                  <YAxis tick={{ fill: chartTheme.text, fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="screenTime" name="Screen Time (min)" stroke={chartTheme.primary} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="quizScore" name="Quiz Score (%)" stroke={chartTheme.green} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-white/20 text-sm">Need more data for correlation</div>
            )}
          </CardContent>
        </Card>

        {/* Level Progression */}
        <Card className="glass-card-premium p-6 border-white/5">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-yellow-400" /> Level Progression by Course
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {levelProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={levelProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: chartTheme.text, fontSize: 10 }} />
                  <YAxis dataKey="course" type="category" tick={{ fill: chartTheme.text, fontSize: 10 }} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="level" name="Level" fill={chartTheme.secondary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-white/20 text-sm">No level data yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
