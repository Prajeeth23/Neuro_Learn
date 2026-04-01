import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, XCircle, BrainCircuit, Sparkles, ChevronRight, ChevronLeft, Shield, Target } from 'lucide-react';
import api from '../lib/api';

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

  // Fetch course name for context
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

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    setSubmitted(true);

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

  // Start splash
  if (!started) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in">
        <Card className="max-w-md w-full text-center p-10 surface-elevated !rounded-[2.5rem] shadow-xl shadow-slate-200/50">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-primary/5 flex items-center justify-center">
            <BrainCircuit size={42} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">
            Diagnostic <span className="text-primary">Calibration</span>
          </h1>
          <p className="text-slate-500 font-medium mb-2 text-sm">{courseName}</p>
          <p className="text-slate-400 mb-10 text-sm leading-relaxed">
            This 10-question analytical diagnostic will synchronize the AI tutor with your current cognitive baseline.
          </p>
          
          <div className="space-y-3 text-left mb-10">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-black text-sm">3★</span>
              <div className="space-y-0.5">
                 <p className="text-xs font-bold text-slate-800">Beginner Node</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score &lt; 50%</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-sm">4★</span>
              <div className="space-y-0.5">
                 <p className="text-xs font-bold text-slate-800">Intermediate Node</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score 50-79%</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-sm">5★</span>
              <div className="space-y-0.5">
                 <p className="text-xs font-bold text-slate-800">Advanced Node</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score ≥ 80%</p>
              </div>
            </div>
          </div>
          
          <Button className="w-full btn-primary !py-7 !rounded-2xl shadow-lg shadow-primary/20 group" onClick={handleStart}>
            Initialize Assessment
            <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-8">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Synthesizing Diagnostic Questions</h2>
            <p className="text-sm text-slate-400 font-medium italic">Constructing calibrated challenges for {courseName}...</p>
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (submitted && result) {
    const levelNames = { 3: 'Beginner', 4: 'Intermediate', 5: 'Advanced' };

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 animate-fade-in">
        <Card className="w-full max-w-xl text-center p-12 surface-elevated !rounded-[3rem] shadow-2xl shadow-slate-200/50">
          <div className="w-32 h-32 mx-auto mb-8 rounded-[2.5rem] bg-primary/5 flex flex-col items-center justify-center border-2 border-primary/20 shadow-inner">
            <span className="text-4xl font-black text-primary">{result.level}★</span>
            <span className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mt-1">Grade</span>
          </div>
          <CardTitle className="text-4xl mb-3 font-bold text-slate-900 tracking-tight">Calibration Success</CardTitle>
          <div className="flex flex-col items-center gap-1 mb-10">
             <p className="text-xl font-bold text-slate-700">{result.score}% Accuracy</p>
             <p className="text-sm font-bold text-primary uppercase tracking-[0.2em]">{levelNames[result.level]} Path Unlocked</p>
          </div>
          
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left mb-10 space-y-4">
             <div className="flex items-center gap-3">
                <Target size={20} className="text-primary" />
                <h4 className="font-bold text-slate-800 text-sm">Adaptive Tuning:</h4>
             </div>
             <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {result.level === 5 ? 'System configured for high-complexity, conceptual deep-dives and technical rigor.' :
                 result.level === 4 ? 'System configured for balanced conceptual delivery with structural reinforcement.' :
                 'System configured for fundamental concepts, visual analogies, and progressive disclosure.'}
             </p>
          </div>

          <Button 
            onClick={() => navigate(`/dashboard/courses/${courseId}`)} 
            variant="primary" 
            className="w-full btn-primary !py-7 !rounded-2xl group"
          >
            Enter Curriculum
            <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    );
  }

  // Quiz view
  if (!questions.length) return null;
  const q = questions[currentQIndex];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
      <Card className="w-full max-w-3xl surface-elevated !rounded-[3rem] shadow-2xl shadow-slate-200/40 relative overflow-hidden">
        {/* Visual Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <CardHeader className="p-10 pb-6 mb-2">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
               <span className="text-[10px] text-slate-300 font-black tracking-widest uppercase">Diagnostic Node</span>
               <p className="text-xs font-bold text-slate-900">Question {currentQIndex + 1} of {questions.length}</p>
            </div>
            {q.difficulty && (
               <Badge className={`bg-slate-50 text-slate-400 border-none font-bold text-[9px] uppercase tracking-widest px-4 py-1 ${
                 q.difficulty === 'easy' ? 'text-green-500 bg-green-50' :
                 q.difficulty === 'medium' ? 'text-amber-500 bg-amber-50' :
                 'text-red-500 bg-red-50'
               }`}>{q.difficulty}</Badge>
            )}
          </div>
          
          <div className="space-y-6">
            <CardTitle className="text-2xl font-bold leading-snug text-slate-900 tracking-tight">
               {q.question}
            </CardTitle>
            
            {/* Minimalist Progress Meter */}
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-primary rounded-full transition-all duration-700 ease-out" 
                 style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
               ></div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-10 px-10 pt-0 space-y-3">
          {Object.entries(q.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`w-full text-left p-6 rounded-[1.5rem] border-2 transition-all flex items-center gap-6 group ${
                selectedAnswers[currentQIndex] === key 
                  ? 'bg-primary/5 border-primary shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
              }`}
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                selectedAnswers[currentQIndex] === key 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-50 text-slate-300 group-hover:bg-primary/10 group-hover:text-primary'
              }`}>
                {key}
              </div>
              <span className={`font-bold transition-colors ${selectedAnswers[currentQIndex] === key ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{value}</span>
              {selectedAnswers[currentQIndex] === key && <Sparkles size={16} className="ml-auto text-primary animate-pulse" />}
            </button>
          ))}
        </CardContent>

        <CardFooter className="p-10 pt-0 flex gap-4">
          <Button 
            className="flex-1 !rounded-2xl !h-14 font-black tracking-widest text-[10px] uppercase border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            variant="outline"
            onClick={handlePrev}
            disabled={currentQIndex === 0}
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>
          
          {currentQIndex === questions.length - 1 ? (
            <Button 
              className="flex-1 !rounded-2xl !h-14 btn-primary"
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length < questions.length}
            >
              Complete Calibration
              <Shield size={16} className="ml-2" />
            </Button>
          ) : (
            <Button 
              className="flex-1 !rounded-2xl !h-14 btn-primary group"
              onClick={handleNext}
              disabled={selectedAnswers[currentQIndex] === undefined}
            >
              Continue
              <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
