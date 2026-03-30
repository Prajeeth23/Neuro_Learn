import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BarChart3, TrendingUp, Clock, Brain, Loader2, Sparkles, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import api from '../lib/api';
import { useScreenTime } from '../hooks/useScreenTime';

const chartTheme = {
  bg: '#ffffff',
  grid: '#f1f5f9',
  text: '#64748b',
  primary: '#4f46e5',  // Indigo 600
  accent: '#10b981',   // Emerald 500 (Teal-ish)
  secondary: '#8b5cf6', // Violet 500
  light: '#e2e8f0',    // Slate 200
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-card-md">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-black flex items-center gap-2" style={{ color: '#111111' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#191C1E] leading-none">
            Neural <span className="text-[#4F46E5]">Analytics</span>
          </h1>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-[#777587] mt-3 ml-1">Performance visualization node</p>
        </div>
        <button onClick={fetchInsights} disabled={insightsLoading}
          className="uiverse-btn !rounded-xl flex items-center gap-2.5 active:scale-95 transition-transform">
          {insightsLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-gray-300" />}
          <span className="text-[10px] font-black uppercase tracking-widest">{insightsLoading ? 'CALCULATING...' : 'GENERATE AI INSIGHTS'}</span>
        </button>
      </div>

      {/* AI Insights Banner */}
      {insights && (
        <Card className="bg-white border border-[#ECEEF0] rounded-[2rem] p-8 mb-12 shadow-sm animate-in zoom-in-95 duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5F3FF] rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200"><Brain size={20} /></div>
            <h3 className="text-xl font-bold text-[#191C1E] tracking-tight">Cognitive Intelligence Report</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {(insights.insights || []).map((insight, i) => (
              <div key={i} className="flex items-start gap-4 text-xs font-semibold text-gray-500 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="w-5 h-5 rounded bg-black text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i+1}</div>
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        
        {/* Screen Time Chart — B&W Grayscale */}
        <Card className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-3">
              <Clock size={16} className="text-gray-300" /> Interaction Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {screenTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={screenTimeData}>
                  <defs>
                    <linearGradient id="colorBw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111111" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="minutes" name="Engagement (min)" stroke="#6366f1" fill="url(#colorBw)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-200 text-[10px] font-black uppercase tracking-widest">No Interaction Data</div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Scores Chart — B&W Grayscale */}
        <Card className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-3">
              <Activity size={16} className="text-gray-300" /> Retention Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {quizScoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={quizScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="quiz" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" name="Score (%)" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-200 text-[10px] font-black uppercase tracking-widest">No Retention Data</div>
            )}
          </CardContent>
        </Card>

        {/* Level Progression — B&W Grayscale */}
        <Card className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-3">
              <TrendingUp size={16} className="text-gray-300" /> Node Progression
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
                  <Bar dataKey="level" name="Sync Level" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-200 text-[10px] font-black uppercase tracking-widest">No Node Data</div>
            )}
          </CardContent>
        </Card>

        {/* Combined View */}
        <Card className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-3">
              <TrendingUp size={16} className="text-gray-300" /> Efficiency Correlation
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
                  <Line type="monotone" dataKey="screenTime" name="Time Input" stroke="#111111" strokeWidth={3} dot={{ r: 4, fill: '#111111' }} />
                  <Line type="monotone" dataKey="quizScore" name="Accuracy" stroke="#888888" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#888888' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-200 text-[10px] font-black uppercase tracking-widest">Need Correlation Vectors</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
