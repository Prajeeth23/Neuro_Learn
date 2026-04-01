import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, XCircle, BrainCircuit, Sparkles, Loader2, Brain, ArrowRight } from 'lucide-react';
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

  if (loading) return <div className="text-center p-20 text-slate-500 font-medium animate-pulse">Initializing neural curriculum...</div>;

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
    <div className="animate-fade-in w-full mb-20">
      <div className="mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Catalog Alpha</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">
          Academic <span className="text-primary italic">Curriculum</span>
        </h1>
        <p className="text-slate-500 font-medium">
          {userDomain ? `Customized for your domain: ${userDomain}` : 'Explore precision-mapped learning pathways'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(courses) && courses.map(course => (
          <Card key={course.id} className="surface-elevated flex flex-col group h-full hover:border-primary/30 transition-all duration-500">
            <CardHeader className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-lg">
                  {course.category}
                </Badge>
                <div className="flex gap-2">
                  {course.domain && course.domain !== 'General' && (
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded bg-secondary/5 border border-secondary/20 text-secondary">
                      {course.domain}
                    </span>
                  )}
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-slate-500 text-sm leading-relaxed">
                {course.description}
              </CardDescription>

              {/* AI Course Info */}
              {courseInfoCache[course.id] ? (
                <div className="space-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-1">
                      <Sparkles size={10} className="text-primary" /> Strategy
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{courseInfoCache[course.id].whyLearn}"</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">Future Paths</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(courseInfoCache[course.id].achievableRoles || []).map((r, i) => (
                        <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => fetchCourseInfo(course)} disabled={loadingInfo[course.id]}
                  className="text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5 py-2">
                  {loadingInfo[course.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {loadingInfo[course.id] ? 'Analyzing...' : 'Generate AI Insights'}
                </button>
              )}
            </CardHeader>
            <CardFooter className="pt-0 pb-8 px-6">
              <button 
                onClick={() => handleLaunchCourse(course)} 
                className="btn-primary w-full group"
              >
                <span>{enrolledCourses[course.id] ? 'Continue Learning' : 'Begin Synthesis'}</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-32 space-y-4 bg-white rounded-[2rem] border border-dashed border-slate-200">
          <Brain size={48} className="mx-auto text-slate-200" />
          <p className="text-slate-400 font-bold">No curricula found matching your profile</p>
          <button className="btn-secondary text-sm" onClick={() => window.location.href='/dashboard/profile'}>Update Domain Profile</button>
        </div>
      )}

      {/* Launch Test Modal */}
      {showLaunchTest && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-xl z-20 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-xl font-bold text-primary">
                  <Brain size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Cognitive Baseline Exam</h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium uppercase tracking-widest">{activeCourse.title}</p>
                </div>
              </div>
              <button onClick={() => setShowLaunchTest(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-8">
              {launchTestLoading ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-400 animate-pulse text-sm font-medium">Drafting neural questions...</p>
                </div>
              ) : launchTestData ? (
                <div className="space-y-8">
                  {quizSubmitted && (
                    <div className={`text-center p-8 rounded-3xl border-2 ${quizScore >= 60 ? 'bg-green-50 border-green-100 text-green-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1">Your Diagnostic Result</p>
                      <p className="text-5xl font-black mb-4">{quizScore}%</p>
                      <p className="text-sm font-medium mb-6 opacity-80">{quizScore >= 60 ? 'Exemplary. You possess the required baseline for this curriculum.' : "Score is below baseline. We've adjusted the path difficulty for you."}</p>
                      <button onClick={() => window.location.href=`/dashboard/courses/${activeCourse.id}`} className="btn-primary px-10">Proceed to Course</button>
                    </div>
                  )}
                  
                  <div className="space-y-8">
                    {launchTestData.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-5">
                        <p className="font-bold text-slate-800 text-lg flex items-start gap-3">
                          <span className="text-primary mt-1">Q{qIdx + 1}.</span>
                          <span>{q.question}</span>
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(q.options).map(([key, value]) => {
                            const isSelected = answers[qIdx] === key;
                            const isCorrect = quizSubmitted && key === q.answer;
                            const isWrong = quizSubmitted && isSelected && key !== q.answer;
                            return (
                              <button key={key} onClick={() => !quizSubmitted && setAnswers(prev => ({ ...prev, [qIdx]: key }))} disabled={quizSubmitted}
                                className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                                  isCorrect   ? 'bg-green-50 border-green-500 text-green-700 shadow-md' :
                                  isWrong     ? 'bg-red-50 border-red-500 text-red-700' :
                                  isSelected  ? 'bg-primary border-primary text-white shadow-lg' :
                                                'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm text-slate-600'
                                }`}>
                                <span className={`font-bold text-xs shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border-2 transition-colors ${
                                  isSelected ? 'bg-white/20 border-white/40' : 'bg-slate-50 border-slate-100'
                                }`}>{key}</span>
                                <span className="flex-1 font-medium">{value}</span>
                                {isCorrect && <CheckCircle size={20} className="text-green-500 shrink-0" />}
                                {isWrong && <XCircle size={20} className="text-red-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!quizSubmitted && (
                    <button 
                      onClick={submitLaunchTest} 
                      disabled={Object.keys(answers).length < launchTestData.length}
                      className="btn-primary w-full !py-5 shadow-xl shadow-primary/20 disabled:grayscale disabled:opacity-50"
                    >
                      Complete Assessment ({Object.keys(answers).length}/{launchTestData.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-400 p-8">Baseline generation failed. Refreshing neural link...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
