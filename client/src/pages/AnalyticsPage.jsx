import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BarChart3, TrendingUp, Clock, Brain, Loader2, Sparkles, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import api from '../lib/api';
import { useScreenTime } from '../hooks/useScreenTime';

const chartTheme = {
  bg: '#ffffff',
  grid: '#ECEEF0',
  text: '#464555',
  primary: '#4F46E5',  // Indigo
  accent: '#3525CD',   // Deep Indigo
  secondary: '#006A61', // Teal
  light: '#E2DFFF',    // Indigo light
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-luxe rounded-2xl px-5 py-4 border-indigo-200/50 shadow-lg">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 text-indigo-600 opacity-80">{label}</p>
        <div className="space-y-2">
          {payload.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color || p.fill, boxShadow: `0 0 10px ${p.color || p.fill}44` }} />
                <span className="text-[12px] font-bold text-black opacity-70">{p.name}</span>
              </div>
              <span className="text-[12px] font-black text-black">{p.value}</span>
            </div>
          ))}
        </div>
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
      setError(err.response?.data?.error || err.message || 'Data retrieval failed');
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
      <div className="text-center py-20 grayscale opacity-40">
        <Loader2 className="animate-spin text-black mx-auto mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-black">Syncing metrics...</p>
      </div>
    );
  }

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
    course: p.course?.title?.substring(0, 15) || 'Node',
    level: p.level || 3,
  }));

  const correlationData = screenTimeData.map((st, i) => {
    const matchingQuiz = quizScoreData.find(q => q.date === st.date);
    return {
      date: st.date,
      screenTime: st.minutes,
      quizScore: matchingQuiz?.score || null,
    };
  }).filter(d => d.quizScore !== null);

  return (
    <div className="animate-fade-in-up w-full">
      
      {error && (
        <div className="mb-8 p-4 bg-white border border-black/10 rounded-xl flex items-center justify-between shadow-sm capitalize">
          <span className="text-xs font-bold text-black/70">{error}</span>
          <button onClick={fetchData} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-black text-white rounded-lg">Retry</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 px-1">
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase italic leading-[0.9] mb-6">
            Neural <span className="text-gradient-indigo">Metrics</span>
          </h1>
          <p className="text-[11px] font-black tracking-[0.4em] uppercase opacity-60">Performance visualization node v.4.0</p>
        </div>
        <button onClick={fetchInsights} disabled={insightsLoading}
          className="btn-primary group !py-4 px-8">
          {insightsLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
          <span className="text-[11px] font-black uppercase tracking-widest">{insightsLoading ? 'RECALIBRATING...' : 'SYNC AI INTELLIGENCE'}</span>
        </button>
      </div>

      {/* AI Insights Banner */}
      {insights && (
        <Card className="card-luxe p-10 mb-16 shadow-lg border-indigo-200/20">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white glow-indigo shadow-xl">
              <Brain size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-black tracking-tight uppercase italic mb-1">Intelligence Report</h3>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Synthetic analysis complete</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(insights.insights || []).map((insight, i) => (
              <div key={i} className="flex items-start gap-5 glass-luxe p-6 rounded-2xl border-indigo-100/30 group hover:border-indigo-300 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{i+1}</div>
                <span className="text-xs leading-relaxed font-semibold text-secondary">{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        
        {/* Screen Time Chart */}
        <Card className="card-luxe p-8">
          <CardHeader className="p-0 mb-10">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-black flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl glass-luxe flex items-center justify-center text-indigo-600 glow-indigo">
                <Clock size={16} />
              </div>
              Engagement Entropy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {screenTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={screenTimeData}>
                  <defs>
                    <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F6" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 800 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 800 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4F46E5', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="minutes" name="Input (min)" stroke="#3525CD" fill="url(#colorIndigo)" strokeWidth={4} animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center gap-4 opacity-40 italic">
                <Clock size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">No active nodes captured</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Scores Chart */}
        <Card className="card-luxe p-8">
          <CardHeader className="p-0 mb-10">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-black flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl glass-luxe flex items-center justify-center text-teal-600 glow-teal">
                <Activity size={16} />
              </div>
              Retention Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {quizScoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={quizScoreData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F6" vertical={false} />
                  <XAxis dataKey="quiz" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 800 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 800 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 70, 229, 0.05)', radius: 10 }} />
                  <Bar dataKey="score" name="Accuracy (%)" fill="url(#barGradient)" radius={[10, 10, 0, 0]} animationDuration={2000} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center gap-4 opacity-40 italic">
                <Activity size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">No spectral results stored</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Level Progression — B&W Grayscale */}
        <Card className="bg-white p-8 rounded-[2rem] shadow-sm" style={{border:'1px solid #ECEEF0'}}>
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-3">
              <TrendingUp size={16} style={{color:'#4F46E5'}} /> Node Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {levelProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={levelProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
                  <YAxis dataKey="course" type="category" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 9, fontWeight: 800 }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="level" name="Sync Level" fill="#3525CD" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'#EEF2FF'}}><TrendingUp size={24} style={{color:'#4F46E5'}} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{color:'#191C1E'}}>No Node Data</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Combined View */}
        <Card className="bg-white p-8 rounded-[2rem] shadow-sm" style={{border:'1px solid #ECEEF0'}}>
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-3">
              <TrendingUp size={16} style={{color:'#4F46E5'}} /> Efficiency Correlation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {correlationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="screenTime" name="Time Input" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 4, fill: '#4F46E5' }} />
                  <Line type="monotone" dataKey="quizScore" name="Accuracy" stroke="#006A61" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4, fill: '#006A61' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'#EEF2FF'}}><TrendingUp size={24} style={{color:'#4F46E5'}} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{color:'#191C1E'}}>No Correlation Data Yet</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
