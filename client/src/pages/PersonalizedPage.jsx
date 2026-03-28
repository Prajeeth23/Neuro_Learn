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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black uppercase leading-none italic">
            AI <span className="text-gray-300">Tutor</span>
          </h1>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mt-4 ml-1">Personalized Study Node</p>
        </div>
        <button 
          onClick={() => { setShowGenerate(!showGenerate); setExpandedPlan(null); }} 
          className="uiverse-btn !rounded-xl flex items-center gap-2.5 active:scale-95 transition-transform"
        >
          {showGenerate ? <div className="flex items-center gap-2"><XCircle size={15}/> <span>CLOSE PANEL</span></div> : <div className="flex items-center gap-2"><Sparkles size={15}/> <span>INITIALIZE PLAN</span></div>}
        </button>
      </div>

      {/* Generator Form — B&W Style */}
      {showGenerate && (
        <Card className="bg-white border border-gray-200 rounded-3xl p-8 mb-12 shadow-sm animate-in slide-in-from-top-4 duration-500">
          <CardHeader className="p-0 mb-8">
            <h2 className="text-2xl font-black tracking-tight text-black flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white"><Sparkles size={16} /></div>
               CONFIGURE NEW MATERIAL
            </h2>
          </CardHeader>
          
          <CardContent className="p-0 space-y-8">
            {/* Toggle tabs */}
            <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100 max-w-sm">
              <button onClick={() => setActiveTab('text')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'text' ? 'bg-white shadow-sm text-black border border-gray-100' : 'text-gray-400'}`}>Text Data</button>
              <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'upload' ? 'bg-white shadow-sm text-black border border-gray-100' : 'text-gray-400'}`}>File Sync</button>
            </div>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Physics Quantum Logic" className="w-full bg-gray-50 border border-gray-100 h-12 px-4 rounded-xl focus:ring-1 focus:ring-black outline-none font-medium text-sm transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Timeline (Days)</label>
                  <input type="number" min="1" max="30" value={deadlineDays} onChange={e => setDeadlineDays(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 h-12 px-4 rounded-xl focus:ring-1 focus:ring-black outline-none font-medium text-sm transition-all" />
                </div>
              </div>

              <div>
                {activeTab === 'text' ? (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Material Content</label>
                    <textarea value={materialText} onChange={e => setMaterialText(e.target.value)} required={activeTab === 'text'} placeholder="Paste your study notes here..." className="w-full h-32 bg-gray-50 border border-gray-100 p-4 rounded-xl focus:ring-1 focus:ring-black outline-none font-medium text-sm transition-all resize-none" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Sync PDF/DOCX/JPG</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all group">
                       {file ? (
                         <div className="text-center font-bold text-xs"><FileText size={20} className="mx-auto mb-1 text-black"/> {file.name}</div>
                       ) : (
                         <div className="text-center text-gray-300 group-hover:text-gray-500 transition-colors"><Upload size={20} className="mx-auto mb-1"/> <span className="text-[10px] font-black uppercase tracking-widest">Select Source</span></div>
                       )}
                       <input ref={fileInputRef} type="file" accept=".pdf,.docx,.jpg,.jpeg,.png,.txt" onChange={handleFileChange} className="hidden" />
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <button type="submit" disabled={loading} className="uiverse-btn w-full !py-4 transition-all">
                  {loading ? <div className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> <span className="text-[10px] font-black tracking-widest uppercase">Analyzing...</span></div> : <span className="text-[10px] font-black tracking-widest uppercase">SYNC & ANALYZE NOW</span>}
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

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setViewSection(tab.key)} className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase whitespace-nowrap border transition-all ${viewSection === tab.key ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}>
                  <Icon size={12} /> {tab.label}
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
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest border-l-2 border-black pl-3">Recall Assessment</h3>
                  {quizSubmitted && <div className="text-xl font-black text-black italic">SCORE: {Object.keys(quizAnswers).filter(i => quizAnswers[i] === getNotes(expandedPlan).quiz[i]?.answer).length}/{getNotes(expandedPlan).quiz.length}</div>}
                </div>
                
                <div className="space-y-6">
                   {(getNotes(expandedPlan).quiz || []).map((q, qIdx) => (
                     <div key={qIdx} className="space-y-4">
                        <p className="text-sm font-black text-black"><span className="text-gray-300 mr-2">#{qIdx+1}</span>{q.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {Object.entries(q.options || {}).map(([key, val]) => {
                             const isSelected = quizAnswers[qIdx] === key;
                             const isCorrect = quizSubmitted && key === q.answer;
                             const isWrong = quizSubmitted && isSelected && key !== q.answer;
                             return (
                               <button key={key} onClick={() => !quizSubmitted && setQuizAnswers(p => ({...p, [qIdx]: key}))} className={`text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${isCorrect ? 'bg-black text-white border-black' : isWrong ? 'bg-gray-100 border-black' : isSelected ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}`}>
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
              <button onClick={() => setShowGenerate(true)} className="text-xs font-bold text-black underline underline-offset-4">GENERATE FIRST PLAN</button>
            </div>
          ) : (
            Array.isArray(materials) && materials.map(plan => (
              <Card key={plan.id} className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col group hover:border-black transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="text-[9px] font-black tracking-widest text-gray-300 uppercase">{new Date(plan.deadline).toLocaleDateString()}</div>
                </div>
                <h3 className="text-lg font-black text-black leading-tight mb-2 uppercase italic">{plan.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-6 font-medium font-sans">{getNotes(plan).summary || "Analysis pending."}</p>
                
                <div className="mt-auto flex gap-2">
                   <button onClick={() => openPlanView(plan)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border border-black rounded-xl hover:bg-black hover:text-white transition-all">Review</button>
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
