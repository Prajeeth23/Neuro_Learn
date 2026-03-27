import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { VideoPlayer } from '../components/course/VideoPlayer';
import { AiTutor } from '../components/ai/AiTutor';
import { Card, CardContent } from '../components/ui/Card';
import { Shield, Sparkles, BookOpen, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';

const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    if (url.includes('list=')) {
      const listId = urlObj.searchParams.get('list');
      return `https://www.youtube.com/embed/videoseries?list=${listId}`;
    }
    if (url.includes('watch?v=')) {
      const videoId = urlObj.searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) { /* ignore */ }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [userLevel, setUserLevel] = useState(3);
  
  // Summary + Quiz state
  const [summaryData, setSummaryData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Quiz interaction state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (id === 'mock-dsa-123') {
        setCourse({
          id: 'mock-dsa-123',
          title: 'Data Structures and Algorithms (DSA)',
          description: 'Master DSA with this comprehensive YouTube playlist series.'
        });
        setModules([{
          id: 'fake-mod-1',
          title: 'YouTube Playlist Wrapper',
          video_url: 'https://youtube.com/playlist?list=PLgUwDviBIf0rENwdL0nEH0uGom9no0nyB'
        }]);
        setCurrentModule({
          id: 'fake-mod-1',
          title: 'YouTube Playlist Wrapper',
          video_url: 'https://youtube.com/playlist?list=PLgUwDviBIf0rENwdL0nEH0uGom9no0nyB'
        });
        return;
      }

      try {
        const { data: cData } = await api.get(`/courses/${id}`);
        setCourse(cData);

        // Fetch user level for this course
        try {
          const { data: progressData } = await api.get('/progress');
          const courseProgress = progressData?.find(p => p.course_id === id);
          if (courseProgress?.level) {
            setUserLevel(courseProgress.level);
          }
        } catch (e) { /* use default level 3 */ }

        try {
          const { data: mData } = await api.get(`/courses/${id}/modules`);
          setModules(mData || []);
          if (mData?.length > 0) setCurrentModule(mData[0]);
        } catch (mErr) {
          console.log('Modules locked:', mErr.response?.data?.error || mErr.message);
          setModules([]);
          setCurrentModule(null);
        }
      } catch (err) {
        console.error('Failed to load course details', err);
      }
    }
    loadData();
  }, [id]);

  // Reset quiz state when module changes
  useEffect(() => {
    setSummaryData(null);
    setQuizData(null);
    setShowSummary(false);
    setShowQuiz(false);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  }, [currentModule?.id]);

  const handleGenerateSummaryQuiz = async () => {
    if (!currentModule) return;
    setGeneratingAI(true);
    try {
      const content = `Video URL: ${currentModule.video_url}. Module: ${currentModule.title}. Course: ${course.title}. Description: ${course.description}`;
      const { data } = await api.post('/ai/summary-and-quiz', { 
        content, 
        level: userLevel,
        moduleTitle: currentModule.title,
        videoUrl: currentModule.video_url
      });
      setSummaryData(data.summary);
      setQuizData(data.quiz);
      setShowSummary(true);
    } catch (err) {
      console.error('Failed to generate summary & quiz', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleQuizSelect = (qIdx, answer) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: answer }));
  };

  const handleQuizSubmit = async () => {
    if (!quizData) return;
    let correct = 0;
    quizData.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) correct++;
    });
    const score = Math.round((correct / quizData.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    // Submit to backend
    try {
      if (currentModule?.id && course?.id && currentModule.id !== 'fake-mod-1') {
        await api.post(`/assessments/module/${currentModule.id}/submit`, { score, courseId: course.id });
      }
    } catch (e) { console.error('Failed to submit quiz score', e); }
  };

  if (!course) return <div className="p-8 text-white/50">Loading...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">{course.title}</h1>
          <p className="text-white/40 font-medium tracking-widest uppercase text-[10px] ml-1">Current Learning Module</p>
        </div>
        
        {currentModule ? (
          <div className="space-y-8">
            {/* Video Player */}
            <div className="glass-card-premium neon-border-primary border-white/5 p-4 relative group">
              {currentModule.video_url.includes('youtube.com') || currentModule.video_url.includes('youtu.be') ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                  <iframe 
                    className="w-full h-full" 
                    src={getYoutubeEmbedUrl(currentModule.video_url)} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                  <VideoPlayer url={currentModule.video_url} title={currentModule.title} />
                </div>
              )}
              <div className="absolute -top-3 -left-3 px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-xl text-[10px] font-black tracking-widest uppercase text-white shadow-lg">
                Active Session
              </div>
            </div>

            {/* Module Info + Actions */}
            <div className="glass-card-premium p-8 border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-gradient-primary leading-none">{currentModule.title}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Complexity:</span>
                  <span className="px-2 py-0.5 bg-accent/10 border border-accent/30 text-accent text-[10px] font-black rounded uppercase">Level {currentModule.difficulty_level || '3'}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleGenerateSummaryQuiz}
                  disabled={generatingAI}
                  className="uiverse-btn-outline !px-6 !py-3 flex items-center gap-2 !text-xs tracking-widest uppercase disabled:opacity-50"
                >
                  {generatingAI ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-accent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      AI Summary & Quiz
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Summary Section */}
            {showSummary && summaryData && (
              <div className="glass-card-premium p-8 border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight text-gradient-primary flex items-center gap-3">
                    <BookOpen size={22} className="text-accent" />
                    AI-Generated Summary
                  </h3>
                  <button 
                    onClick={() => { setShowQuiz(true); setShowSummary(false); }}
                    className="uiverse-btn-outline !px-4 !py-2 !text-[10px] font-black tracking-widest uppercase"
                  >
                    Take Quiz →
                  </button>
                </div>
                <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                  {summaryData}
                </div>
              </div>
            )}

            {/* AI Quiz Section */}
            {showQuiz && quizData && (
              <div className="glass-card-premium p-8 border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight text-gradient-primary flex items-center gap-3">
                    <BrainCircuit size={22} className="text-primary" />
                    Module Quiz ({quizData.length} Questions)
                  </h3>
                  {!showSummary && summaryData && (
                    <button 
                      onClick={() => { setShowSummary(true); setShowQuiz(false); }}
                      className="uiverse-btn-outline !px-4 !py-2 !text-[10px] font-black tracking-widest uppercase"
                    >
                      ← View Summary
                    </button>
                  )}
                </div>

                {quizSubmitted && (
                  <div className={`text-center p-6 rounded-2xl border ${quizScore >= 70 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <p className="text-3xl font-black mb-1">{quizScore}%</p>
                    <p className="text-sm text-white/50">{quizScore >= 70 ? 'Great job! Keep going!' : 'Review the summary and try again.'}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {quizData.map((q, qIdx) => (
                    <div key={qIdx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                      <p className="font-bold text-white/90 text-sm">
                        <span className="text-primary mr-2">Q{qIdx + 1}.</span>
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(q.options).map(([key, value]) => {
                          const isSelected = selectedAnswers[qIdx] === key;
                          const isCorrect = quizSubmitted && key === q.answer;
                          const isWrong = quizSubmitted && isSelected && key !== q.answer;

                          return (
                            <button
                              key={key}
                              onClick={() => handleQuizSelect(qIdx, key)}
                              disabled={quizSubmitted}
                              className={`text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                                isCorrect   ? 'bg-green-500/20 border-green-500/50 text-green-300' :
                                isWrong     ? 'bg-red-500/20 border-red-500/50 text-red-300' :
                                isSelected  ? 'bg-primary/20 border-primary/50 text-white' :
                                              'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-white/70'
                              }`}
                            >
                              <span className="font-black text-xs shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
                                {key}
                              </span>
                              <span className="flex-1">{value}</span>
                              {isCorrect && <CheckCircle size={16} className="text-green-400 shrink-0" />}
                              {isWrong && <XCircle size={16} className="text-red-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {!quizSubmitted && (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(selectedAnswers).length < quizData.length}
                    className="uiverse-btn w-full !py-4 shadow-xl shadow-primary/20 disabled:opacity-40"
                  >
                    Submit Quiz ({Object.keys(selectedAnswers).length}/{quizData.length} answered)
                  </button>
                )}
              </div>
            )}

            {/* Modules List */}
            {modules.length > 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-black tracking-widest uppercase text-white/30 ml-1 italic">Course Roadmap</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {modules.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => setCurrentModule(m)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                        currentModule?.id === m.id 
                          ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <span className={`text-xl font-black italic ${currentModule?.id === m.id ? 'text-primary' : 'text-white/10 group-hover:text-white/20'}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className={`font-bold tracking-tight ${currentModule?.id === m.id ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>{m.title}</span>
                      </div>
                      {currentModule?.id === m.id && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="glass-card-premium p-12 text-center border-dashed border-white/10 flex flex-col items-center justify-center space-y-6">
            <div className="p-6 bg-white/[0.03] rounded-full text-white/10">
              <Shield size={48} />
            </div>
            <div className="space-y-2 max-w-sm">
              <p className="text-xl font-bold text-white/60">Module Locked</p>
              <p className="text-white/20 text-sm font-medium">Complete the adaptive diagnostic assessment to unlock your personalized learning path.</p>
            </div>
            <button 
              onClick={() => window.location.href=`/dashboard/assessment/${course.id}`}
              className="uiverse-btn shadow-lg"
            >
              Launch Assessment
            </button>
          </Card>
        )}
      </div>

      {/* Sidebar: AI Tutor */}
      <div className="w-full lg:w-[400px] flex flex-col gap-8 shrink-0">
        <div className="sticky top-24">
          <div className="mb-4 flex items-center gap-2 px-1">
            <Sparkles size={16} className="text-accent" />
            <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Groq AI Assistant</span>
          </div>
          <div className="glass-card-premium border-white/10 overflow-hidden shadow-2xl">
            <AiTutor 
              context={currentModule ? currentModule.title : course.title} 
              level={userLevel}
              topic={currentModule ? currentModule.title : course.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
