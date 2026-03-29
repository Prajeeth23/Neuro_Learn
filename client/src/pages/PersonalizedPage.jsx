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
      
      {/* Error Alert — Clean B&W */}
      {error && (
        <div className="mb-8 p-4 bg-white border border-black/10 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <div className="text-black"><XCircle size={18} /></div>
             <span className="text-xs font-bold text-black/70 tracking-tight">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-black text-white rounded-lg hover:opacity-80 transition-opacity">Dismiss</button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 px-1">
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase italic leading-[0.9] mb-6">
            Neural <span className="text-gradient-indigo">Tutor</span>
          </h1>
          <p className="text-[11px] font-black tracking-[0.4em] uppercase opacity-60">Personalized Learning Node / AI Engine v.3</p>
        </div>
        <button 
          onClick={() => { setShowGenerate(!showGenerate); setExpandedPlan(null); }} 
          className="btn-primary group !py-4 px-8"
        >
          {showGenerate ? <div className="flex items-center gap-2"><XCircle size={18}/> <span className="text-[11px] font-black uppercase tracking-widest">CLOSE PANEL</span></div> : <div className="flex items-center gap-2"><Sparkles size={18} className="group-hover:rotate-12 transition-transform"/> <span className="text-[11px] font-black uppercase tracking-widest">INITIALIZE NODE</span></div>}
        </button>
      </div>

      {/* Generator Form — Glass Luxe Style */}
      {showGenerate && (
        <Card className="card-luxe !bg-white/90 !p-10 mb-16 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
          <CardHeader className="p-0 mb-10">
            <h2 className="text-3xl font-black tracking-tighter text-black flex items-center gap-4 italic uppercase">
               <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white glow-indigo"><Sparkles size={20} /></div>
               Configure Study Node
            </h2>
          </CardHeader>
          
          <CardContent className="p-0 space-y-10">
            {/* Toggle tabs */}
            <div className="flex p-1.5 glass-luxe !bg-indigo-50/20 border-indigo-100/30 w-fit">
              <button onClick={() => setActiveTab('text')} className={`px-8 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'text' ? 'bg-white shadow-xl text-black' : 'text-gray-400 hover:text-indigo-600'}`}>Raw Text</button>
              <button onClick={() => setActiveTab('upload')} className={`px-8 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'upload' ? 'bg-white shadow-xl text-black' : 'text-gray-400 hover:text-indigo-600'}`}>File Sync</button>
            </div>
 
            <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black text-indigo-900/40 uppercase tracking-[0.2em] mb-3 block">Display Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Quantum Electrodynamics" className="input-glass" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-indigo-900/40 uppercase tracking-[0.2em] mb-3 block">Target Horizon (Days)</label>
                  <input type="number" min="1" max="30" value={deadlineDays} onChange={e => setDeadlineDays(e.target.value)} required className="input-glass" />
                </div>
              </div>
 
              <div className="h-full">
                {activeTab === 'text' ? (
                  <div className="h-full">
                    <label className="text-[11px] font-black text-indigo-900/40 uppercase tracking-[0.2em] mb-3 block">Source Material</label>
                    <textarea value={materialText} onChange={e => setMaterialText(e.target.value)} required={activeTab === 'text'} placeholder="Inject study notes for neural processing..." className="input-glass !h-[calc(100%-2.5rem)] min-h-[160px] resize-none" />
                  </div>
                ) : (
                  <div className="h-full">
                    <label className="text-[11px] font-black text-indigo-900/40 uppercase tracking-[0.2em] mb-3 block">Neural Input Stream (PDF/IMG)</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-[calc(100%-2.5rem)] min-h-[160px] glass-luxe border-indigo-100/30 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-all group rounded-3xl">
                       {file ? (
                         <div className="text-center">
                           <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white glow-indigo mx-auto mb-4 shadow-xl">
                             <FileText size={24} />
                           </div>
                           <p className="text-xs font-black uppercase tracking-tight text-indigo-900">{file.name}</p>
                         </div>
                       ) : (
                         <div className="text-center opacity-30 group-hover:opacity-100 transition-opacity">
                           <Upload size={32} className="mx-auto mb-4 text-indigo-600" />
                           <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-900">Select Neural Source</span>
                         </div>
                       )}
                       <input ref={fileInputRef} type="file" accept=".pdf,.docx,.jpg,.jpeg,.png,.txt" onChange={handleFileChange} className="hidden" />
                    </div>
                  </div>
                )}
              </div>
 
              <div className="lg:col-span-2">
                <button type="submit" disabled={loading} className="btn-primary w-full !py-5 group">
                  {loading ? (
                    <div className="flex items-center justify-center gap-4">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-[12px] font-black tracking-[0.2em] uppercase">Processing Neural Data...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <Zap size={20} className="group-hover:scale-125 transition-transform text-indigo-300" />
                      <span className="text-[12px] font-black tracking-[0.2em] uppercase">Synchronize Study Node</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expanded View — B&W Style */}
      {expandedPlan && (
        <div className="mb-12 animate-in fade-in-up duration-500 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-black text-black tracking-tight">{expandedPlan.title}</h2>
            <button onClick={() => setExpandedPlan(null)} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-black transition-colors">Close ✕</button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setViewSection(tab.key)} className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase whitespace-nowrap transition-all ${viewSection === tab.key ? 'glass-luxe bg-black text-white glow-indigo border-black' : 'glass-luxe bg-white text-indigo-900/40 border-indigo-50/50 hover:bg-indigo-50/50'}`}>
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          <Card className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
            {viewSection === 'summary' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-black uppercase tracking-widest border-l-2 border-black pl-3 mb-6">Cognitive Summary</h3>
                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">{getNotes(expandedPlan).summary || 'Extraction incomplete.'}</p>
              </div>
            )}

            {viewSection === 'topics' && (
              <div className="space-y-6">
                 <h3 className="text-sm font-black text-black uppercase tracking-widest border-l-2 border-black pl-3 mb-6">Neural Nodes</h3>
                 <div className="flex flex-wrap gap-2">
                    {(getNotes(expandedPlan).keyTopics || []).map((topic, i) => (
                      <span key={i} className="px-5 py-2 rounded-lg bg-gray-50 border border-gray-100 text-black text-xs font-black uppercase tracking-tight">{topic}</span>
                    ))}
                 </div>
              </div>
            )}

            {viewSection === 'points' && (
              <div className="space-y-6">
                <h3 className="text-sm font-black text-black uppercase tracking-widest border-l-2 border-black pl-3 mb-6">Key Insights</h3>
                <div className="space-y-3">
                   {(getNotes(expandedPlan).importantPoints || []).map((point, i) => (
                     <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-6 h-6 rounded bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</div>
                        <p className="text-sm text-gray-500 font-medium">{point}</p>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {viewSection === 'plan' && (
              <div className="space-y-8">
                <h3 className="text-sm font-black text-black uppercase tracking-widest border-l-2 border-black pl-3 mb-6">Adaptive Timeline</h3>
                <div className="space-y-4 max-w-2xl">
                   {(getStudyPlan(expandedPlan) || []).map((day, i) => (
                     <div key={i} className="relative pl-12 pb-8 last:pb-0">
                        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center text-[10px] font-bold z-10">D{day.day}</div>
                        <div className="absolute left-4 top-8 w-[1px] h-full bg-gray-100 last:hidden"></div>
                        <div className="space-y-2">
                           <h4 className="text-sm font-black text-black tracking-tight">{day.title}</h4>
                           <ul className="space-y-1">
                              {day.tasks.map((t, idx) => <li key={idx} className="text-xs text-gray-400 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-black/20"/> {t}</li>)}
                           </ul>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {viewSection === 'quiz' && (
              <div className="space-y-12">
                <div className="flex items-center justify-between border-b border-indigo-50/30 pb-10">
                  <div>
                    <h3 className="text-2xl font-black text-black tracking-tighter italic uppercase mb-1">Recall Assessment</h3>
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Knowledge retention checkpoint</p>
                  </div>
                  {quizSubmitted && (
                    <div className="px-8 py-3 glass-luxe bg-black text-white glow-indigo rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mr-4">RETENTION SCORE</span>
                      <span className="text-2xl font-black italic">{Object.keys(quizAnswers).filter(i => quizAnswers[i] === getNotes(expandedPlan).quiz[i]?.answer).length}/{getNotes(expandedPlan).quiz.length}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-10">
                   {(getNotes(expandedPlan).quiz || []).map((q, qIdx) => (
                     <div key={qIdx} className="space-y-6">
                        <div className="flex items-start gap-4">
                          <span className="text-2xl font-black text-indigo-600/20 italic leading-none">{String(qIdx+1).padStart(2, '0')}</span>
                          <p className="text-lg font-black text-black leading-tight tracking-tight">{q.question}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-10">
                           {Object.entries(q.options || {}).map(([key, val]) => {
                             const isSelected = quizAnswers[qIdx] === key;
                             const isCorrect = quizSubmitted && key === q.answer;
                             const isWrong = quizSubmitted && isSelected && key !== q.answer;
                             
                             let btnStyle = "glass-luxe bg-white border-indigo-50/50 text-indigo-900/60 hover:border-indigo-200 hover:bg-indigo-50/30";
                             if (isSelected && !quizSubmitted) btnStyle = "glass-luxe bg-indigo-600 text-white border-indigo-600 glow-indigo";
                             if (isCorrect) btnStyle = "glass-luxe bg-emerald-500 text-white border-emerald-500 glow-teal shadow-[0_0_20px_rgba(16,185,129,0.3)]";
                             if (isWrong) btnStyle = "glass-luxe bg-rose-500 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]";

                             return (
                               <button 
                                 key={key} 
                                 onClick={() => !quizSubmitted && setQuizAnswers(p => ({...p, [qIdx]: key}))} 
                                 className={`text-left p-6 rounded-2xl border text-sm font-bold transition-all flex items-center justify-between group ${btnStyle}`}
                               >
                                 <span className="flex items-center gap-4">
                                   <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${isSelected || isCorrect || isWrong ? 'bg-white/20' : 'bg-indigo-50 text-indigo-400 group-hover:bg-indigo-100'}`}>{key}</span> 
                                   <span className="leading-snug">{val}</span>
                                 </span>
                                 {isCorrect && <CheckCircle size={18} fill="currentColor" className="text-white/40" />}
                                 {isWrong && <XCircle size={18} fill="currentColor" className="text-white/40" />}
                               </button>
                             );
                           })}
                        </div>
                     </div>
                   ))}
                </div>
                
                {!quizSubmitted && (
                  <button 
                    onClick={() => setQuizSubmitted(true)} 
                    disabled={Object.keys(quizAnswers).length < (getNotes(expandedPlan).quiz || []).length} 
                    className="btn-primary w-full !py-5 shadow-2xl disabled:opacity-30"
                  >
                    <div className="flex items-center justify-center gap-4">
                      <Sparkles size={20} />
                      <span className="text-[12px] font-black tracking-[0.2em] uppercase">Evaluate Knowledge Retention</span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Library Grid */}
      {!expandedPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {materials.length === 0 && !showGenerate ? (
            <div className="col-span-full py-40 glass-luxe !bg-white/40 border-indigo-100/30 rounded-[3rem] shadow-sm flex flex-col items-center justify-center space-y-6">
              <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-400 glow-indigo"><BookOpen size={40} /></div>
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-900/40">No cached nodes discovered</p>
              <button onClick={() => setShowGenerate(true)} className="btn-primary !px-10 !py-4 text-[11px]">INITIALIZE FIRST NODE</button>
            </div>
          ) : (
            Array.isArray(materials) && materials.map(plan => (
              <Card key={plan.id} className="card-luxe !p-8 flex flex-col group hover:scale-[1.03] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
                <div className="flex justify-between items-start mb-10">
                   <div className="px-4 py-1.5 glass-luxe !bg-white/50 border-indigo-50/50 rounded-full text-[10px] font-black tracking-widest text-indigo-600/60 uppercase">{new Date(plan.deadline).toLocaleDateString().toUpperCase()}</div>
                </div>
                <h3 className="text-2xl font-black text-black leading-[0.9] mb-4 uppercase italic tracking-tighter group-hover:text-indigo-700 transition-colors">{plan.title}</h3>
                <p className="text-xs text-secondary opacity-40 line-clamp-2 mb-10 font-black uppercase leading-relaxed tracking-tighter">{getNotes(plan).summary || "Analysis pending..."}</p>
                
                <div className="mt-auto flex gap-4">
                   <button onClick={() => openPlanView(plan)} className="flex-1 btn-primary !py-3 !text-[11px] !rounded-2xl">REVIEW NODE</button>
                   <button onClick={() => { openPlanView(plan); setViewSection('quiz'); }} className="w-14 h-14 glass-luxe !bg-white/50 !rounded-2xl flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all glow-indigo"><Brain size={18} /></button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
