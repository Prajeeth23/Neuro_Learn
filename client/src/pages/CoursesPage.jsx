import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, XCircle, BrainCircuit, Sparkles, Loader2, ArrowRight, Play } from 'lucide-react';
import api from '../lib/api';
import { useScreenTime } from '../hooks/useScreenTime';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [userDomain, setUserDomain] = useState('');
  
  const [courseInfoCache, setCourseInfoCache] = useState({});
  const [loadingInfo, setLoadingInfo] = useState({});

  const [showLaunchTest, setShowLaunchTest] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [launchTestData, setLaunchTestData] = useState(null);
  const [launchTestLoading, setLaunchTestLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useScreenTime();

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await api.get('/auth/profile').catch(() => ({ data: {} }));
        const domain = profileRes.data?.domain_of_interest || '';
        setUserDomain(domain);

        const [coursesRes, progressRes] = await Promise.all([
          api.get(domain ? `/courses?domain=${encodeURIComponent(domain)}` : '/courses'),
          api.get('/progress').catch(() => ({ data: [] }))
        ]);
        
        const data = coursesRes.data;
        
        if (progressRes.data?.length > 0) {
          const progressMap = {};
          const now = new Date();
          progressRes.data.forEach(p => { 
            let isValid = true;
            if (p.last_assessment_date) {
              const diffTime = Math.abs(now - new Date(p.last_assessment_date));
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > 14) isValid = false;
            }
            if (isValid) progressMap[p.course_id] = true;
          });
          setEnrolledCourses(progressMap);
        }

        setCourses(data || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fetchCourseInfo = async (course) => {
    if (courseInfoCache[course.id]) return;
    setLoadingInfo(prev => ({ ...prev, [course.id]: true }));
    try {
      const { data } = await api.post('/ai/course-info', {
        courseTitle: course.title,
        courseDescription: course.description
      });
      setCourseInfoCache(prev => ({ ...prev, [course.id]: data }));
    } catch (err) {
      console.error('Failed to get course info:', err);
    } finally {
      setLoadingInfo(prev => ({ ...prev, [course.id]: false }));
    }
  };

  const handleLaunchCourse = async (course) => {
    if (enrolledCourses[course.id]) {
      window.location.href = `/dashboard/courses/${course.id}`;
      return;
    }
    setActiveCourse(course);
    setShowLaunchTest(true);
    setLaunchTestLoading(true);
    setLaunchTestData(null);
    setAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    try {
      const { data } = await api.post('/ai/launch-test', {
        courseTitle: course.title,
        courseDescription: course.description
      });
      setLaunchTestData(data.test);
    } catch (err) {
      window.location.href = `/dashboard/courses/${course.id}`;
    } finally {
      setLaunchTestLoading(false);
    }
  };

  const submitLaunchTest = async () => {
    if (!launchTestData) return;
    let correct = 0;
    launchTestData.forEach((q, idx) => {
      if (answers[idx] === q.answer) correct++;
    });
    const score = Math.round((correct / launchTestData.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    try {
      await api.post(`/assessments/initial/${activeCourse.id}/submit`, { score });
      setEnrolledCourses(prev => ({ ...prev, [activeCourse.id]: true }));
    } catch (err) {
      console.error('Failed to save initial assessment', err);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20 grayscale opacity-50">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up w-full">
      
      {/* Page Header */}
      <div className="mb-14">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black uppercase italic leading-none">
          Course <span className="text-gray-300">Catalog</span>
        </h1>
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mt-4 ml-1">
          {userDomain ? `Adaptive nodes registered for: ${userDomain}` : 'Sync with new learning pathways'}
        </p>
      </div>
      
      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {Array.isArray(courses) && courses.map(course => (
          <Card key={course.id} className="bg-white border border-gray-100 rounded-3xl p-7 flex flex-col group hover:border-black transition-all">
            <CardHeader className="p-0 space-y-4 mb-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-black">
                    {course.category}
                  </span>
                  {course.domain && course.domain !== 'General' && (
                    <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg bg-black text-white">
                      {course.domain}
                    </span>
                  )}
                </div>
                {course.is_playlist && (
                   <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-black/20" title="Video Content">
                      <Play size={14} fill="currentColor" />
                   </div>
                )}
              </div>
              
              <CardTitle className="text-xl font-black uppercase leading-tight italic tracking-tight">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-gray-400 text-xs font-medium leading-relaxed font-sans">
                {course.description}
              </CardDescription>

              {/* AI Details */}
              {courseInfoCache[course.id] ? (
                <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in duration-300">
                  <div>
                    <p className="text-[9px] font-black tracking-widest uppercase text-black mb-2 flex items-center gap-2">
                       <Sparkles size={12} className="text-gray-300" /> Utility Case
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">{courseInfoCache[course.id].whyLearn}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(courseInfoCache[course.id].achievableRoles || []).map((r, i) => (
                      <span key={i} className="text-[9px] px-2 py-1 rounded bg-white border border-gray-200 text-black font-bold uppercase tracking-tight">{r}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <button onClick={() => fetchCourseInfo(course)} disabled={loadingInfo[course.id]}
                  className="text-[10px] font-black tracking-widest uppercase text-gray-300 hover:text-black transition-colors flex items-center gap-2 mt-2">
                  {loadingInfo[course.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {loadingInfo[course.id] ? 'Parsing...' : 'AI Insights'}
                </button>
              )}
            </CardHeader>
            
            <CardFooter className="p-0 mt-auto">
              <button 
                onClick={() => handleLaunchCourse(course)} 
                className="uiverse-btn w-full !rounded-xl !py-3.5 !text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform"
              >
                {enrolledCourses[course.id] ? 'RECALIBRATE SESSION' : 'INITIALIZE NODE'}
                <ArrowRight size={14} />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-32 space-y-6 grayscale opacity-30">
          <BrainCircuit size={64} className="mx-auto text-black" />
          <p className="text-sm font-black uppercase tracking-widest">No spectral nodes found</p>
        </div>
      )}

      {/* Launch Test Modal - B&W */}
      {showLaunchTest && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white border border-gray-200 rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white"><BrainCircuit size={18} /></div>
                  SYNC ASSESSMENT
                </h3>
                <p className="text-gray-400 text-[9px] font-black mt-2 uppercase tracking-[0.3em] ml-1">Path: {activeCourse.title}</p>
              </div>
              <button onClick={() => setShowLaunchTest(false)} className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-gray-50 rounded-full transition-all">
                <XCircle size={22} />
              </button>
            </div>

            <div className="p-8">
              {launchTestLoading ? (
                <div className="text-center py-20 space-y-6">
                  <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin mx-auto"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 animate-pulse">Generating Neural Test Matrix...</p>
                </div>
              ) : launchTestData ? (
                <div className="space-y-10">
                  {quizSubmitted && (
                    <div className="text-center p-8 rounded-3xl border border-black bg-black text-white animate-in zoom-in-95 duration-500">
                      <p className="text-4xl font-black italic mb-2 tracking-tighter">{quizScore}%</p>
                      <p className="text-xs font-medium opacity-60 tracking-tight">
                        {quizScore >= 60 ? 'Threshold achieved. Entry granted.' : "Threshold not met. System will adapt to lower complexity."}
                      </p>
                      <button onClick={() => window.location.href=`/dashboard/courses/${activeCourse.id}`} className="mt-6 px-10 py-3 bg-white text-black text-[10px] font-black tracking-widest uppercase rounded-xl hover:bg-gray-200 transition-colors">PROCEED TO COURSE</button>
                    </div>
                  )}
                  
                  <div className="space-y-8">
                    {launchTestData.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-4">
                        <div className="flex gap-4">
                           <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black shrink-0">#{(qIdx+1).toString().padStart(2, '0')}</div>
                           <p className="font-bold text-black text-sm pt-1">{q.question}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-11">
                          {Object.entries(q.options).map(([key, value]) => {
                            const isSelected = answers[qIdx] === key;
                            const isCorrect = quizSubmitted && key === q.answer;
                            const isWrong = quizSubmitted && isSelected && key !== q.answer;
                            return (
                              <button key={key} onClick={() => !quizSubmitted && setAnswers(prev => ({ ...prev, [qIdx]: key }))} disabled={quizSubmitted}
                                className={`text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                                  isCorrect   ? 'bg-black text-white border-black' :
                                  isWrong     ? 'bg-gray-100 border-black' :
                                  isSelected  ? 'bg-black text-white border-black' :
                                                'bg-white border-gray-100 hover:border-gray-300'
                                }`}>
                                <div className="flex items-center gap-3">
                                   <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-black ${isSelected ? 'bg-white/20' : 'bg-gray-50'}`}>{key}</span>
                                   <span>{value}</span>
                                </div>
                                {isCorrect && <CheckCircle size={14} />}
                                {isWrong && <XCircle size={14} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!quizSubmitted && (
                    <button onClick={submitLaunchTest} disabled={Object.keys(answers).length < launchTestData.length}
                      className="uiverse-btn w-full !py-4 shadow-xl shadow-black/5 disabled:opacity-30">
                      SUBMIT ASSESSMENT ({Object.keys(answers).length}/{launchTestData.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-red-500 py-10 font-bold">Failed to initialize matrix.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
