import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight, ArrowLeft, Sparkles, Maximize, ShieldAlert, Layers } from 'lucide-react';
import api from '../lib/api';
import { useSecureMode } from '../hooks/useSecureMode';

export default function QuizPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('courseId');
  const topic = searchParams.get('topic') || 'General Knowledge';

  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);

  const { isFullscreen, showWarning, enterFullscreen, exitFullscreen } = useSecureMode(quizStarted && !submitted);

  // Fetch quiz questions
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const content = `Topic: ${topic}. This is an educational module quiz for testing student understanding of ${topic}.`;
        const { data } = await api.post('/ai/quiz', { content, difficulty: 'moderate' });
        if (data.quiz && data.quiz.length > 0) {
          setQuestions(data.quiz);
        } else {
          setQuestions([{ question: 'Module query failed. Please restart the session.', options: { A: 'RETRY', B: '-', C: '-', D: '-' }, answer: 'A' }]);
        }
      } catch (err) {
        console.error('Failed to load quiz questions', err);
        setQuestions([{ question: 'Neural link interrupted. Please try again.', options: { A: 'ACKNOWLEDGE', B: '-', C: '-', D: '-' }, answer: 'A' }]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [topic]);

  const q = questions[currentQIndex];

  const handleSelect = (key) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQIndex]: key });
  };

  const handleNext = () => { if (currentQIndex < questions.length - 1) setCurrentQIndex(currentQIndex + 1); };
  const handlePrev = () => { if (currentQIndex > 0) setCurrentQIndex(currentQIndex - 1); };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, idx) => { if (selectedAnswers[idx] === q.answer) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    setCalculatedScore(score);
    setSubmitted(true);
    // Exit fullscreen now that quiz is done
    exitFullscreen();
    try {
      if (id && courseId) {
        await api.post(`/assessments/module/${id}/submit`, { score, courseId });
      }
    } catch (err) { console.error('Failed to submit quiz', err); }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-violet-50/50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles className="text-violet-400 animate-pulse" size={24} />
          </div>
        </div>
        <div className="text-center space-y-4">
          <p className="text-2xl font-black tracking-tighter text-violet-950 uppercase italic">Formulating Quiz</p>
          <p className="text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase">Extracting key concepts for {topic}</p>
        </div>
      </div>
    );
  }

  // --- INTRO / READY STATE ---
  if (!quizStarted && !loading && !submitted) {
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-violet-50/50 animate-fade-in-up">
        <Card className="w-full max-w-xl bg-white border border-violet-100 rounded-[2rem] p-12 shadow-2xl shadow-violet-900/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-400 via-fuchsia-500 to-violet-600"></div>
          
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 ring-8 ring-violet-50/50">
            <ShieldAlert size={40} />
          </div>
          
          <h1 className="text-3xl font-black mb-4 tracking-tighter text-violet-950 uppercase italic">
            Secure <span className="text-violet-300">Session</span>
          </h1>
          <p className="inline-block px-4 py-1.5 rounded-full bg-violet-100 text-[10px] font-black tracking-widest uppercase text-violet-600 mb-8">{topic}</p>
          <p className="text-slate-500 mb-12 text-sm font-medium px-4 leading-relaxed">
            This module quiz is conducted in Secure Mode. You must remain in full-screen until submission. Exiting will trigger a security intervention.
          </p>
          
          <button 
            className="w-full py-5 rounded-xl font-black text-sm tracking-widest text-white uppercase bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-xl shadow-violet-500/25 transition-all active:scale-[0.98]" 
            onClick={() => {
              enterFullscreen();
              setQuizStarted(true);
            }}
          >
            START SECURE QUIZ
          </button>
        </Card>
      </div>
    );
  }

  // --- RESULTS STATE ---
  if (submitted) {
    const correct = questions.filter((q, idx) => selectedAnswers[idx] === q.answer).length;
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-violet-50/50 animate-fade-in-up">
        <Card className="w-full max-w-2xl bg-white border border-violet-100 rounded-[2rem] p-10 shadow-2xl shadow-violet-900/5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-100 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50 z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-100 rounded-full blur-[80px] -ml-32 -mb-32 opacity-50 z-0"></div>
          
          <div className="relative z-10 mb-10">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border-4 ${calculatedScore >= 70 ? 'bg-violet-600 text-white border-violet-100 shadow-xl shadow-violet-500/20' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
              <Trophy size={40} />
            </div>
            <CardTitle className="text-6xl font-black italic tracking-tighter mb-4 text-violet-950">{calculatedScore}%</CardTitle>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-500">{correct} OF {questions.length} QUESTIONS CORRECT</p>
            <p className="text-sm mt-6 text-slate-500 font-medium px-10 leading-relaxed">
              {calculatedScore >= 85 ? '🌟 Excellent work! You have completely mastered this module topic.' :
               calculatedScore >= 70 ? '✅ Good job. You have a solid grasp of the core concepts.' :
               '💪 You might want to review the module material and attempt the quiz again.'}
            </p>
          </div>

          <div className="space-y-4 text-left mb-12 max-h-96 overflow-y-auto pr-2 relative z-10 custom-scrollbar">
            {questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.answer;
              return (
                <div key={idx} className={`p-5 rounded-xl border-l-[6px] transition-all ${isCorrect ? 'bg-violet-50 border-l-violet-500 border-y-transparent border-r-transparent' : 'bg-rose-50 border-l-rose-500 border-y-transparent border-r-transparent'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 mt-1 ${isCorrect ? 'text-violet-600' : 'text-rose-500'}`}>
                      {isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-2 leading-tight">Q{idx + 1}: {q.question}</p>
                      <p className="text-[10px] font-black tracking-widest uppercase items-center gap-2">
                         <span className={isCorrect ? 'text-violet-500' : 'text-rose-500'}>Your Answer: {selectedAnswers[idx] || 'None'}</span>
                         <span className="mx-2 text-slate-300">|</span>
                         <span className="text-emerald-600">Correct: {q.answer}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 relative z-10">
            <button onClick={() => navigate(courseId ? `/dashboard/courses/${courseId}` : '/dashboard/courses')} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center">
              <ArrowLeft size={16} className="mr-2" /> EXIT MODULE
            </button>
            <button onClick={() => window.location.reload()} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 transition-colors flex items-center justify-center">
              <RotateCcw size={16} className="mr-2" /> RETRY QUIZ
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // --- FULLSCREEN WARNING OVERLAY ---
  if (quizStarted && !submitted && (showWarning || !isFullscreen)) {
    return (
      <div className="fixed inset-0 z-[9999] bg-violet-950/95 backdrop-blur-sm flex flex-col items-center justify-center space-y-8 animate-fade-in-up">
        <div className="w-24 h-24 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-500/50 animate-bounce">
          <ShieldAlert size={40} />
        </div>
        <div className="text-center space-y-4 max-w-md px-6">
          <p className="text-3xl font-black tracking-tighter text-white uppercase italic">Security Alert</p>
          <p className="text-base font-medium text-violet-200 leading-relaxed text-center">
            You have exited full-screen mode during a secure quiz. This is prohibited. Please resume full-screen immediately to continue your assessment.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button 
            onClick={() => { 
                exitFullscreen(); 
                navigate(courseId ? `/dashboard/courses/${courseId}` : '/dashboard/courses'); 
            }} 
            className="px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase border-2 border-rose-500 text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <XCircle size={16} className="mr-3 inline-block" />
            FORFEIT QUIZ
          </button>
          <button onClick={enterFullscreen} className="px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase bg-white text-violet-950 hover:bg-violet-50 transition-colors">
            <Maximize size={16} className="mr-3 inline-block" />
            RESUME FULLSCREEN
          </button>
        </div>
      </div>
    );
  }

  if (!q || !q.options) return null;

  // --- QUIZ STATE ---
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-violet-50/50 animate-fade-in-up">
      <Card className="w-full max-w-3xl bg-white border border-violet-100 rounded-[2rem] p-8 sm:p-12 shadow-2xl shadow-violet-900/5 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-[80px] -mr-20 -mt-20 opacity-70 z-0"></div>

        <CardHeader className="p-0 border-b border-violet-50 pb-8 mb-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-inner">
                  <Layers size={20} />
               </div>
               <div>
                  <div className="text-[10px] text-violet-400 font-black tracking-widest uppercase mb-1">MODULE QUIZ</div>
                  <div className="text-xs text-violet-950 font-bold max-w-[200px] truncate">{topic}</div>
               </div>
            </div>
            <div className="bg-violet-600 text-white rounded-full px-5 py-2 flex items-center gap-2 shadow-lg shadow-violet-500/20">
               <span className="text-xs font-black uppercase tracking-widest">Question</span>
               <span className="text-sm font-black">{currentQIndex + 1} / {questions.length}</span>
            </div>
          </div>
          
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-10">
            <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 transition-all duration-700 ease-out" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
          
          <div className="mt-4">
             <CardTitle className="text-2xl md:text-3xl font-black text-slate-800 leading-tight tracking-tight">{q.question}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col gap-4 relative z-10">
          {Object.entries(q.options || {}).map(([key, value]) => {
            const isSelected = selectedAnswers[currentQIndex] === key;
            return (
              <button key={key} onClick={() => handleSelect(key)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-6 group relative overflow-hidden ${
                  isSelected 
                    ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-500/10' 
                    : 'border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/30'
                }`}>
                
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-violet-500"></div>
                )}
                
                <span className={`font-black text-xs w-10 h-10 flex items-center justify-center rounded-lg border transition-colors shrink-0 ${
                  isSelected 
                    ? 'bg-violet-600 border-violet-600 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:text-violet-600 group-hover:border-violet-200 group-hover:bg-violet-100 text-white'
                }`}>{key}</span>
                <span className={`text-sm md:text-base font-bold ${
                  isSelected ? 'text-violet-950' : 'text-slate-600 group-hover:text-slate-800'
                }`}>{value}</span>
              </button>
            )
          })}
        </CardContent>

        <CardFooter className="p-0 pt-10 mt-10 border-t border-violet-50 flex gap-4 relative z-10">
          <button className="flex-1 rounded-xl py-4 font-bold text-xs tracking-widest uppercase border-2 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors" onClick={handlePrev} disabled={currentQIndex === 0}>
             PREVIOUS
          </button>
          {currentQIndex === questions.length - 1 ? (
            <button className="flex-[2] rounded-xl py-4 font-black text-xs tracking-widest uppercase bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-xl shadow-violet-500/25 disabled:opacity-50 disabled:pointer-events-none transition-all" onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length < questions.length}>
               SUBMIT QUIZ ({Object.keys(selectedAnswers).length}/{questions.length})
            </button>
          ) : (
            <button className="flex-[2] rounded-xl py-4 font-black text-xs tracking-widest uppercase bg-violet-600 text-white hover:bg-violet-700 shadow-xl shadow-violet-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center" onClick={handleNext} disabled={selectedAnswers[currentQIndex] === undefined}>
               NEXT QUESTION <ArrowRight size={16} className="ml-2" />
            </button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
