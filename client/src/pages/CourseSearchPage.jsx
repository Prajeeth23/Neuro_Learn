import React, { useState, useEffect, useCallback } from 'react';
import { Search, BookOpen, Sparkles, Loader2, BrainCircuit, CheckCircle, XCircle, ArrowRight, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../lib/api';

export default function CourseSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  
  const [courseInfoCache, setCourseInfoCache] = useState({});
  const [loadingInfo, setLoadingInfo] = useState({});

  const [showLaunchTest, setShowLaunchTest] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [launchTestData, setLaunchTestData] = useState(null);
  const [launchTestLoading, setLaunchTestLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    api.get('/progress').then(res => {
      const map = {};
      (res.data || []).forEach(p => { map[p.course_id] = true; });
      setEnrolledCourses(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      if (!query.trim()) { setResults([]); setSearched(false); }
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const { data } = await api.get(`/courses/search?q=${encodeURIComponent(query)}`);
        setResults(data || []);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

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
    launchTestData.forEach((q, idx) => { if (answers[idx] === q.answer) correct++; });
    const score = Math.round((correct / launchTestData.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    try {
      await api.post(`/assessments/initial/${activeCourse.id}/submit`, { score });
      setEnrolledCourses(prev => ({ ...prev, [activeCourse.id]: true }));
    } catch (err) { console.error('Failed to save assessment:', err); }
  };

  return (
    <div className="animate-fade-in-up w-full mb-20 space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter text-black uppercase italic leading-none">
          Course <span className="text-gray-300">Vault</span>
        </h1>
        <p className="text-gray-400 text-[9px] font-black tracking-[0.4em] uppercase ml-1">Universal Search Interface / Adaptive Learning Nodes</p>
      </div>

      {/* Modern High-Contrast Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
          <Search size={22} className="text-gray-200 group-focus-within:text-black transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ENTER DOMAIN VECTOR... (E.G. QUANTUM COMPUTING, NEURAL LINKS)"
          className="w-full pl-16 pr-8 py-7 bg-white border border-gray-100 rounded-[2.5rem] text-sm font-black tracking-widest text-black placeholder:text-gray-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all shadow-card-lg uppercase"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-8 flex items-center">
            <Loader2 size={22} className="text-black animate-spin" />
          </div>
        )}
      </div>

      {/* Results Matrix */}
      {searched && !loading && results.length === 0 && (
        <div className="py-32 border border-dashed border-gray-100 rounded-[3rem] text-center space-y-6">
          <div className="w-16 h-16 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-gray-200">
             <Search size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-black uppercase italic tracking-tighter">Null Result Architecture</p>
            <p className="text-gray-300 text-[10px] font-black tracking-widest uppercase">No indexing for "{query}" detected.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(results) && results.map(course => (
          <Card key={course.id} className="bg-white border border-gray-100 rounded-[2.5rem] flex flex-col group h-full shadow-sm hover:shadow-card-lg transition-all duration-500 overflow-hidden">
            <CardHeader className="p-8 pb-4 flex-1 space-y-6">
              <div className="flex justify-between items-start">
                <Badge className="bg-gray-50 text-gray-400 border border-gray-100 px-3 py-1.5 text-[9px] font-black tracking-widest uppercase rounded-lg group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
                  {course.category}
                </Badge>
                {course.domain && course.domain !== 'General' && (
                  <span className="text-[9px] font-black tracking-widest uppercase text-gray-200">
                    // {course.domain}
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl font-black italic tracking-tighter text-black uppercase leading-none group-hover:opacity-60 transition-opacity italic">{course.title}</CardTitle>
              <CardDescription className="line-clamp-3 text-gray-400 text-xs font-medium leading-relaxed">
                {course.description}
              </CardDescription>

              {/* AI Diagnostic Layer */}
              <div className="mt-auto pt-6 border-t border-gray-50 space-y-4">
                 {courseInfoCache[course.id] ? (
                   <div className="space-y-4 animate-in fade-in duration-500">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-black mb-2 flex items-center gap-2">
                          <Sparkles size={10} /> Rationale
                        </p>
                        <p className="text-[11px] text-gray-400 font-bold leading-relaxed">{courseInfoCache[course.id].whyLearn}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(courseInfoCache[course.id].achievableRoles || []).map((r, i) => (
                          <span key={i} className="text-[8px] px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-gray-400 font-black tracking-widest uppercase">{r}</span>
                        ))}
                      </div>
                   </div>
                 ) : (
                   <button
                     onClick={() => fetchCourseInfo(course)}
                     disabled={loadingInfo[course.id]}
                     className="w-full py-4 rounded-xl border border-gray-50 bg-gray-50/50 text-[9px] font-black tracking-widest uppercase text-gray-300 hover:text-black hover:border-black transition-all flex items-center justify-center gap-3"
                   >
                     {loadingInfo[course.id] ? <Loader2 size={12} className="animate-spin text-black" /> : <BrainCircuit size={12} />}
                     {loadingInfo[course.id] ? 'ANALYZING...' : 'INITIALIZE AI INSIGHT'}
                   </button>
                 )}
              </div>
            </CardHeader>
            <CardFooter className="p-8 pt-0">
              <button
                onClick={() => handleLaunchCourse(course)}
                className={`w-full py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-lg active:scale-95 ${
                  enrolledCourses[course.id] 
                    ? 'bg-white text-black border border-gray-100 hover:bg-black hover:text-white' 
                    : 'bg-black text-white hover:bg-gray-900 shadow-black/5'
                }`}
              >
                {enrolledCourses[course.id] ? 'RE-SYNC PROTOCOL' : 'INITIALIZE MODULE'}
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Global High-Contrast Modal */}
      {showLaunchTest && activeCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white border border-gray-100 rounded-[3rem] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-white">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-black uppercase italic tracking-tighter">
                  Launch Phase: <span className="text-gray-300">{activeCourse.title}</span>
                </h3>
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Initial Calibration Assessment</p>
              </div>
              <button onClick={() => setShowLaunchTest(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:text-black hover:bg-gray-100 transition-all">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {launchTestLoading ? (
                <div className="py-24 flex flex-col items-center gap-6 opacity-40">
                  <div className="w-12 h-12 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em]">Synthesizing diagnostic probes...</p>
                </div>
              ) : launchTestData ? (
                <div className="space-y-12">
                  {quizSubmitted && (
                    <div className="p-10 rounded-[2rem] bg-black text-white text-center space-y-6 shadow-xl shadow-black/10 animate-in zoom-in duration-500">
                      <div className="text-5xl font-black italic">{quizScore}%</div>
                      <p className="text-[10px] font-black tracking-widest uppercase opacity-40">CALIBRATION ACCURACY ACHIEVED</p>
                      <button onClick={() => window.location.href = `/dashboard/courses/${activeCourse.id}`} className="uiverse-btn !rounded-xl !px-12 !py-4 w-full">PROCEED TO MODULE</button>
                    </div>
                  )}
                  <div className="space-y-10">
                    {launchTestData.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-6">
                        <p className="text-sm font-black text-black uppercase italic leading-tight"><span className="text-gray-200 mr-4 italic not-uppercase text-xs font-medium">#{qIdx + 1}</span>{q.question}</p>
                        <div className="grid grid-cols-1 gap-3 ml-6">
                          {Object.entries(q.options).map(([key, value]) => {
                            const isSelected = answers[qIdx] === key;
                            const isCorrect = quizSubmitted && key === q.answer;
                            const isWrong = quizSubmitted && isSelected && key !== q.answer;
                            return (
                              <button key={key} onClick={() => !quizSubmitted && setAnswers(p => ({ ...p, [qIdx]: key }))} disabled={quizSubmitted}
                                className={`text-left p-4 rounded-xl border text-[11px] font-black uppercase tracking-tight transition-all flex items-center justify-between ${
                                  isCorrect ? 'bg-black text-white border-black' :
                                  isWrong ? 'bg-gray-100 border-gray-200 text-gray-400' :
                                  isSelected ? 'bg-black text-white border-black' :
                                  'bg-gray-50 border-gray-100 hover:border-gray-300 text-gray-500'
                                }`}>
                                <span><span className="opacity-30 mr-4">{key}</span> {value}</span>
                                {(isCorrect || isWrong) && (isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Protocol Generation Failed.</p></div>
              )}
            </div>

            {!quizSubmitted && launchTestData && !launchTestLoading && (
               <div className="p-10 border-t border-gray-50 bg-white">
                  <button onClick={submitLaunchTest} disabled={Object.keys(answers).length < launchTestData.length}
                    className="uiverse-btn w-full !py-5 !rounded-2xl shadow-xl shadow-black/5 active:scale-95 disabled:opacity-20 uppercase font-black tracking-widest text-[11px]">
                    VERIFY CALIBRATION ({Object.keys(answers).length}/{launchTestData.length})
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
