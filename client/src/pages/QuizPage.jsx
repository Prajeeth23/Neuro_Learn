import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight, ArrowLeft, Loader2, Sparkles, BrainCircuit, Maximize, ShieldAlert } from 'lucide-react';
import api from '../lib/api';

export default function QuizPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('courseId');
  const topic = searchParams.get('topic') || 'General Knowledge';

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(() => document.fullscreenElement ? true : false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

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
    try {
      if (id && courseId) {
        await api.post(`/assessments/module/${id}/submit`, { score, courseId });
      }
    } catch (err) { console.error('Failed to submit quiz', err); }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 grayscale opacity-40">
        <div className="w-16 h-16 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
        <div className="text-center space-y-4">
          <p className="text-2xl font-black tracking-tighter text-black uppercase italic">Neural Sync in Progress</p>
          <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Synthesizing 10 priority nodes for {topic}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    const correct = questions.filter((q, idx) => selectedAnswers[idx] === q.answer).length;
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 animate-fade-in-up">
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
               '💪 Alignment incomplete. Recommendation: Review synopsys and recalibrate pulse.'}
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
            <Button onClick={() => { exitFullscreen(); navigate(courseId ? `/dashboard/courses/${courseId}` : '/dashboard/courses'); }} variant="outline" className="flex-1 !rounded-xl !py-4">
              <ArrowLeft size={14} className="mr-2" /> EXIT NODE
            </Button>
            <Button onClick={() => { window.location.reload(); }} variant="black" className="flex-1 !rounded-xl !py-4">
              <RotateCcw size={14} className="mr-2" /> RECALIBRATE
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isFullscreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-fade-in-up">
        <div className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-black/10">
          <ShieldAlert size={32} />
        </div>
        <div className="text-center space-y-4 max-w-md">
          <p className="text-2xl font-black tracking-tighter text-black uppercase italic">Secure Mode Required</p>
          <p className="text-sm font-medium text-gray-500 leading-relaxed px-6">
            This assessment requires secure full-screen mode to prevent distractions and ensure integrity. Please enter full screen to continue.
          </p>
        </div>
        <Button onClick={enterFullscreen} variant="black" className="px-8 !py-4 !rounded-xl text-xs font-black tracking-widest uppercase mt-4">
          <Maximize size={16} className="mr-3 inline-block" />
          ENTER FULLSCREEN
        </Button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 animate-fade-in-up">
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
