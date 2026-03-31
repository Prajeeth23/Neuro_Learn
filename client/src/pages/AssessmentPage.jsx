import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Loader2, ArrowRight, ShieldCheck, Target, Maximize, ShieldAlert, XCircle } from 'lucide-react';
import api from '../lib/api';
import { useSecureMode } from '../hooks/useSecureMode';


export default function AssessmentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseContext, setCourseContext] = useState('');

  const { isFullscreen, showWarning, enterFullscreen, exitFullscreen } = useSecureMode(started && !submitted);


  useEffect(() => {
    async function fetchCourse() {
      try {
        if (courseId === 'mock-dsa-123') {
          setCourseName('Data Structures and Algorithms');
          setCourseContext('Data Structures and Algorithms. Master DSA with this comprehensive YouTube playlist series.');
          return;
        }
        const { data } = await api.get(`/courses/${courseId}`);
        setCourseName(data?.title || 'this course');
        setCourseContext(`${data?.title || ''}. ${data?.description || ''}`);
      } catch (e) {
        setCourseName('this course');
      }
    }
    fetchCourse();
  }, [courseId]);

  const handleStart = async () => {
    // TRIGGER FULLSCREEN ON USER GESTURE (MANDATORY)
    enterFullscreen();
    
    setStarted(true);
    setLoading(true);
    try {
      const topic = courseContext || courseName || 'General Knowledge';
      const { data } = await api.post('/ai/assessment-questions', { topic });
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Failed to generate assessment', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (key) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: key }));
  };

  const handleNext = () => { if (currentQIndex < questions.length - 1) setCurrentQIndex(currentQIndex + 1); };
  const handlePrev = () => { if (currentQIndex > 0) setCurrentQIndex(currentQIndex - 1); };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, idx) => { if (selectedAnswers[idx] === q.answer) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    setSubmitted(true);

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    try {
      const { data } = await api.post(`/assessments/initial/${courseId}/submit`, { score });

      setResult({
        score,
        correct,
        total: questions.length,
        level: data.progress?.level || (score >= 80 ? 5 : score >= 50 ? 4 : 3),
        message: data.message
      });
    } catch (err) {
      console.error('Failed to submit assessment', err);
      const level = score >= 80 ? 5 : score >= 50 ? 4 : 3;
      setResult({ score, correct, total: questions.length, level, message: `Assessment complete. Level: ${level}` });
    }
  };

  if (!started) {
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] animate-fade-in-up">
        <Card className="max-w-xl bg-white border border-gray-100 rounded-[3rem] p-10 shadow-card-lg text-center">
          <div className="w-20 h-20 mx-auto mb-10 rounded-[1.5rem] bg-black flex items-center justify-center text-white shadow-xl shadow-black/10">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tighter text-black uppercase italic">
            Diagnostic <span className="text-gray-300">Phase</span>
          </h1>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mb-8">{courseName}</p>
          <p className="text-gray-500 mb-12 text-sm font-medium px-4 leading-relaxed">
            Initialize the calibration protocol. This 10-node assessment synchronizes the Adaptive engine with your current skill vector.
          </p>

          <div className="grid grid-cols-1 gap-3 text-left mb-12">
            {[
              { level: '3', label: 'BEGINNER', range: '< 50%', desc: 'Linear explanations + Visual anchors' },
              { level: '4', label: 'INTERMEDIATE', range: '50-79%', desc: 'Modular depth + Structural logic' },
              { level: '5', label: 'ADVANCED', range: '≥ 80%', desc: 'Complex derivations + High-density maps' }
            ].map((node, i) => (
              <div key={i} className="flex items-center gap-5 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black shadow-sm">{node.level}★</div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-black mb-1">{node.label} <span className="text-gray-300 ml-2">{node.range}</span></p>
                   <p className="text-[11px] text-gray-400 font-bold">{node.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="black" className="w-full !py-6 !rounded-2xl shadow-xl shadow-black/5 active:scale-[0.98]" onClick={handleStart}>
            INITIALIZE CALIBRATION
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center space-y-8 grayscale opacity-40 bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-black" size={48} />
        <div className="text-center space-y-3">
          <p className="text-2xl font-black tracking-tighter text-black uppercase italic">Generating Node Map</p>
          <p className="text-[10px] font-black tracking-[0.3em] text-gray-300 uppercase">Indexing 10 high-fidelity diagnostic probes for {courseName}</p>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] animate-fade-in-up">
        <Card className="w-full max-w-xl bg-white border border-gray-100 rounded-[3rem] p-12 shadow-card-lg text-center">
          <div className="w-24 h-24 mx-auto mb-10 rounded-[2rem] bg-black flex items-center justify-center text-white border-4 border-gray-50 shadow-xl shadow-black/10">
            <span className="text-4xl font-black italic">{result.level}★</span>
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase italic text-black">Sync Complete</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-8">{result.score}% ACCURACY — {result.correct}/{result.total} NODES VERIFIED</p>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10 text-left">
             <div className="flex items-center gap-3 mb-3">
                <Target size={16} className="text-black" />
                <p className="text-[10px] font-black uppercase tracking-widest">Protocol Assignment: {result.level === 5 ? 'Advanced' : result.level === 4 ? 'Intermediate' : 'Beginner'}</p>
             </div>
             <p className="text-xs text-gray-400 font-bold leading-relaxed">
               {result.level === 5 ? 'Engaging high-density vectors. System will deliver complex derivation maps and specialized insights.' :
                result.level === 4 ? 'Engaging structural depth. System will provide modular explanations with moderate complexity.' :
                'Engaging basic anchors. System will deliver linear explanations with emphasis on foundational synchronization.'}
             </p>
          </div>

          <Button onClick={() => navigate(`/dashboard/courses/${courseId}`)} variant="black" className="w-full !rounded-2xl !py-5 shadow-lg active:scale-95 group">
             BEGIN LEARNING PROTOCOL <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} />
          </Button>
        </Card>
      </div>
    );
  }

  // Fullscreen warning / re-entry prompt (shown when ESC is pressed mid-assessment)
  if (started && !submitted && (showWarning || !isFullscreen)) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col items-center justify-center space-y-8 animate-fade-in-up">
        <div className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-black/10 animate-pulse">
          <ShieldAlert size={32} />
        </div>
        <div className="text-center space-y-4 max-w-md px-6">
          <p className="text-2xl font-black tracking-tighter text-black uppercase italic">Secure Mode Active</p>
          <p className="text-sm font-medium text-gray-500 leading-relaxed">
            Exiting full-screen is not allowed during an assessment. Returning you to secure mode automatically...
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button 
            onClick={() => { 
                exitFullscreen(); 
                navigate(courseId ? `/dashboard/courses/${courseId}` : '/dashboard/courses'); 
            }} 
            variant="outline" 
            className="px-8 !py-4 !rounded-xl text-xs font-black tracking-widest uppercase border-red-500 text-red-500 hover:bg-red-50"
          >
            <XCircle size={16} className="mr-3 inline-block" />
            EXIT ASSESSMENT
          </Button>
          <Button onClick={enterFullscreen} variant="black" className="px-8 !py-4 !rounded-xl text-xs font-black tracking-widest uppercase">
            <Maximize size={16} className="mr-3 inline-block" />
            RESUME FULLSCREEN
          </Button>
        </div>
      </div>
    );
  }

  if (!questions.length) return null;
  const q = questions[currentQIndex];

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] animate-fade-in-up">
      <Card className="w-full max-w-2xl bg-white border border-gray-100 rounded-[3rem] p-10 shadow-card-lg">
        <CardHeader className="p-0 border-b border-gray-50 pb-10 mb-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white"><BrainCircuit size={16} /></div>
               <div className="text-[10px] text-gray-300 font-black tracking-[0.2em] uppercase tracking-[0.3em]">PROBE NODES</div>
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg bg-black text-white">{q.difficulty || 'CALIBRATING'}</span>
          </div>
          <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-black transition-all duration-700 ease-in-out" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
          <div className="flex justify-between items-end gap-10">
             <div className="text-[10px] font-black text-gray-200 uppercase tracking-[0.3em] mb-4">P-{(currentQIndex + 1).toString().padStart(2, '0')}</div>
             <CardTitle className="text-xl md:text-2xl font-black text-black leading-tight tracking-tight uppercase italic">{q.question}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col gap-4">
          {Object.entries(q.options).map(([key, value]) => (
            <button key={key} onClick={() => handleSelect(key)}
              className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-6 group ${
                selectedAnswers[currentQIndex] === key 
                  ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                  : 'bg-white border-gray-100 hover:border-black text-gray-500'
              }`}>
              <span className={`font-black text-[10px] w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${selectedAnswers[currentQIndex] === key ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-100 text-gray-300 group-hover:text-black group-hover:border-black'}`}>{key}</span>
              <span className={`text-[13px] font-bold ${selectedAnswers[currentQIndex] === key ? 'text-white' : 'group-hover:text-black'}`}>{value}</span>
            </button>
          ))}
        </CardContent>

        <CardFooter className="p-0 pt-10 mt-10 border-t border-gray-50 flex gap-4">
          <Button variant="outline" className="!flex-1 !rounded-xl !border-gray-100 !text-gray-300" onClick={handlePrev} disabled={currentQIndex === 0}>
             PREVIOUS
          </Button>
          {currentQIndex === questions.length - 1 ? (
            <Button variant="black" className="!flex-[2] !rounded-xl !py-4" onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length < questions.length}>
               SUBMIT FOR SYNC ({Object.keys(selectedAnswers).length}/{questions.length})
            </Button>
          ) : (
            <Button variant="black" className="!flex-[2] !rounded-xl !py-4" onClick={handleNext} disabled={selectedAnswers[currentQIndex] === undefined}>
               NEXT PROBE <ArrowRight size={14} className="ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
