import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
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
          setQuestions([{ question: 'Could not load questions. Please try again.', options: { A: 'Retry', B: '-', C: '-', D: '-' }, answer: 'A' }]);
        }
      } catch (err) {
        console.error('Failed to load quiz questions', err);
        setQuestions([{ question: 'Failed to generate quiz. Please try again later.', options: { A: 'OK', B: '-', C: '-', D: '-' }, answer: 'A' }]);
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-white/70">Generating Your Quiz</p>
            <p className="text-sm text-white/30">AI is creating 10 questions on {topic}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const correct = questions.filter((q, idx) => selectedAnswers[idx] === q.answer).length;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
        <Card className="w-full max-w-2xl text-center p-8 glass-card-premium neon-border-primary">
          <div className="mb-8">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${calculatedScore >= 70 ? 'bg-green-500/20 border-2 border-green-500/40' : 'bg-red-500/20 border-2 border-red-500/40'}`}>
              <Trophy size={40} className={calculatedScore >= 70 ? 'text-green-400' : 'text-red-400'} />
            </div>
            <CardTitle className="text-4xl mb-2 font-black">{calculatedScore}%</CardTitle>
            <p className="text-white/50 text-lg">{correct} out of {questions.length} correct</p>
            <p className="text-sm mt-2 text-white/30">
              {calculatedScore >= 85 ? '🌟 Outstanding performance!' : 
               calculatedScore >= 70 ? '✅ Good job! Keep it up!' : 
               calculatedScore >= 50 ? '📚 Review the material and try again.' : 
               '💪 Don\'t give up! Study the summary and retry.'}
            </p>
          </div>

          {/* Answer review */}
          <div className="space-y-4 text-left mb-8 max-h-96 overflow-y-auto custom-scrollbar">
            {questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.answer;
              return (
                <div key={idx} className={`p-4 rounded-xl border text-sm ${isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" /> : <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />}
                    <div>
                      <p className="font-medium text-white/80 mb-1">Q{idx + 1}: {q.question}</p>
                      <p className="text-white/40">Your answer: {selectedAnswers[idx] || 'Not answered'} | Correct: {q.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button onClick={() => navigate(courseId ? `/dashboard/courses/${courseId}` : '/dashboard/courses')} variant="primary" className="flex-1">
              Return to Course
            </Button>
            <Button onClick={() => window.location.reload()} className="flex-1 flex items-center justify-center gap-2">
              <RotateCcw size={16} /> Retry Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <Card className="w-full max-w-2xl glass-card-premium neon-border-primary">
        <CardHeader className="border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-white/40 font-black tracking-widest uppercase">Question {currentQIndex + 1} of {questions.length}</div>
            <div className="text-[10px] text-accent font-black tracking-widest uppercase">{topic}</div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" 
              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <CardTitle className="text-xl leading-relaxed mt-4">{q.question}</CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-3">
          {Object.entries(q.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                selectedAnswers[currentQIndex] === key 
                  ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(100,50,255,0.3)]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
              }`}
            >
              <span className="font-black text-xs w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 shrink-0">{key}</span>
              <span>{value}</span>
            </button>
          ))}
        </CardContent>

        <CardFooter className="pt-6 flex gap-3">
          <Button 
            className="flex-1" 
            onClick={handlePrev}
            disabled={currentQIndex === 0}
          >
            Previous
          </Button>
          {currentQIndex === questions.length - 1 ? (
            <Button 
              className="flex-1" 
              variant="primary" 
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length < questions.length}
            >
              Submit Quiz ({Object.keys(selectedAnswers).length}/{questions.length})
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              variant="primary" 
              onClick={handleNext}
              disabled={selectedAnswers[currentQIndex] === undefined}
            >
              Next Question
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
