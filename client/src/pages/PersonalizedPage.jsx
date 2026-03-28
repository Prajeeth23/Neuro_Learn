import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api from '../lib/api';
import { Sparkles, Calendar, FileText, Upload, BookOpen, Target, ListChecks, Brain, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-20">
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Study <span className="text-secondary underline decoration-accent/30 underline-offset-8">Planner</span>
          </h1>
          <p className="text-white/40 font-medium tracking-widest uppercase text-[10px]">AI-Generated Personalized Materials</p>
        </div>
        <button 
          onClick={() => { setShowGenerate(!showGenerate); setExpandedPlan(null); }} 
          className="uiverse-btn !text-xs !px-6 !py-3 font-black tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          <Sparkles size={16} className="text-accent animate-pulse" />
          {showGenerate ? 'CLOSE GENERATOR' : 'NEW AI STUDY PLAN'}
        </button>
      </div>

      {/* Generator Form */}
      {showGenerate && (
        <Card className="glass-card-premium neon-border-primary mb-12 border-primary/20 p-8 relative overflow-visible">
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/20 blur-xl rounded-full"></div>
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-3xl font-black tracking-tight text-gradient-primary">Design Your Learning Path</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Tab Toggle: Text / Upload */}
            <div className="flex gap-2 mb-8">
              <button 
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'text' ? 'bg-primary/20 border border-primary/40 text-primary' : 'bg-white/[0.03] border border-white/10 text-white/40 hover:text-white/60'}`}
              >
                <FileText size={14} className="inline mr-2" /> Paste Text
              </button>
              <button 
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'upload' ? 'bg-accent/20 border border-accent/40 text-accent' : 'bg-white/[0.03] border border-white/10 text-white/40 hover:text-white/60'}`}
              >
                <Upload size={14} className="inline mr-2" /> Upload File
              </button>
            </div>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Subject / Title</label>
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    placeholder="e.g. Modern Architecture" 
                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-primary/50 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Deadline (Days)</label>
                  <Input 
                    type="number"
                    min="1"
                    max="365"
                    value={deadlineDays} 
                    onChange={e => setDeadlineDays(e.target.value)} 
                    required 
                    placeholder="7"
                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-primary/50 text-base w-full" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                {activeTab === 'text' ? (
                  <>  
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Study Material (Paste text, syllabus, or topics)</label>
                    <textarea 
                      className="w-full h-44 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-base text-white focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all placeholder:text-white/20 resize-none font-medium"
                      value={materialText} 
                      onChange={e => setMaterialText(e.target.value)} 
                      required={activeTab === 'text'}
                      placeholder="Paste your notes or book contents here..."
                    />
                  </>
                ) : (
                  <>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Upload File (PDF, DOCX, JPG)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="w-full h-44 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all"
                    >
                      {file ? (
                        <div className="text-center space-y-2">
                          <FileText size={32} className="text-accent mx-auto" />
                          <p className="text-sm font-bold text-white/70">{file.name}</p>
                          <p className="text-xs text-white/30">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <Upload size={32} className="text-white/20 mx-auto" />
                          <p className="text-sm text-white/40">Drop file here or click to browse</p>
                          <p className="text-[10px] text-white/20">PDF, DOCX, JPG, PNG (Max 10MB)</p>
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

              <div className="md:col-span-2">
                <button type="submit" disabled={loading} className="uiverse-btn w-full !py-5 shadow-2xl shadow-primary/30">
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="font-black tracking-widest text-sm uppercase italic">Analyzing with Groq AI...</span>
                    </div>
                  ) : <span className="font-black tracking-widest text-sm uppercase">Generate Full AI Analysis</span>}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expanded Plan View */}
      {expandedPlan && (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black tracking-tight text-white">{expandedPlan.title}</h2>
            <button onClick={() => setExpandedPlan(null)} className="text-xs text-white/40 hover:text-white/70 font-bold uppercase tracking-widest">Close ✕</button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.key}
                  onClick={() => setViewSection(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-all ${
                    viewSection === tab.key 
                      ? 'bg-primary/20 border border-primary/40 text-primary shadow-lg shadow-primary/10' 
                      : 'bg-white/[0.03] border border-white/10 text-white/40 hover:text-white/60'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Section Content */}
          <Card className="glass-card-premium border-white/5 p-8">
            {viewSection === 'summary' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gradient-primary flex items-center gap-2"><BookOpen size={20} /> Summary</h3>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{getNotes(expandedPlan).summary || 'No summary available.'}</p>
              </div>
            )}

            {viewSection === 'topics' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gradient-primary flex items-center gap-2"><Target size={20} /> Key Topics</h3>
                <div className="flex flex-wrap gap-3">
                  {(getNotes(expandedPlan).keyTopics || []).map((topic, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold">{topic}</span>
                  ))}
                </div>
              </div>
            )}

            {viewSection === 'points' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gradient-primary flex items-center gap-2"><ListChecks size={20} /> Important Points</h3>
                <ul className="space-y-3">
                  {(getNotes(expandedPlan).importantPoints || []).map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70 text-sm">
                      <span className="w-6 h-6 rounded-lg bg-accent/10 border border-accent/20 text-accent text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {viewSection === 'plan' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gradient-primary flex items-center gap-2"><Calendar size={20} /> Study Plan</h3>
                <div className="space-y-4">
                  {(getStudyPlan(expandedPlan) || []).map((day, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black flex items-center justify-center">D{day.day}</span>
                        <span className="font-bold text-white/80">{day.title}</span>
                      </div>
                      <ul className="ml-14 space-y-1">
                        {(day.tasks || []).map((task, j) => (
                          <li key={j} className="text-white/50 text-sm flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-accent/50"></span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewSection === 'quiz' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-gradient-primary flex items-center gap-2"><Brain size={20} /> Quiz ({(getNotes(expandedPlan).quiz || []).length} Questions)</h3>
                
                {quizSubmitted && (
                  <div className={`text-center p-4 rounded-xl border ${
                    Object.keys(quizAnswers).filter(i => quizAnswers[i] === getNotes(expandedPlan).quiz[i]?.answer).length >= 7
                      ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <p className="text-2xl font-black">
                      {Object.keys(quizAnswers).filter(i => quizAnswers[i] === getNotes(expandedPlan).quiz[i]?.answer).length} / {getNotes(expandedPlan).quiz.length} Correct
                    </p>
                  </div>
                )}

                {(getNotes(expandedPlan).quiz || []).map((q, qIdx) => (
                  <div key={qIdx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                    <p className="font-bold text-white/90 text-sm"><span className="text-primary mr-2">Q{qIdx + 1}.</span>{q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(q.options || {}).map(([key, value]) => {
                        const isSelected = quizAnswers[qIdx] === key;
                        const isCorrect = quizSubmitted && key === q.answer;
                        const isWrong = quizSubmitted && isSelected && key !== q.answer;
                        return (
                          <button 
                            key={key}
                            onClick={() => { if (!quizSubmitted) setQuizAnswers(p => ({...p, [qIdx]: key})); }}
                            disabled={quizSubmitted}
                            className={`text-left p-2.5 rounded-xl border text-sm flex items-center gap-2 transition-all ${
                              isCorrect ? 'bg-green-500/20 border-green-500/40 text-green-300' :
                              isWrong ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                              isSelected ? 'bg-primary/20 border-primary/40 text-white' :
                              'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-white/60'
                            }`}
                          >
                            <span className="font-black text-[10px] w-5 h-5 flex items-center justify-center rounded bg-white/5 border border-white/10 shrink-0">{key}</span>
                            <span className="flex-1 text-xs">{value}</span>
                            {isCorrect && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                            {isWrong && <XCircle size={14} className="text-red-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizSubmitted && getNotes(expandedPlan).quiz?.length > 0 && (
                  <button 
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length < (getNotes(expandedPlan).quiz || []).length}
                    className="uiverse-btn w-full !py-4 disabled:opacity-40"
                  >
                    Submit Quiz ({Object.keys(quizAnswers).length}/{(getNotes(expandedPlan).quiz || []).length})
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Plans Grid */}
      {!expandedPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {materials.length === 0 && !showGenerate ? (
            <Card className="col-span-full py-20 bg-white/[0.02] border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-4">
              <div className="p-6 bg-white/[0.03] rounded-full text-white/10">
                <FileText size={64} className="stroke-[1.5]" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-white/60 font-bold text-lg">Your Library is Empty</p>
                <p className="text-white/20 text-sm font-medium">Create your first AI Study Plan to begin</p>
              </div>
            </Card>
          ) : (
            Array.isArray(materials) && materials.map(plan => (
              <Card key={plan.id} className="glass-card-premium neon-border-primary border-white/5 flex flex-col group h-full">
                <CardHeader className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] font-black tracking-widest text-accent flex items-center gap-1.5 uppercase bg-accent/10 px-2 py-1 rounded">
                      <Calendar size={12} /> {new Date(plan.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{plan.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm line-clamp-3 text-white/40 font-medium leading-relaxed mb-6">{getNotes(plan).summary || plan.material_text}</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => openPlanView(plan)}
                      className="uiverse-btn-outline flex-1 !py-3 !text-[10px] font-black tracking-widest uppercase"
                    >
                      View Notes
                    </button>
                    <button 
                      onClick={() => { openPlanView(plan); setViewSection('quiz'); }}
                      className="uiverse-btn-outline flex-1 !py-3 !text-[10px] font-black tracking-widest uppercase !border-accent/40 !text-accent hover:!bg-accent hover:!text-white"
                    >
                      Take Quiz
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
