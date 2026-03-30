import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api from '../lib/api';
import { Sparkles, Calendar, FileText, Upload, BookOpen, Target, ListChecks, Brain, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function PersonalizedPage() {
  const [materials, setMaterials] = useState([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'upload'
  
  const [title, setTitle] = useState('');
  const [materialText, setMaterialText] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('7');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [expandedPlan, setExpandedPlan] = useState(null);
  const [viewSection, setViewSection] = useState('summary'); 
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setError(null);
      const { data } = await api.get('/personalized');
      setMaterials(data || []);
    } catch (err) {
      console.error('Failed to load personalized materials', err);
      // If 404, it might mean the route registration failed on backend
      const errorMsg = err.response?.status === 404 
        ? "AI Module Initialization Error. Please contact admin." 
        : (err.response?.data?.error || err.message || 'Failed to connect to AI engine');
      setError(errorMsg);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('deadline_days', deadlineDays);
        await api.post('/personalized/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/personalized/generate', { 
          title, 
          material_text: materialText, 
          deadline_days: parseInt(deadlineDays) 
        });
      }
      setShowGenerate(false);
      setTitle(''); setMaterialText(''); setDeadlineDays('7'); setFile(null);
      await loadMaterials();
    } catch (err) {
      setError(err.response?.data?.error || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const openPlanView = (plan) => {
    setExpandedPlan(plan);
    setViewSection('summary');
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const getNotes = (plan) => {
    if (!plan.notes) return {};
    return typeof plan.notes === 'string' ? JSON.parse(plan.notes) : plan.notes;
  };

  const getStudyPlan = (plan) => {
    if (!plan.study_plan) return [];
    return typeof plan.study_plan === 'string' ? JSON.parse(plan.study_plan) : plan.study_plan;
  };

  const tabs = [
    { key: 'summary', label: 'Summary', icon: BookOpen },
    { key: 'topics', label: 'Topics', icon: Target },
    { key: 'points', label: 'Nodes', icon: ListChecks },
    { key: 'plan', label: 'Timeline', icon: Calendar },
    { key: 'quiz', label: 'Recall', icon: Brain },
  ];

  return (
    <div className="animate-fade-in-up w-full">
      
      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <div className="text-red-500"><XCircle size={18} /></div>
             <span className="text-xs font-semibold text-red-700">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-red-500 text-white rounded-lg hover:opacity-80 transition-opacity">Dismiss</button>
        </div>
      )}

      {/* Hero Header — Centered, Blue, Professional */}
      <div className="mb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 rounded-full mb-5 shadow-lg shadow-indigo-200">
          <Sparkles size={13} className="text-white" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-white">Personalized Study Node</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-4" style={{fontFamily:'Inter,sans-serif'}}>
          <span className="text-[#191C1E]">AI </span><span className="text-[#4F46E5]">Tutor</span>
        </h1>
        <div className="w-20 h-1 rounded-full bg-indigo-500 mb-4" />
        <p className="text-[#777587] text-sm font-medium max-w-md mx-auto">Generate personalized study plans from your materials using AI</p>
      </div>

      {/* Action Button Row — centered under header */}
      <div className="flex justify-center mb-12">
        <button 
          onClick={() => { setShowGenerate(!showGenerate); setExpandedPlan(null); }} 
          className="bg-[#4F46E5] hover:bg-[#3525CD] text-white px-8 py-4 rounded-xl font-semibold text-sm flex items-center gap-2.5 shadow-xl shadow-indigo-100 transition-all duration-200 active:scale-95"
        >
          {showGenerate ? <><XCircle size={15}/> <span>Close Panel</span></> : <><Sparkles size={15}/> <span>Initialize Study Plan</span></>}
        </button>
      </div>

      {/* Generator Form — Dark Blue Theme */}
      {showGenerate && (
        <div className="bg-gradient-to-br from-[#1E1B4B] to-[#0f0c29] border border-indigo-900/50 rounded-3xl p-8 mb-12 shadow-2xl shadow-indigo-900/20 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"><Sparkles size={16} /></div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Configure New Material</h2>
              <p className="text-xs text-indigo-300/60 font-medium">Sync your notes and get AI-powered insights</p>
            </div>
          </div>
          
          {/* Form content */}
          <div className="space-y-8">
            {/* Toggle tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 max-w-sm">
              <button onClick={() => setActiveTab('text')} className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all ${ activeTab === 'text' ? 'bg-indigo-500 text-white shadow-sm' : 'text-indigo-300 hover:text-white'}`}>Text Input</button>
              <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'upload' ? 'bg-indigo-500 text-white shadow-sm' : 'text-indigo-300 hover:text-white'}`}>File Upload</button>
            </div>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Physics Quantum Logic" className="w-full bg-gray-50 border border-gray-100 h-12 px-4 rounded-xl focus:ring-1 focus:ring-indigo-600 outline-none font-medium text-sm transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Timeline (Days)</label>
                  <input type="number" min="1" max="30" value={deadlineDays} onChange={e => setDeadlineDays(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 h-12 px-4 rounded-xl focus:ring-1 focus:ring-indigo-600 outline-none font-medium text-sm transition-all" />
                </div>
              </div>

              <div>
                {activeTab === 'text' ? (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Material Content</label>
                    <textarea value={materialText} onChange={e => setMaterialText(e.target.value)} required={activeTab === 'text'} placeholder="Paste your study notes here..." className="w-full h-32 bg-gray-50 border border-gray-100 p-4 rounded-xl focus:ring-1 focus:ring-indigo-600 outline-none font-medium text-sm transition-all resize-none" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Sync PDF/DOCX/JPG</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all group">
                       {file ? (
                         <div className="text-center font-bold text-xs"><FileText size={20} className="mx-auto mb-1 text-indigo-900"/> {file.name}</div>
                       ) : (
                         <div className="text-center text-gray-300 group-hover:text-gray-500 transition-colors"><Upload size={20} className="mx-auto mb-1"/> <span className="text-[10px] font-black uppercase tracking-widest">Select Source</span></div>
                       )}
                       <input ref={fileInputRef} type="file" accept=".pdf,.docx,.jpg,.jpeg,.png,.txt" onChange={handleFileChange} className="hidden" />
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <button type="submit" disabled={loading} className="bg-indigo-500 hover:bg-indigo-600 text-white w-full py-4 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20">
                  {loading ? <div className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> <span>Analyzing...</span></div> : <span>Sync & Analyze Now</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded View — B&W Style */}
      {expandedPlan && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-indigo-900/30 pb-5">
              <h2 className="text-2xl font-bold text-white tracking-tight">{expandedPlan.title}</h2>
              <button onClick={() => setExpandedPlan(null)} className="text-[10px] font-semibold uppercase tracking-wide px-4 py-2 bg-white/10 rounded-lg text-indigo-300 hover:bg-white/20 transition-colors">Close ✕</button>
            </div>

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setViewSection(tab.key)} className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase whitespace-nowrap border transition-all ${viewSection === tab.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}>
                  <Icon size={12} /> {tab.label}
                </button>
              );
            })}
          </div>

          <Card className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
            {viewSection === 'summary' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest border-l-2 border-indigo-600 pl-3 mb-6">Cognitive Summary</h3>
                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">{getNotes(expandedPlan).summary || 'Extraction incomplete.'}</p>
              </div>
            )}

            {viewSection === 'topics' && (
              <div className="space-y-6">
                 <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest border-l-2 border-indigo-600 pl-3 mb-6">Neural Nodes</h3>
                 <div className="flex flex-wrap gap-2">
                    {(getNotes(expandedPlan).keyTopics || []).map((topic, i) => (
                      <span key={i} className="px-5 py-2 rounded-lg bg-gray-50 border border-gray-100 text-indigo-900 text-xs font-black uppercase tracking-tight">{topic}</span>
                    ))}
                 </div>
              </div>
            )}

            {viewSection === 'points' && (
              <div className="space-y-6">
                <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest border-l-2 border-indigo-600 pl-3 mb-6">Key Insights</h3>
                <div className="space-y-3">
                   {(getNotes(expandedPlan).importantPoints || []).map((point, i) => (
                     <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-6 h-6 rounded bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</div>
                        <p className="text-sm text-gray-500 font-medium">{point}</p>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {viewSection === 'plan' && (
              <div className="space-y-8">
                <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest border-l-2 border-indigo-600 pl-3 mb-6">Adaptive Timeline</h3>
                <div className="space-y-4 max-w-2xl">
                   {(getStudyPlan(expandedPlan) || []).map((day, i) => (
                     <div key={i} className="relative pl-12 pb-8 last:pb-0">
                        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-[10px] font-bold z-10">D{day.day}</div>
                        <div className="absolute left-4 top-8 w-[1px] h-full bg-gray-100 last:hidden"></div>
                        <div className="space-y-2">
                           <h4 className="text-sm font-black text-indigo-900 tracking-tight">{day.title}</h4>
                           <ul className="space-y-1">
                              {day.tasks.map((t, idx) => <li key={idx} className="text-xs text-gray-400 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-indigo-600/20"/> {t}</li>)}
                           </ul>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {viewSection === 'quiz' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest border-l-2 border-indigo-600 pl-3">Recall Assessment</h3>
                  {quizSubmitted && <div className="text-xl font-black text-indigo-900 italic">SCORE: {Object.keys(quizAnswers).filter(i => quizAnswers[i] === getNotes(expandedPlan).quiz[i]?.answer).length}/{getNotes(expandedPlan).quiz.length}</div>}
                </div>
                
                <div className="space-y-6">
                   {(getNotes(expandedPlan).quiz || []).map((q, qIdx) => (
                     <div key={qIdx} className="space-y-4">
                        <p className="text-sm font-black text-indigo-900"><span className="text-gray-300 mr-2">#{qIdx+1}</span>{q.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {Object.entries(q.options || {}).map(([key, val]) => {
                             const isSelected = quizAnswers[qIdx] === key;
                             const isCorrect = quizSubmitted && key === q.answer;
                             const isWrong = quizSubmitted && isSelected && key !== q.answer;
                             return (
                               <button key={key} onClick={() => !quizSubmitted && setQuizAnswers(p => ({...p, [qIdx]: key}))} className={`text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${isCorrect ? 'bg-indigo-600 text-white border-indigo-600' : isWrong ? 'bg-gray-100 border-indigo-600' : isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}`}>
                                 <span><span className="opacity-30 mr-3">{key}</span> {val}</span>
                                 {isCorrect && <CheckCircle size={14} />}
                                 {isWrong && <XCircle size={14} />}
                               </button>
                             );
                           })}
                        </div>
                     </div>
                   ))}
                </div>
                
                {!quizSubmitted && (
                  <button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < (getNotes(expandedPlan).quiz || []).length} className="uiverse-btn w-full !py-4">SUBMIT FOR FEEDBACK</button>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Library Grid */}
      {!expandedPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.length === 0 && !showGenerate ? (
            <div className="col-span-full py-32 bg-white border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200"><BookOpen size={30} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">No cached nodes found</p>
              <button onClick={() => setShowGenerate(true)} className="text-xs font-bold text-indigo-900 underline underline-offset-4">GENERATE FIRST PLAN</button>
            </div>
          ) : (
            Array.isArray(materials) && materials.map(plan => (
              <Card key={plan.id} className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col group hover:border-indigo-600 transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="text-[9px] font-black tracking-widest text-gray-300 uppercase">{new Date(plan.deadline).toLocaleDateString()}</div>
                </div>
                <h3 className="text-lg font-black text-indigo-900 leading-tight mb-2 uppercase italic">{plan.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-6 font-medium font-sans">{getNotes(plan).summary || "Analysis pending."}</p>
                
                <div className="mt-auto flex gap-2">
                   <button onClick={() => openPlanView(plan)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border border-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">Review</button>
                   <button onClick={() => { openPlanView(plan); setViewSection('quiz'); }} className="px-4 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 transition-all"><Brain size={14} /></button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
