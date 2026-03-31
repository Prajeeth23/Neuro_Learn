import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight, ArrowLeft, BrainCircuit, Maximize, ShieldAlert } from 'lucide-react';
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
          setQuestions([{ question: 'Vector sync failed. Please recalibrate.', options: { A: 'RETRY', B: '-', C: '-', D: '-' }, answer: 'A' }]);
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
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-white">
        <div className="w-16 h-16 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
        <div className="text-center space-y-4">
          <p className="text-2xl font-black tracking-tighter text-black uppercase italic">Neural Sync in Progress</p>
          <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Synthesizing 10 priority nodes for {topic}</p>
        </div>
      </div>
    );
  }

  // --- INTRO / READY STATE ---
  if (!quizStarted && !loading && !submitted) {
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] animate-fade-in-up">
        <Card className="w-full max-w-xl bg-white border border-gray-100 rounded-[3rem] p-12 shadow-card-lg text-center">
          <div className="w-20 h-20 mx-auto mb-10 rounded-[1.5rem] bg-black flex items-center justify-center text-white shadow-xl shadow-black/10">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tighter text-black uppercase italic">
            Secure <span className="text-gray-300">Session</span>
          </h1>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mb-8">{topic}</p>
          <p className="text-gray-500 mb-12 text-sm font-medium px-4 leading-relaxed">
            This assessment is conducted in Secure Mode. You must remain in full-screen until submission. Exiting will trigger a security intervention.
          </p>
          
          <Button variant="black" className="w-full !py-6 !rounded-2xl shadow-xl shadow-black/5 active:scale-[0.98]" onClick={() => {
            enterFullscreen();
            setQuizStarted(true);
          }}>
            START SECURE ASSESSMENT
          </Button>
        </Card>
      </div>
    );
  }

  // --- RESULTS STATE ---
  if (submitted) {
    const correct = questions.filter((q, idx) => selectedAnswers[idx] === q.answer).length;
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] animate-fade-in-up">
        <Card className="w-full max-w-2xl bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-card-lg text-center">
          <div className="mb-10">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 border ${calculatedScore >= 70 ? 'bg-black text-white border-black' : 'bg-gray-50 text-black border-gray-100'}`}>
              <Trophy size={32} />
            </div>
            <CardTitle className="text-5xl font-black italic tracking-tighter mb-2">{calculatedScore}%</CardTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">{correct} OF {questions.length} NODES SYNCHRONIZED</p>
            <p className="text-sm mt-8 text-gray-400 font-medium px-10 leading-relaxed">
              {calculatedScore >= 85 ? '🌟 Neural alignment optimized. Exceptional focus achieved.' :
               calculatedScore >= 70 ? '✅ Target threshold met. Knowledge successfully indexed.' :
               '💪 Alignment incomplete. Recommendation: Review synopsis and recalibrate pulse.'}
            </p>
          </div>

          <div className="space-y-4 text-left mb-12 max-h-96 overflow-y-auto pr-2">
            {questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.answer;
              return (
                <div key={idx} className={`p-5 rounded-2xl border transition-all ${isCorrect ? 'bg-gray-50 border-gray-100' : 'bg-white border-black/10'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 mt-1 ${isCorrect ? 'text-black' : 'text-gray-300'}`}>
                      {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-black uppercase tracking-tight mb-2 leading-tight">Q{idx + 1}: {q.question}</p>
                      <p className="text-[10px] font-black tracking-widest text-gray-300 uppercase">Input: {selectedAnswers[idx] || 'NULL'} | Protocol: {q.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button onClick={() => navigate(courseId ? `/dashboard/courses/${courseId}` : '/dashboard/courses')} variant="outline" className="flex-1 !rounded-xl !py-4">
              <ArrowLeft size={14} className="mr-2" /> EXIT NODE
            </Button>
            <Button onClick={() => window.location.reload()} variant="black" className="flex-1 !rounded-xl !py-4">
              <RotateCcw size={14} className="mr-2" /> RECALIBRATE
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- FULLSCREEN WARNING OVERLAY (flashes briefly when ESC is pressed) ---
  if (quizStarted && !submitted && (showWarning || !isFullscreen)) {
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
            EXIT QUIZ
          </Button>
          <Button onClick={enterFullscreen} variant="black" className="px-8 !py-4 !rounded-xl text-xs font-black tracking-widest uppercase">
            <Maximize size={16} className="mr-3 inline-block" />
            RESUME FULLSCREEN
          </Button>
        </div>
      </div>
    );
  }

  if (!q || !q.options) return null;

  // --- QUIZ STATE ---
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] animate-fade-in-up">
      <Card className="w-full max-w-2xl bg-white border border-gray-100 rounded-[3rem] p-10 shadow-card-lg">
        <CardHeader className="p-0 border-b border-gray-50 pb-10 mb-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white"><BrainCircuit size={16} /></div>
               <div className="text-[10px] text-gray-300 font-black tracking-[0.2em] uppercase">ASSESSMENT PROTOCOL</div>
            </div>
            <div className="text-[10px] text-black font-black tracking-[0.2em] uppercase bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{topic}</div>
          </div>
          
          <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-black transition-all duration-700 ease-in-out" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
          
          <div className="flex justify-between items-end gap-10">
             <div className="text-[10px] font-black text-gray-200 uppercase tracking-[0.3em] mb-4">NODE {(currentQIndex + 1).toString().padStart(2, '0')}</div>
             <CardTitle className="text-xl md:text-2xl font-black text-black leading-tight tracking-tight uppercase italic">{q.question}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col gap-4">
          {Object.entries(q.options || {}).map(([key, value]) => (
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
          <Button className="!flex-1 !rounded-xl !border-gray-100 !text-gray-300 hover:!text-black" variant="outline" onClick={handlePrev} disabled={currentQIndex === 0}>
             PREVIOUS
          </Button>
          {currentQIndex === questions.length - 1 ? (
            <Button className="!flex-[2] !rounded-xl !py-4" variant="black" onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length < questions.length}>
               SUBMIT ASSESSMENT ({Object.keys(selectedAnswers).length}/{questions.length})
            </Button>
          ) : (
            <Button className="!flex-[2] !rounded-xl !py-4" variant="black" onClick={handleNext} disabled={selectedAnswers[currentQIndex] === undefined}>
               NEXT NODE <ArrowRight size={14} className="ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
