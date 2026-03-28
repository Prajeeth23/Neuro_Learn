import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, XCircle, BrainCircuit, Sparkles, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useScreenTime } from '../hooks/useScreenTime';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [userDomain, setUserDomain] = useState('');
  
  // AI course info
  const [courseInfoCache, setCourseInfoCache] = useState({});
  const [loadingInfo, setLoadingInfo] = useState({});

  // Launch test states
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
        // Fetch user profile to get domain
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

  if (loading) return <div className="text-center p-8 mt-20">Loading courses...</div>;

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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-20">
      <div className="mb-12 space-y-2">
        <h1 className="text-5xl font-black tracking-tighter text-white">
          My <span className="text-accent underline decoration-primary/30 underline-offset-8">Courses</span>
        </h1>
        <p className="text-white/40 font-medium tracking-widest uppercase text-xs">
          {userDomain ? `Courses matching your domain: ${userDomain}` : 'Curated learning paths for you'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(courses) && courses.map(course => (
          <Card key={course.id} className="glass-card-premium neon-border-primary border-white/5 flex flex-col group h-full">
            <CardHeader className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <Badge variant="accent" className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg">
                  {course.category}
                </Badge>
                <div className="flex gap-2">
                  {course.domain && course.domain !== 'General' && (
                    <span className="text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent">
                      {course.domain}
                    </span>
                  )}
                  {course.is_playlist && (
                     <div className="p-1.5 bg-red-500/10 rounded-lg text-red-500" title="YouTube Playlist">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                     </div>
                  )}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-white/50 text-sm leading-relaxed font-medium">
                {course.description}
              </CardDescription>

              {/* AI Course Info */}
              {courseInfoCache[course.id] ? (
                <div className="space-y-3 bg-white/[0.02] rounded-xl p-4 border border-white/5">
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-accent/60 mb-1 flex items-center gap-1">
                      <Sparkles size={10} /> Why Learn This
                    </p>
                    <p className="text-xs text-white/50 leading-relaxed">{courseInfoCache[course.id].whyLearn}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-primary/60 mb-1">Achievable Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {(courseInfoCache[course.id].achievableRoles || []).map((r, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => fetchCourseInfo(course)} disabled={loadingInfo[course.id]}
                  className="text-[10px] font-black tracking-widest uppercase text-accent/50 hover:text-accent transition-colors flex items-center gap-1">
                  {loadingInfo[course.id] ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  {loadingInfo[course.id] ? 'Generating...' : 'AI Course Info'}
                </button>
              )}
            </CardHeader>
            <CardFooter className="pt-0 pb-6 px-6">
              <button 
                onClick={() => handleLaunchCourse(course)} 
                className="uiverse-btn w-full !py-3.5 !text-xs tracking-widest uppercase shadow-lg shadow-primary/10"
              >
                {enrolledCourses[course.id] ? 'Resume Course' : 'Launch Course'}
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <BrainCircuit size={48} className="mx-auto text-white/10" />
          <p className="text-white/40 font-bold">No courses found{userDomain ? ` for ${userDomain}` : ''}</p>
          <p className="text-white/20 text-sm">Try updating your domain in your profile, or search for courses</p>
        </div>
      )}

      {/* Launch Test Modal */}
      {showLaunchTest && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-black/90 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-white/5 sticky top-0 bg-black/90 backdrop-blur-md z-10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <BrainCircuit className="text-primary" />
                  Launch Test: {activeCourse.title}
                </h3>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Complete this assessment to begin</p>
              </div>
              <button onClick={() => setShowLaunchTest(false)} className="p-2 text-white/40 hover:text-white rounded-full bg-white/5">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-8">
              {launchTestLoading ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                  <p className="text-white/50 animate-pulse text-sm">Generating AI Launch Assessment...</p>
                </div>
              ) : launchTestData ? (
                <div className="space-y-8">
                  {quizSubmitted && (
                    <div className={`text-center p-6 rounded-2xl border ${quizScore >= 60 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <p className="text-3xl font-black mb-1">{quizScore}%</p>
                      <p className="text-sm text-white/50">{quizScore >= 60 ? 'Passed! You correspond to the required level.' : "You scored below 60%. But let's get started anyway to improve!"}</p>
                      <button onClick={() => window.location.href=`/dashboard/courses/${activeCourse.id}`} className="uiverse-btn mt-4 px-8">Enter Course</button>
                    </div>
                  )}
                  <div className="space-y-6">
                    {launchTestData.map((q, qIdx) => (
                      <div key={qIdx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                        <p className="font-bold text-white/90 text-sm"><span className="text-primary mr-2">Q{qIdx + 1}.</span>{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(q.options).map(([key, value]) => {
                            const isSelected = answers[qIdx] === key;
                            const isCorrect = quizSubmitted && key === q.answer;
                            const isWrong = quizSubmitted && isSelected && key !== q.answer;
                            return (
                              <button key={key} onClick={() => !quizSubmitted && setAnswers(prev => ({ ...prev, [qIdx]: key }))} disabled={quizSubmitted}
                                className={`text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                                  isCorrect   ? 'bg-green-500/20 border-green-500/50 text-green-300' :
                                  isWrong     ? 'bg-red-500/20 border-red-500/50 text-red-300' :
                                  isSelected  ? 'bg-primary/20 border-primary/50 text-white' :
                                                'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-white/70'
                                }`}>
                                <span className="font-black text-xs shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">{key}</span>
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
                    <button onClick={submitLaunchTest} disabled={Object.keys(answers).length < launchTestData.length}
                      className="uiverse-btn w-full !py-4 shadow-xl shadow-primary/20 disabled:opacity-40">
                      Submit Test ({Object.keys(answers).length}/{launchTestData.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-red-400 p-8">Failed to generate test.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
