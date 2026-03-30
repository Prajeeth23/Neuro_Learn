import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { VideoPlayer } from '../components/course/VideoPlayer';
import { AiTutor } from '../components/ai/AiTutor';
import { Card, CardContent } from '../components/ui/Card';
import { Shield, Sparkles, BookOpen, BrainCircuit, CheckCircle, XCircle, ChevronRight, Play, Loader2 } from 'lucide-react';

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
  
  const [summaryData, setSummaryData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (id === 'mock-dsa-123') {
        setCourse({ id: 'mock-dsa-123', title: 'Data Structures and Algorithms (DSA)', description: 'Master DSA with this comprehensive YouTube playlist series.' });
        setModules([{ id: 'fake-mod-1', title: 'YouTube Playlist Wrapper', video_url: 'https://youtube.com/playlist?list=PLgUwDviBIf0rENwdL0nEH0uGom9no0nyB' }]);
        setCurrentModule({ id: 'fake-mod-1', title: 'YouTube Playlist Wrapper', video_url: 'https://youtube.com/playlist?list=PLgUwDviBIf0rENwdL0nEH0uGom9no0nyB' });
        return;
      }
      try {
        const { data: cData } = await api.get(`/courses/${id}`);
        setCourse(cData);
        try {
          const { data: progressData } = await api.get('/progress');
          const courseProgress = progressData?.find(p => p.course_id === id);
          if (courseProgress?.level) setUserLevel(courseProgress.level);
        } catch (e) { }
        try {
          const { data: mData } = await api.get(`/courses/${id}/modules`);
          setModules(mData || []);
          if (mData?.length > 0) setCurrentModule(mData[0]);
        } catch (mErr) {
          setModules([]);
          setCurrentModule(null);
        }
      } catch (err) { console.error('Failed to load course details', err); }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    setSummaryData(null); setQuizData(null); setShowSummary(false); setShowQuiz(false);
    setSelectedAnswers({}); setQuizSubmitted(false); setQuizScore(0);
  }, [currentModule?.id]);

  const handleGenerateSummaryQuiz = async () => {
    if (!currentModule) return;
    setGeneratingAI(true);
    try {
      const content = `Video URL: ${currentModule.video_url}. Module: ${currentModule.title}. Course: ${course.title}. Description: ${course.description}`;
      const { data } = await api.post('/ai/summary-and-quiz', { content, level: userLevel, moduleTitle: currentModule.title, videoUrl: currentModule.video_url });
      setSummaryData(data.summary);
      setQuizData(data.quiz);
      setShowSummary(true);
    } catch (err) { console.error('Failed to generate summary & quiz', err); } finally { setGeneratingAI(false); }
  };

  const handleQuizSelect = (qIdx, answer) => { if (!quizSubmitted) setSelectedAnswers(prev => ({ ...prev, [qIdx]: answer })); };

  const handleQuizSubmit = async () => {
    if (!quizData) return;
    let correct = 0;
    quizData.forEach((q, idx) => { if (selectedAnswers[idx] === q.answer) correct++; });
    const score = Math.round((correct / quizData.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    try {
      if (currentModule?.id && course?.id && currentModule.id !== 'fake-mod-1') {
        await api.post(`/assessments/module/${currentModule.id}/submit`, { score, courseId: course.id });
      }
    } catch (e) { }
  };

  if (!course) return (
    <div className="w-full flex justify-center py-20 grayscale opacity-40">
      <Loader2 className="animate-spin text-black" size={32} />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-fade-in-up pb-20">
      
      {/* Main Content Area */}
      <div className="flex-1 space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">{course.title}</h1>
          <p className="text-gray-400 text-[9px] font-black tracking-[0.3em] uppercase ml-1">Path: Dashboard / Catalog / {course.id.substring(0, 8)}</p>
        </div>
        
        {currentModule ? (
          <div className="space-y-12">
            {/* Video Node */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-5 shadow-card-lg relative group">
              {currentModule.video_url.includes('youtube.com') || currentModule.video_url.includes('youtu.be') ? (
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-gray-100 bg-gray-50">
                  <iframe className="w-full h-full" src={getYoutubeEmbedUrl(currentModule.video_url)} title="Video Node" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
              ) : (
                <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-xl"><VideoPlayer url={currentModule.video_url} title={currentModule.title} /></div>
              )}
            </div>

            {/* Module Context */}
            <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-sm">
              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight text-black uppercase italic">{currentModule.title}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Cognitive Depth:</span>
                  <span className="px-3 py-1 bg-black text-white text-[9px] font-black rounded-lg uppercase tracking-widest">Level {currentModule.difficulty_level || '3'}</span>
                </div>
              </div>
              <button onClick={handleGenerateSummaryQuiz} disabled={generatingAI} className="uiverse-btn !rounded-xl !px-10 !py-4 transition-all">
                {generatingAI ? <div className="flex items-center gap-3"><Loader2 size={16} className="animate-spin" /> <span className="text-[10px] uppercase font-black tracking-widest">Syncing AI...</span></div> : <span className="text-[10px] uppercase font-black tracking-widest uppercase">GENERATE AI INSIGHTS</span>}
              </button>
            </div>

            {/* AI Insights & Assessments */}
            {(showSummary || showQuiz) && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 max-w-sm">
                   <button onClick={() => { setShowSummary(true); setShowQuiz(false); }} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${showSummary ? 'bg-white shadow-sm text-black border border-gray-100' : 'text-gray-400'}`}>Synopsys</button>
                   <button onClick={() => { setShowQuiz(true); setShowSummary(false); }} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${showQuiz ? 'bg-white shadow-sm text-black border border-gray-100' : 'text-gray-400'}`}>Assessment</button>
                </div>

                <Card className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
                  {showSummary && summaryData && (
                    <div className="space-y-6">
                       <h3 className="text-sm font-black text-black uppercase tracking-widest border-l-2 border-black pl-4">Extracted Knowledge</h3>
                       <div className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap font-medium font-sans">{summaryData}</div>
                    </div>
                  )}

                  {showQuiz && quizData && (
                    <div className="py-20 text-center space-y-10">
                      <div className="w-20 h-20 mx-auto rounded-[1.5rem] bg-black flex items-center justify-center text-white shadow-xl shadow-black/10">
                        <BrainCircuit size={40} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">Secure Assessment Ready</h3>
                        <p className="text-gray-400 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                          To maintain academic integrity, this assessment will be conducted in a secure, full-screen environment.
                        </p>
                      </div>
                      <button 
                        onClick={() => window.location.href = `/dashboard/quiz/${currentModule.id}?courseId=${course.id}&topic=${encodeURIComponent(currentModule.title)}`}
                        className="uiverse-btn !px-12 !py-5 !rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase shadow-2xl shadow-black/10"
                      >
                        LAUNCH SECURE QUIZ
                      </button>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Course Navigation Map */}
            {modules.length > 1 && (
              <div className="space-y-8">
                <h3 className="text-sm font-black text-gray-300 uppercase tracking-[0.2em] ml-1">Roadmap Hierarchy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map((m, idx) => (
                    <button key={m.id} onClick={() => setCurrentModule(m)} className={`text-left p-6 rounded-[1.5rem] border transition-all flex items-center justify-between group ${currentModule?.id === m.id ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white border-gray-100 hover:border-black'}`}>
                       <div className="flex items-center gap-5">
                          <span className={`text-[10px] font-black uppercase italic ${currentModule?.id === m.id ? 'text-gray-500' : 'text-gray-200'}`}>M{(idx+1).toString().padStart(2,'0')}</span>
                          <span className="text-sm font-black uppercase tracking-tight leading-none">{m.title}</span>
                       </div>
                       {currentModule?.id === m.id ? <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> : <ChevronRight size={16} className="text-gray-200 group-hover:text-black" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-24 bg-gray-50 border border-gray-100 rounded-[2.5rem] text-center flex flex-col items-center justify-center space-y-8 px-6">
             <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-200"><Shield size={40} /></div>
             <div className="space-y-2 max-w-sm">
                <p className="text-lg font-black uppercase italic tracking-tight">Security Override Required</p>
                <p className="text-gray-400 text-xs font-medium leading-relaxed">Complete the initial node synchronization to unlock full learning roadmap for this domain.</p>
             </div>
             <button onClick={() => window.location.href=`/dashboard/assessment/${course.id}`} className="uiverse-btn !px-10 !py-4 !rounded-xl text-[10px] font-black tracking-widest uppercase">INITIALIZE DIAGNOSTIC</button>
          </div>
        )}
      </div>

      {/* Sidebar: AI Core Interaction */}
      <div className="w-full lg:w-[400px] shrink-0">
        <div className="sticky top-24 space-y-6">
           <div className="flex items-center gap-3 px-1">
              <Sparkles size={16} className="text-gray-300" />
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">NEURAL CO-PILOT</span>
           </div>
           <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-card-lg overflow-hidden h-[70vh]">
              <AiTutor context={currentModule ? currentModule.title : course.title} level={userLevel} topic={currentModule ? currentModule.title : course.title} />
           </div>
        </div>
      </div>
    </div>
  );
}
