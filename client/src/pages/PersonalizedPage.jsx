import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api from '../lib/api';
import { Sparkles, Calendar, FileText, Upload, BookOpen, Target, ListChecks, Brain, CheckCircle, XCircle, ChevronDown, ChevronUp, ArrowRight, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PersonalizedPage() {
  const [materials, setMaterials] = useState([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'upload'
  
  // Form state
  const [title, setTitle] = useState('');
  const [materialText, setMaterialText] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('7');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Expanded plan view
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [viewSection, setViewSection] = useState('summary'); // 'summary' | 'topics' | 'points' | 'plan' | 'quiz'
  
  // Quiz state for expanded view
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [showGenerate]);

  const loadMaterials = async () => {
    try {
      setError(null);
      const { data } = await api.get('/personalized');
      setMaterials(data || []);
    } catch (err) {
      console.error('Failed to load personalized materials', err);
      const errorData = err.response?.data?.error || err.message || 'Failed to load materials';
      setError(typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : errorData);
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
      console.error('Failed generation', err);
      setError('Neural synthesis failed. Please try again with simpler content.');
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
    if (typeof plan.notes === 'string') {
      try { return JSON.parse(plan.notes); } catch { return {}; }
    }
    return plan.notes;
  };

  const getStudyPlan = (plan) => {
    if (!plan.study_plan) return [];
    if (typeof plan.study_plan === 'string') {
      try { return JSON.parse(plan.study_plan); } catch { return []; }
    }
    return plan.study_plan;
  };

  const tabs = [
    { key: 'summary', label: 'Summary', icon: BookOpen },
    { key: 'topics', label: 'Key Topics', icon: Target },
    { key: 'points', label: 'Important Points', icon: ListChecks },
    { key: 'plan', label: 'Study Plan', icon: Calendar },
    { key: 'quiz', label: 'Quiz', icon: Brain },
  ];

  return (
    <div className="animate-fade-in w-full mb-20">
      
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-secondary/10 rounded-full mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Neural Planner Alpha</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">
            AI Study <span className="text-secondary italic">Pathways</span>
          </h1>
          <p className="text-slate-500 font-medium">Generate custom learning materials from any source</p>
        </div>
        <button 
          onClick={() => { setShowGenerate(!showGenerate); setExpandedPlan(null); }} 
          className={`btn-secondary !rounded-2xl group ${showGenerate ? '!bg-white !text-slate-500 border-slate-200 shadow-none' : ''}`}
        >
          <Sparkles size={18} className={`mr-2 group-hover:scale-110 transition-transform ${!showGenerate && 'text-secondary animate-pulse'}`} />
          {showGenerate ? 'Discard Evolution' : 'Initialize New Plan'}
        </button>
      </div>

      <AnimatePresence>
        {showGenerate && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 48 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <Card className="surface-elevated p-8 md:p-10 !rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50 border-secondary/20">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-xl">
                    <Brain size={24} className="text-secondary" />
                  </div>
                  Design Your Learning Blueprint
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Method Toggles */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-none">
                  <button 
                    onClick={() => setActiveTab('text')}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${
                      activeTab === 'text' 
                        ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-secondary/30 hover:text-secondary shadow-sm'
                    }`}
                  >
                    <FileText size={18} /> Paste Curriculum
                  </button>
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${
                      activeTab === 'upload' 
                        ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-secondary/30 hover:text-secondary shadow-sm'
                    }`}
                  >
                    <Upload size={18} /> Upload Telemetry
                  </button>
                </div>

                <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Archive Title</label>
                      <input 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        required 
                        placeholder="e.g. Modern Architecture Fundamentals" 
                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder:text-slate-300 focus:border-secondary focus:ring-4 focus:ring-secondary/5 focus:outline-none transition-all shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assimilation Period (Days)</label>
                      <input 
                        type="number"
                        min="1"
                        max="365"
                        value={deadlineDays} 
                        onChange={e => setDeadlineDays(e.target.value)} 
                        required 
                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:border-secondary focus:ring-4 focus:ring-secondary/5 focus:outline-none transition-all shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {activeTab === 'text' ? (
                      <>  
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Input Stream (Notes, Syllabus, Raw Text)</label>
                        <textarea 
                          className="w-full h-44 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-900 focus:ring-4 focus:ring-secondary/5 focus:border-secondary focus:outline-none transition-all placeholder:text-slate-300 resize-none font-medium shadow-sm"
                          value={materialText} 
                          onChange={e => setMaterialText(e.target.value)} 
                          required={activeTab === 'text'}
                          placeholder="Paste your intellectual assets here..."
                        />
                      </>
                    ) : (
                      <>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Digital Asset Upload (PDF, JPG, PNG)</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-44 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-secondary/40 hover:bg-secondary/5 transition-all group"
                        >
                          {file ? (
                            <div className="text-center space-y-2">
                              <FileText size={40} className="text-secondary mx-auto" />
                              <p className="text-sm font-bold text-slate-700">{file.name}</p>
                              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          ) : (
                            <div className="text-center space-y-3">
                              <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                <Upload size={24} className="text-secondary" />
                              </div>
                              <p className="text-sm text-slate-500 font-bold">Deploy File for Synthesis</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">PDF, DOCX, Images (Max 10MB)</p>
                            </div>
                          )}
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button type="submit" disabled={loading} className="btn-secondary w-full !py-5 shadow-xl shadow-secondary/10 group">
                      {loading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span className="font-bold tracking-widest uppercase text-sm">Processing Neural Stream...</span>
                        </div>
                      ) : (
                        <span className="font-bold tracking-widest uppercase text-sm flex items-center">
                          Generate Evolution Blueprint <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Plan View */}
      <AnimatePresence mode="wait">
      {expandedPlan && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-2xl">
                 <Book size={24} className="text-secondary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{expandedPlan.title}</h2>
            </div>
            <button onClick={() => setExpandedPlan(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-6 py-2 rounded-full uppercase tracking-widest transition-colors">Discard View</button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.key}
                  onClick={() => setViewSection(tab.key)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                    viewSection === tab.key 
                      ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-secondary/30 hover:text-secondary'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Section Content */}
          <Card className="surface-elevated !rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/30">
            <CardContent className="p-10">
              {viewSection === 'summary' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-1 h-6 bg-secondary rounded-full"></div> Synthesis Summary
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap italic">"{getNotes(expandedPlan).summary || 'Neural synthesis pending.'}"</p>
                </div>
              )}

              {viewSection === 'topics' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-1 h-6 bg-secondary rounded-full"></div> Intellectual Core
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(getNotes(expandedPlan).keyTopics || []).map((topic, i) => (
                      <div key={i} className="px-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-700 text-sm font-bold shadow-sm shadow-slate-100 flex items-center gap-3 group hover:border-secondary/30 transition-all">
                        <div className="w-2 h-2 rounded-full bg-secondary/30 group-hover:bg-secondary transition-colors"></div>
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewSection === 'points' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-1 h-6 bg-secondary rounded-full"></div> Strategic Insights
                  </h3>
                  <ul className="space-y-4">
                    {(getNotes(expandedPlan).importantPoints || []).map((point, i) => (
                      <li key={i} className="flex items-start gap-5 text-slate-600 group bg-white/50 p-6 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                        <span className="w-8 h-8 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-sm font-medium leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {viewSection === 'plan' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-1 h-6 bg-secondary rounded-full"></div> Assimilation Timeline
                  </h3>
                  <div className="space-y-6">
                    {(getStudyPlan(expandedPlan) || []).map((day, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 space-y-5 shadow-sm hover:border-secondary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-secondary text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-secondary/10">D{day.day}</div>
                          <span className="font-bold text-slate-900 text-lg">{day.title}</span>
                        </div>
                        <div className="pl-16 space-y-3">
                          {(day.tasks || []).map((task, j) => (
                            <li key={j} className="text-slate-500 text-sm flex items-center gap-3 list-none">
                              <CheckCircle size={14} className="text-secondary/30" />
                              <span className="font-medium">{task}</span>
                            </li>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewSection === 'quiz' && (
                <div className="space-y-8 animate-fade-in">
                   <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                      <Brain size={24} className="text-secondary" /> Diagnostic Protocol
                    </h3>
                    {quizSubmitted && (
                      <div className={`px-6 py-2 rounded-full border-2 ${
                        Object.keys(quizAnswers).filter(i => quizAnswers[i] === getNotes(expandedPlan).quiz[i]?.answer).length >= (getNotes(expandedPlan).quiz?.length * 0.7)
                          ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                      }`}>
                        <p className="text-sm font-black">
                          {Object.keys(quizAnswers).filter(i => quizAnswers[i] === getNotes(expandedPlan).quiz[i]?.answer).length} / {getNotes(expandedPlan).quiz?.length} Synthesis Rating
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {(getNotes(expandedPlan).quiz || []).map((q, qIdx) => (
                      <div key={qIdx} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 transition-all">
                        <p className="font-bold text-slate-900 text-lg flex items-start gap-4">
                          <span className="text-secondary opacity-30 mt-1 uppercase text-xs font-black tracking-widest">Q{qIdx + 1}</span>
                          <span>{q.question}</span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(q.options || {}).map(([key, value]) => {
                            const isSelected = quizAnswers[qIdx] === key;
                            const isCorrect = quizSubmitted && key === q.answer;
                            const isWrong = quizSubmitted && isSelected && key !== q.answer;
                            return (
                              <button 
                                key={key}
                                onClick={() => { if (!quizSubmitted) setQuizAnswers(p => ({...p, [qIdx]: key})); }}
                                disabled={quizSubmitted}
                                className={`text-left p-5 rounded-2xl border-2 text-sm flex items-center gap-4 transition-all ${
                                  isCorrect ? 'bg-green-50 border-green-500 text-green-800 shadow-md' :
                                  isWrong ? 'bg-red-50 border-red-500 text-red-800' :
                                  isSelected ? 'bg-secondary border-secondary text-white shadow-xl shadow-secondary/10' :
                                  'bg-slate-50 border-slate-50 hover:border-slate-200 text-slate-600'
                                }`}
                              >
                                <span className={`font-black text-[10px] w-8 h-8 flex items-center justify-center rounded-xl border-2 transition-colors ${
                                  isSelected ? 'bg-white/20 border-white/40' : 'bg-white border-slate-100'
                                }`}>{key}</span>
                                <span className="flex-1 font-bold">{value}</span>
                                {isCorrect && <CheckCircle size={20} className="text-green-500 shrink-0" />}
                                {isWrong && <XCircle size={20} className="text-red-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted && getNotes(expandedPlan).quiz?.length > 0 && (
                    <button 
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length < (getNotes(expandedPlan).quiz || []).length}
                      className="btn-secondary w-full !py-6 shadow-2xl shadow-secondary/10 disabled:opacity-40"
                    >
                      Process Final Evaluation ({Object.keys(quizAnswers).length}/{(getNotes(expandedPlan).quiz || []).length})
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Plans Grid */}
      {!expandedPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {materials.length === 0 && !showGenerate ? (
            <div className="col-span-full py-40 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4 shadow-sm">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] text-slate-200 mb-4">
                <FileText size={64} className="stroke-[1]" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-slate-900 font-bold text-xl">The Intelligence Repository is Empty</p>
                <p className="text-slate-400 font-medium">Draft your first AI Evolution Blueprint to commence</p>
                <button 
                  onClick={() => setShowGenerate(true)}
                  className="btn-secondary mt-8"
                >Initialize System</button>
              </div>
            </div>
          ) : (
            Array.isArray(materials) && materials.map(plan => (
              <Card key={plan.id} className="surface-elevated flex flex-col group h-full hover:border-secondary/30 transition-all duration-500 bg-white shadow-sm hover:shadow-2xl hover:shadow-slate-200/50">
                <CardHeader className="space-y-4 p-8">
                  <div className="flex justify-between items-center">
                    <div className="text-[9px] font-black tracking-widest text-slate-400 flex items-center gap-2 uppercase bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <Calendar size={12} className="text-secondary" /> {new Date(plan.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-tight h-14">
                    {plan.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-8 pb-10">
                  <p className="text-sm line-clamp-3 text-slate-500 font-medium leading-relaxed mb-10 h-15">
                    {getNotes(plan).summary || "Intellectual assets parsed. Full synthesis available for detailed review."}
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => openPlanView(plan)}
                      className="btn-secondary !rounded-2xl flex-1 !py-3 !text-[10px] font-black tracking-widest uppercase !bg-white hover:!bg-slate-50 !shadow-none border-slate-200"
                    >
                      View Archive
                    </button>
                    <button 
                      onClick={() => { openPlanView(plan); setViewSection('quiz'); }}
                      className="btn-secondary !rounded-2xl flex-1 !py-3 !text-[10px] font-black tracking-widest uppercase"
                    >
                      Enter Evaluation
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
