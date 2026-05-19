import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BarChart3, TrendingUp, Clock, Brain, Loader2, Sparkles, Activity, Users, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useScreenTime } from '../hooks/useScreenTime';

const COLORS = ['#4F46E5', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];

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
  const { user, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cohortsLoading, setCohortsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useScreenTime();

  useEffect(() => {
    fetchData();
    if (isAdmin) {
      fetchCohorts();
    }
  }, [isAdmin]);

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

  const fetchCohorts = async () => {
    setCohortsLoading(true);
    try {
      const { data } = await api.get('/admin/cohorts');
      setCohorts(data);
    } catch (err) {
      console.error('Failed to load cohorts:', err);
    } finally {
      setCohortsLoading(false);
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

  // Pre-process User Data
  const quizScoreData = (analytics?.quizResults || []).map((q, i) => ({
    quiz: `Quiz ${i + 1}`,
    score: q.score,
    type: q.quiz_type,
    date: new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const displayBarData = quizScoreData.length > 0 ? quizScoreData : [
    { quiz: 'Quiz 1', score: 85 },
    { quiz: 'Quiz 2', score: 90 },
    { quiz: 'Quiz 3', score: 75 },
    { quiz: 'Quiz 4', score: 95 },
  ];

  // Group user progress by category
  const categoryDataMap = {};
  (analytics?.progress || []).forEach(p => {
    const category = p.course?.category || 'General';
    categoryDataMap[category] = (categoryDataMap[category] || 0) + 1;
  });

  const pieData = Object.keys(categoryDataMap).map((cat) => ({
    name: cat,
    value: categoryDataMap[cat],
  }));

  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'AI & Machine Learning', value: 4 },
    { name: 'Full-Stack Development', value: 3 },
    { name: 'Data Structures', value: 2 },
    { name: 'Design Systems', value: 1 },
  ];

  // Helper for Cohort Cell Coloring
  const getHeatmapColor = (percentage) => {
    if (percentage >= 80) return 'bg-[#4F46E5] text-white';
    if (percentage >= 60) return 'bg-[#6366F1]/80 text-white';
    if (percentage >= 40) return 'bg-[#8B5CF6]/60 text-white';
    if (percentage >= 20) return 'bg-[#A78BFA]/40 text-gray-900';
    if (percentage > 0) return 'bg-[#C084FC]/20 text-gray-800';
    return 'bg-gray-50 text-gray-400';
  };

  return (
    <div className="animate-fade-in-up w-full px-2">
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
            Neural <span className="text-[#4F46E5]">{isAdmin ? 'Admin Panel' : 'Analytics'}</span>
          </h1>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-[#777587] mt-3 ml-1">
            {isAdmin ? 'System-wide User Retention Matrix' : 'Personalized Progress Analysis'}
          </p>
        </div>
        {!isAdmin && (
          <button onClick={fetchInsights} disabled={insightsLoading}
            className="uiverse-btn !rounded-xl flex items-center gap-2.5 active:scale-95 transition-transform">
            {insightsLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-gray-300" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{insightsLoading ? 'CALCULATING...' : 'GENERATE AI INSIGHTS'}</span>
          </button>
        )}
      </div>

      {/* Admin Cohort Heatmap View */}
      {isAdmin ? (
        <div className="space-y-8 mb-20">
          <Card className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
            <CardHeader className="p-0 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-base font-black uppercase tracking-widest text-black flex items-center gap-3">
                  <Users size={18} className="text-[#4F46E5]" /> User Retention Cohort Heatmap
                </CardTitle>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold bg-gray-50 px-3 py-1.5 rounded-lg">
                  <HelpCircle size={14} /> Groups users by registration week and tracks subsequent engagement.
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {cohortsLoading ? (
                <div className="py-20 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-[#4F46E5]" size={24} />
                  <span>Computing user matrices...</span>
                </div>
              ) : cohorts.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-48 px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Cohort Week</th>
                        <th className="w-24 px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Users</th>
                        {[0, 1, 2, 3, 4].map((wk) => (
                          <th key={wk} className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Week {wk}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {cohorts.map((cohort, cIdx) => (
                        <tr key={cIdx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-gray-800">
                            {cohort.cohort}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-gray-400">
                            {cohort.totalUsers} {cohort.totalUsers === 1 ? 'user' : 'users'}
                          </td>
                          {cohort.retention.map((ret, rIdx) => (
                            <td key={rIdx} className="p-1.5">
                              <div className={`py-3 px-2 rounded-xl text-center font-extrabold text-xs transition-all relative group cursor-pointer ${getHeatmapColor(ret.percentage)}`}>
                                <span>{ret.percentage}%</span>
                                
                                {/* Hover Tooltip details */}
                                <div className="absolute z-30 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 scale-0 group-hover:scale-100 transition-all origin-bottom bg-black text-white text-[10px] font-bold p-3.5 rounded-xl shadow-xl pointer-events-none leading-relaxed">
                                  <div className="font-black border-b border-white/20 pb-1 mb-1">WEEK {ret.week} RETENTION</div>
                                  <div className="flex justify-between">
                                    <span>Active Users:</span>
                                    <span className="text-indigo-200">{ret.activeUsers}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Cohort Size:</span>
                                    <span className="text-indigo-200">{cohort.totalUsers}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center text-gray-400 text-xs">No cohort logs calculated yet. Ensure users have activity history.</div>
              )}

              {/* Heatmap Legend */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-50 pt-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Retention Intensity</span>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-gray-400 mr-2">0%</span>
                  <span className="w-6 h-6 rounded bg-gray-50 border border-gray-100" />
                  <span className="w-6 h-6 rounded bg-[#C084FC]/20" />
                  <span className="w-6 h-6 rounded bg-[#A78BFA]/40" />
                  <span className="w-6 h-6 rounded bg-[#8B5CF6]/60" />
                  <span className="w-6 h-6 rounded bg-[#6366F1]/80" />
                  <span className="w-6 h-6 rounded bg-[#4F46E5]" />
                  <span className="text-[9px] font-bold text-gray-400 ml-2">100%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Regular User View — EXCLUSIVELY Pie Chart and Bar Chart */
        <div className="space-y-12 mb-20">
          {/* AI Insights Banner */}
          {insights && (
            <Card className="bg-white border border-[#ECEEF0] rounded-[2rem] p-8 shadow-sm animate-in zoom-in-95 duration-500 overflow-hidden relative">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Pie Chart — Domain/Category Allocation */}
            <Card className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-3">
                  <Brain size={16} className="text-[#4F46E5]" /> Learning Portfolio Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col justify-center">
                <div className="h-[280px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {displayPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 2. Bar Chart — Quiz Scores & Retention Accuracy */}
            <Card className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-3">
                  <Activity size={16} className="text-[#8B5CF6]" /> Retention Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col justify-center">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="quiz" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" name="Score (%)" fill="#4F46E5" radius={[10, 10, 0, 0]}>
                        {displayBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#8B5CF6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
