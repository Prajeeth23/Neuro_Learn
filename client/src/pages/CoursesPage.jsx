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
  const [filterDomain, setFilterDomain] = useState('All');
  
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
          api.get('/courses'),
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
      
      {/* Page Header — Centered Blue, Professional */}
      <div className="mb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 rounded-full mb-5 shadow-lg shadow-indigo-200">
          <BrainCircuit size={13} className="text-white" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-white">
            All Available Courses
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-4" style={{fontFamily:'Inter,sans-serif'}}>
          <span className="text-[#191C1E]">Course </span><span className="text-[#4F46E5]">Catalog</span>
        </h1>
        <div className="w-20 h-1 rounded-full bg-indigo-500 mb-4" />
        <p className="text-[#777587] text-sm font-medium max-w-md">Explore curated learning pathways powered by AI</p>
      </div>
      
      {/* Filter Options */}
      {courses.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {['All', ...new Set(courses.map(c => c.domain).filter(Boolean))].map(domain => (
            <button
              key={domain}
              onClick={() => setFilterDomain(domain)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 ${
                filterDomain === domain 
                  ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-200 border border-transparent' 
                  : 'bg-white text-[#777587] hover:bg-indigo-50 hover:text-indigo-600 border border-[#ECEEF0]'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      )}
      
      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {Array.isArray(courses) && courses.filter(c => filterDomain === 'All' || c.domain === filterDomain).map(course => (
          <Card key={course.id} className="bg-white border border-[#ECEEF0] rounded-3xl p-7 flex flex-col group hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300">
            <CardHeader className="p-0 space-y-4 mb-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                    {course.category}
                  </span>
                  {course.domain && course.domain !== 'General' && (
                    <span className="text-[9px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-lg bg-[#4F46E5] text-white">
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
              
              <CardTitle className="text-xl font-bold leading-tight tracking-tight text-[#191C1E]">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-[#777587] text-xs font-medium leading-relaxed">
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
                className="w-full bg-[#4F46E5] hover:bg-[#3525CD] text-white rounded-xl py-3.5 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-indigo-100"
              >
                {enrolledCourses[course.id] ? 'Continue Learning' : 'Start Course'}
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

      {/* Launch Test Modal — Full Screen Premium Theme */}
      {showLaunchTest && activeCourse && (
        <div className="fixed inset-0 z-50 bg-[#0f0f1a] overflow-y-auto flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="px-4 py-6 md:px-8 border-b border-indigo-900/40 sticky top-0 bg-[#0f0f1a]/95 backdrop-blur-xl z-20 shadow-lg shadow-black/30"
            style={{ background: 'linear-gradient(135deg, rgba(15,15,26,0.98) 0%, rgba(26,16,64,0.95) 100%)' }}>
            <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">SYNC ASSESSMENT</h3>
                  <p className="text-indigo-400 text-[10px] md:text-xs font-bold mt-1 uppercase tracking-widest">{activeCourse.title}</p>
                </div>
              </div>
              <button onClick={() => setShowLaunchTest(false)}
                className="w-10 h-10 flex items-center justify-center text-indigo-400 border border-indigo-900/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 rounded-xl transition-all">
                <XCircle size={20} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 w-full max-w-4xl mx-auto p-4 py-10 md:p-8">
              {launchTestLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="w-14 h-14 rounded-full border-2 border-indigo-800 border-t-indigo-400 animate-spin" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-400 animate-pulse">Generating Neural Test Matrix...</p>
                </div>
              ) : launchTestData ? (
                <div className="space-y-8">

                  {/* Score Result Card */}
                  {quizSubmitted && (
                    <div className="text-center p-8 rounded-2xl border border-indigo-700 bg-indigo-950/80 animate-in zoom-in-95 duration-500">
                      <div className="text-6xl font-black text-white mb-2 tracking-tighter">{quizScore}%</div>
                      <p className="text-indigo-300 text-sm font-medium">
                        {quizScore >= 60 ? '✅ Threshold achieved. Entry granted.' : '⚠️ Threshold not met. System will adapt to lower complexity.'}
                      </p>
                      <button
                        onClick={() => window.location.href = `/dashboard/courses/${activeCourse.id}`}
                        className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-colors shadow-lg shadow-indigo-900/50">
                        PROCEED TO COURSE →
                      </button>
                    </div>
                  )}

                  {/* Questions */}
                  <div className="space-y-8">
                    {launchTestData.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-4">
                        <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-xl bg-indigo-900 border border-indigo-700 flex items-center justify-center text-[10px] font-black text-indigo-300 shrink-0 mt-0.5">
                            {(qIdx + 1).toString().padStart(2, '0')}
                          </div>
                          <p className="font-semibold text-white text-sm leading-relaxed">{q.question}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-12">
                          {Object.entries(q.options).map(([key, value]) => {
                            const isSelected = answers[qIdx] === key;
                            const isCorrect = quizSubmitted && key === q.answer;
                            const isWrong = quizSubmitted && isSelected && key !== q.answer;
                            return (
                              <button key={key}
                                onClick={() => !quizSubmitted && setAnswers(prev => ({ ...prev, [qIdx]: key }))}
                                disabled={quizSubmitted}
                                className={`text-left p-4 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center gap-3 ${
                                  isCorrect  ? 'bg-green-900/60 border-green-500 text-green-200' :
                                  isWrong    ? 'bg-red-900/40 border-red-600 text-red-300' :
                                  isSelected ? 'bg-indigo-700 border-indigo-500 text-white shadow-lg shadow-indigo-900/50' :
                                               'bg-white/5 border-indigo-900/50 text-indigo-200 hover:bg-indigo-900/40 hover:border-indigo-600'
                                }`}>
                                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black shrink-0 ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-indigo-900 text-indigo-300'
                                }`}>{key}</span>
                                <span className="leading-snug">{value}</span>
                                {isCorrect && <CheckCircle size={14} className="ml-auto shrink-0 text-green-400" />}
                                {isWrong   && <XCircle    size={14} className="ml-auto shrink-0 text-red-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  {!quizSubmitted && (
                    <button
                      onClick={submitLaunchTest}
                      disabled={Object.keys(answers).length < launchTestData.length}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold tracking-widest uppercase rounded-2xl transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3">
                      <BrainCircuit size={16} />
                      SUBMIT ASSESSMENT ({Object.keys(answers).length}/{launchTestData.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-red-400 font-semibold text-sm">
                  Failed to initialize assessment matrix. Please try again.
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
