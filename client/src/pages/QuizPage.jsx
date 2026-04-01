import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, RotateCcw, Brain, ChevronRight, ChevronLeft, Sparkles, BookOpen } from 'lucide-react';
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

  // Fetch AI-generated quiz on mount
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const content = `Topic: ${topic}. This is an educational module quiz for testing student understanding of ${topic}.`;
        const { data } = await api.post('/ai/quiz', { content, difficulty: 'moderate' });
        if (data.quiz && data.quiz.length > 0) {
          setQuestions(data.quiz);
        } else {
          // Fallback
          setQuestions([{ question: 'The cognitive network could not synthesize questions for this node.', options: { A: 'Retry Protocol', B: 'Return to Source', C: '-', D: '-' }, answer: 'A' }]);
        }
      } catch (err) {
        console.error('Failed to load quiz questions', err);
        setQuestions([{ question: 'Neural link failed. The quiz synthesis protocol was interrupted.', options: { A: 'Acknowledge', B: '-', C: '-', D: '-' }, answer: 'A' }]);
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
    setCalculatedScore(score);
    setSubmitted(true);

    try {
      if (id && courseId) {
        await api.post(`/assessments/module/${id}/submit`, { score, courseId });
      }
    } catch (err) {
      console.error('Failed to submit quiz', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-8">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Synthesizing Neural Quiz</h2>
            <p className="text-sm text-slate-400 font-medium italic">Constructing challenge nodes for {topic}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const correctCount = questions.filter((q, idx) => selectedAnswers[idx] === q.answer).length;

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
        <Card className="w-full max-w-2xl text-center p-12 surface-elevated !rounded-[3rem] shadow-2xl shadow-slate-200/50">
          <div className="mb-10">
            <div className={`w-32 h-32 mx-auto rounded-[2.5rem] flex flex-col items-center justify-center mb-8 border-2 shadow-inner ${
              calculatedScore >= 70 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              <Trophy size={48} className="mb-1" />
              <span className="text-2xl font-black">{calculatedScore}%</span>
            </div>
            <CardTitle className="text-4xl mb-3 font-bold text-slate-900 tracking-tight">Quiz Synchronized</CardTitle>
            <p className="text-slate-500 font-bold text-lg">{correctCount} / {questions.length} Concepts Mastered</p>
            <p className="text-sm mt-4 text-slate-400 max-w-sm mx-auto leading-relaxed">
              {calculatedScore >= 85 ? '🌟 Neural mastery achieved. Your comprehension metrics are exceptional.' : 
               calculatedScore >= 70 ? '✅ Successful validation. You have a firm grasp of these principles.' : 
               calculatedScore >= 50 ? '📚 Moderate alignment. We recommend reviewing the curriculum nodes.' : 
               '💪 Conceptual drift detected. Re-engage with the material to stabilize understanding.'}
            </p>
          </div>

          {/* Answer review */}
          <div className="space-y-3 text-left mb-10 max-h-[400px] overflow-y-auto px-4 custom-scrollbar">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-4 text-center">Diagnostic Breakdown</p>
            {Array.isArray(questions) && questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.answer;
              return (
                <div key={idx} className={`p-6 rounded-3xl border-2 transition-all ${isCorrect ? 'bg-green-50/30 border-green-50' : 'bg-red-50/30 border-red-50'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 mb-2 leading-tight">Node {idx + 1}: {q.question}</p>
                      <div className="flex flex-wrap gap-2 items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>Choice: {selectedAnswers[idx] || 'NULL'}</span>
                         <span className="text-slate-300">|</span>
                         <span className="text-slate-500">Validation: {q.answer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate(courseId ? `/dashboard/courses/${courseId}` : '/dashboard/courses')} 
              variant="primary" 
              className="flex-1 btn-primary !h-14 !rounded-2xl"
            >
              Resume Curriculum
              <BookOpen size={16} className="ml-2" />
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="flex-1 !h-14 !rounded-2xl border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            >
              <RotateCcw size={16} className="mr-2" />
              Re-initialize Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
      <Card className="w-full max-w-3xl surface-elevated !rounded-[3rem] shadow-2xl shadow-slate-200/40 relative overflow-hidden">
        {/* Visual Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <CardHeader className="p-10 pb-6 mb-2">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
               <span className="text-[10px] text-slate-300 font-bold tracking-[0.3em] uppercase">Intelligence Node</span>
               <p className="text-xs font-bold text-slate-900">Module Quiz: {currentQIndex + 1} / {questions.length}</p>
            </div>
            <Badge className="bg-secondary/5 text-secondary border-none font-bold text-[9px] uppercase tracking-widest px-4 py-1.5">{topic}</Badge>
          </div>
          
          <div className="space-y-6">
            <CardTitle className="text-2xl font-bold leading-snug text-slate-900 tracking-tight">
               {q.question}
            </CardTitle>
            
            {/* Progress Meter */}
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-primary rounded-full transition-all duration-700 ease-out" 
                 style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
               ></div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-10 px-10 pt-0 space-y-3">
          {q && q.options && Object.entries(q.options).map(([key, value]) => (
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
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
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
            Previous Node
          </Button>
          
          {currentQIndex === questions.length - 1 ? (
            <Button 
              className="flex-1 !rounded-2xl !h-14 btn-primary group"
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length < questions.length}
            >
              Validate Understanding
              <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Button 
              className="flex-1 !rounded-2xl !h-14 btn-primary group"
              onClick={handleNext}
              disabled={selectedAnswers[currentQIndex] === undefined}
            >
              Next Concept
              <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
