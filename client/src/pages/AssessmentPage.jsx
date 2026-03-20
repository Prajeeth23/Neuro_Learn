import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <Card className="max-w-md text-center p-8 glass-card-premium neon-border-primary">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
            <BrainCircuit size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Diagnostic Assessment
          </h1>
          <p className="text-white/70 mb-3 text-sm">{courseName}</p>
          <p className="text-white/40 mb-8 text-sm">
            This quick 10-question assessment will calibrate NeuroLearn's adaptive engine to match your skill level.
            No pressure — it just ensures you get the right content!
          </p>
          <div className="space-y-3 text-left mb-8 text-xs text-white/40">
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
              <span className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-black">3★</span>
              <span>Score &lt; 50% → <strong className="text-white/60">Beginner</strong> — Simple explanations</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
              <span className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 font-black">4★</span>
              <span>Score 50-79% → <strong className="text-white/60">Intermediate</strong> — Moderate depth</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
              <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black">5★</span>
              <span>Score ≥ 80% → <strong className="text-white/60">Advanced</strong> — In-depth content</span>
            </div>
          </div>
          <Button className="w-full uiverse-btn !py-5 shadow-xl shadow-primary/20" onClick={handleStart}>
            Start Assessment
          </Button>
        </Card>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-white/70">Generating Assessment</p>
            <p className="text-sm text-white/30">AI is creating 10 diagnostic questions on {courseName}...</p>
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (submitted && result) {
    const starColors = { 3: 'text-green-400', 4: 'text-yellow-400', 5: 'text-purple-400' };
    const starBgs = { 3: 'bg-green-500/10 border-green-500/30', 4: 'bg-yellow-500/10 border-yellow-500/30', 5: 'bg-purple-500/10 border-purple-500/30' };
    const levelNames = { 3: 'Beginner', 4: 'Intermediate', 5: 'Advanced' };

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
        <Card className="w-full max-w-lg text-center p-8 glass-card-premium neon-border-primary">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full border-2 flex items-center justify-center ${starBgs[result.level]}`}>
            <span className={`text-4xl font-black ${starColors[result.level]}`}>{result.level}★</span>
          </div>
          <CardTitle className="text-3xl mb-2 font-black">Assessment Complete!</CardTitle>
          <p className="text-xl text-white/70 mb-2">{result.score}% — {result.correct}/{result.total} correct</p>
          <p className={`text-lg font-bold mb-6 ${starColors[result.level]}`}>
            Level: {levelNames[result.level]}
          </p>
          <p className="text-sm text-white/40 mb-8">
            {result.level === 5 ? 'You\'ll get detailed, in-depth content explanations.' :
             result.level === 4 ? 'You\'ll get clear, moderately detailed content.' :
             'You\'ll get simple, easy-to-understand explanations with examples.'}
          </p>
          <Button 
            onClick={() => navigate(`/dashboard/courses/${courseId}`)} 
            variant="primary" 
            className="w-full uiverse-btn !py-4"
          >
            Begin Learning →
          </Button>
        </Card>
      </div>
    );
  }

  // Quiz view
  if (!questions.length) return null;
  const q = questions[currentQIndex];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <Card className="w-full max-w-2xl glass-card-premium neon-border-primary">
        <CardHeader className="border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-white/40 font-black tracking-widest uppercase">Question {currentQIndex + 1} of {questions.length}</span>
            {q.difficulty && (
              <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${
                q.difficulty === 'easy' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                q.difficulty === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>{q.difficulty}</span>
            )}
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
              Submit ({Object.keys(selectedAnswers).length}/{questions.length})
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
