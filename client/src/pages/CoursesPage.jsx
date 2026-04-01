import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import {
  CheckCircle, XCircle, BrainCircuit, Sparkles, Loader2, ArrowRight, Play,
  Maximize, ShieldAlert, Map, Star, Layers, ChevronRight, Compass, BookOpen,
  Target, ArrowLeft, User, GraduationCap, Zap
} from 'lucide-react';
import api from '../lib/api';
import { useScreenTime } from '../hooks/useScreenTime';
import { useSecureMode } from '../hooks/useSecureMode';

const DOMAINS = ['AI & Machine Learning', 'Web Development', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'Mobile Development', 'Game Development', 'DevOps'];
const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Business', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate'];

// ─── Onboarding Modal ───────────────────────────────────────────────────────
function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', department: '', year: '', domain_of_interest: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const step1Valid = form.name.trim() && form.year;
  const step2Valid = form.department && form.domain_of_interest;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('/auth/profile', form);
      localStorage.setItem('neurolearn_onboarding_done', '1');
      onComplete(form);
    } catch (e) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-violet-950/80 backdrop-blur-md flex justify-center items-start md:items-center p-4 overflow-y-auto py-12">
      <div className="relative w-full max-w-lg animate-fade-in-up my-auto">
        {/* Glow */}
        <div className="absolute -inset-4 bg-violet-500/20 rounded-[3rem] blur-3xl pointer-events-none" />

        <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-violet-900/20">
          {/* Top gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-400 via-fuchsia-500 to-violet-600" />

          {/* Step indicator */}
          <div className="px-10 pt-8 pb-0 flex items-center gap-3">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-violet-500' : 'bg-slate-100'}`} />
            ))}
          </div>

          <div className="px-10 pt-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${step === 1 ? 'bg-violet-100 text-violet-600' : 'bg-fuchsia-100 text-fuchsia-600'}`}>
                {step === 1 ? <User size={26} /> : <Compass size={26} />}
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-violet-400 mb-1">
                  Step {step} of 2
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {step === 1 ? 'Who are you? (v2)' : 'What drives you?'}
                </h2>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Your Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" />
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full pl-11 pr-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold text-slate-800 focus:border-violet-400 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Academic Year</label>
                  <div className="grid grid-cols-3 gap-2">
                    {YEARS.map(y => (
                      <button
                        key={y}
                        onClick={() => setForm(f => ({ ...f, year: y }))}
                        className={`py-3 rounded-xl text-[10px] font-black tracking-wider uppercase border-2 transition-all ${form.year === y ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-violet-200 hover:bg-violet-50'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  disabled={!step1Valid}
                  onClick={() => setStep(2)}
                  className="w-full mt-4 py-4 rounded-xl font-black text-xs tracking-widest uppercase bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-xl shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Department</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DEPARTMENTS.map(d => (
                      <button
                        key={d}
                        onClick={() => setForm(f => ({ ...f, department: d }))}
                        className={`py-3 px-4 rounded-xl text-[10px] font-black tracking-wide uppercase border-2 transition-all text-left truncate ${form.department === d ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-400' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-violet-200 hover:bg-violet-50'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
                    <Zap size={10} className="text-violet-500" /> Core Interest Domain
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DOMAINS.map(d => (
                      <button
                        key={d}
                        onClick={() => setForm(f => ({ ...f, domain_of_interest: d }))}
                        className={`py-3 px-4 rounded-xl text-[10px] font-black tracking-wide uppercase border-2 transition-all text-left truncate ${form.domain_of_interest === d ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-violet-200 hover:bg-violet-50'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}

                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-bold text-xs tracking-widest uppercase border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    disabled={!step2Valid || saving}
                    onClick={handleSave}
                    className="flex-[2] py-4 rounded-xl font-black text-xs tracking-widest uppercase bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-xl shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {saving ? 'Saving...' : 'Launch My Learning'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skip */}
        <p className="text-center mt-5 text-violet-300/60 text-xs font-semibold cursor-pointer hover:text-violet-200 transition-colors"
          onClick={() => { localStorage.setItem('neurolearn_onboarding_done', '1'); onComplete(null); }}>
          Skip for now →
        </p>
      </div>
    </div>
  );
}

// ─── Career Vector Tab ──────────────────────────────────────────────────────
function CareerVectorTab({ domain, onOpenOnboarding }) {
  const [careerRoles, setCareerRoles] = useState(null);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [desiredRole, setDesiredRole] = useState('');
  const [showRoleInput, setShowRoleInput] = useState(false);

  const fetchCareerRoles = async () => {
    if (!domain) return;
    setRolesLoading(true);
    setRoadmap(null);
    setSelectedRole(null);
    try {
      const { data } = await api.post('/ai/career-roles', { domain });
      setCareerRoles(data.roles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchRoadmap = async (role) => {
    setSelectedRole(role);
    setRoadmapLoading(true);
    try {
      const { data } = await api.post('/ai/roadmap', { domain, role: role.title || role });
      setRoadmap(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const fetchCustomRoadmap = async () => {
    if (!desiredRole.trim()) return;
    await fetchRoadmap({ title: desiredRole.trim() });
    setShowRoleInput(false);
  };

  if (!domain) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center text-violet-500 mb-8">
          <Compass size={44} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3">No Domain Set</h3>
        <p className="text-slate-400 text-sm font-medium max-w-sm mb-8 leading-relaxed">
          Set your domain of interest to unlock AI-powered career vectors and growth roadmaps tailored to you.
        </p>
        <button
          onClick={onOpenOnboarding}
          className="px-8 py-4 rounded-xl font-black text-xs tracking-widest uppercase bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/20 hover:from-violet-700 hover:to-fuchsia-700 transition-all"
        >
          Set My Interests
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Career Vectors</h2>
          <p className="text-[11px] font-black tracking-[0.3em] uppercase text-violet-500">
            Predictive Nodes For {domain}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowRoleInput(v => !v)}
            className="px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase border-2 border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all flex items-center gap-2"
          >
            <Target size={14} />
            Custom Role Roadmap
          </button>
          <button
            onClick={fetchCareerRoles}
            disabled={rolesLoading}
            className="px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {rolesLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {rolesLoading ? 'Analyzing...' : 'Map New Vectors'}
          </button>
        </div>
      </div>

      {/* Custom Role Input */}
      {showRoleInput && (
        <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-6 flex gap-4 items-center animate-fade-in-up">
          <div className="flex-1 relative">
            <Target size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" />
            <input
              value={desiredRole}
              onChange={e => setDesiredRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchCustomRoadmap()}
              placeholder="e.g. AI Engineer, Fullstack Dev, Data Analyst..."
              className="w-full pl-11 pr-5 py-4 rounded-xl border-2 border-violet-200 bg-white text-sm font-semibold text-slate-800 focus:border-violet-500 focus:outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <button
            onClick={fetchCustomRoadmap}
            disabled={!desiredRole.trim() || roadmapLoading}
            className="px-6 py-4 rounded-xl font-black text-[10px] tracking-widest uppercase bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {roadmapLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            Generate
          </button>
        </div>
      )}

      {/* AI Role Cards */}
      {!careerRoles && !rolesLoading && (
        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-violet-100 flex items-center justify-center text-violet-500 mx-auto mb-5 shadow-md shadow-violet-100">
            <Sparkles size={28} />
          </div>
          <p className="text-slate-600 font-semibold text-sm mb-2">Ready to explore your career path?</p>
          <p className="text-slate-400 text-xs font-medium">Click <strong className="text-violet-600">Map New Vectors</strong> to get AI-generated career roles for your domain.</p>
        </div>
      )}

      {rolesLoading && (
        <div className="flex flex-col items-center gap-6 py-20">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={22} className="text-violet-400 animate-pulse" />
            </div>
          </div>
          <p className="text-[11px] font-black tracking-[0.3em] uppercase text-violet-400 animate-pulse">Analyzing domain vectors...</p>
        </div>
      )}

      {careerRoles && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {careerRoles.map((role, i) => {
            const isSelected = selectedRole?.title === role.title;
            return (
              <button
                key={i}
                onClick={() => fetchRoadmap(role)}
                className={`text-left p-7 rounded-2xl border-2 transition-all relative overflow-hidden group ${isSelected
                  ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 border-transparent shadow-xl shadow-violet-500/25 text-white'
                  : 'bg-white border-slate-100 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-50'
                  }`}
              >
                <div className="absolute -bottom-3 -right-3 opacity-10 scale-150 transition-opacity group-hover:opacity-20">
                  <Layers size={60} />
                </div>
                <div className="relative z-10 space-y-3">
                  <h4 className={`text-sm font-black uppercase tracking-tight leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {role.title}
                  </h4>
                  <p className={`text-[10px] font-medium leading-relaxed line-clamp-3 ${isSelected ? 'text-violet-200' : 'text-slate-400'}`}>
                    {role.description}
                  </p>
                  {role.avgSalary && (
                    <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${isSelected ? 'bg-white/20 text-white' : 'bg-violet-50 text-violet-600 border border-violet-100'}`}>
                      {role.avgSalary}
                    </span>
                  )}
                </div>
                <div className={`mt-5 flex items-center text-[10px] font-black tracking-widest uppercase gap-1.5 ${isSelected ? 'text-violet-200' : 'text-violet-400 group-hover:text-violet-600'}`}>
                  View Roadmap <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Roadmap Loading */}
      {roadmapLoading && (
        <div className="flex flex-col items-center gap-6 py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-fuchsia-500 rounded-full animate-spin" />
          </div>
          <p className="text-[11px] font-black tracking-[0.3em] uppercase text-violet-400 animate-pulse">
            Synthesizing growth roadmap for {selectedRole?.title}...
          </p>
        </div>
      )}

      {/* Roadmap */}
      {roadmap && !roadmapLoading && (
        <div className="bg-white border border-violet-100 rounded-[2rem] p-10 shadow-xl shadow-violet-900/5 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-50 rounded-full blur-[100px] -mr-40 -mt-40 opacity-60 z-0" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-50 rounded-full blur-[100px] -ml-40 -mb-40 opacity-60 z-0" />

          <div className="relative z-10 space-y-10">
            {/* Roadmap header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-violet-50">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-10 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
                  <h3 className="text-3xl font-black tracking-tight text-slate-900">{roadmap.title}</h3>
                </div>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-violet-400 ml-5">
                  Estimated Duration: {roadmap.estimatedDuration}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-5 py-3">
                <GraduationCap size={18} className="text-violet-600" />
                <div>
                  <p className="text-[9px] font-black tracking-widest uppercase text-violet-400">Target Role</p>
                  <p className="text-xs font-black text-violet-800">{selectedRole?.title || desiredRole}</p>
                </div>
              </div>
            </div>

            {/* Phases */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-fuchsia-200 to-transparent z-0" />
              <div className="space-y-6 pl-12">
                {(roadmap.phases || []).map((phase, i) => (
                  <div key={i} className="relative group">
                    <div className={`absolute -left-[2.85rem] top-5 w-5 h-5 rounded-full border-2 z-10 flex items-center justify-center text-[8px] font-black ${i === 0 ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-violet-300 text-violet-500'
                      }`}>
                      {phase.phase || i + 1}
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-7 hover:border-violet-200 hover:bg-violet-50/30 transition-all group-hover:shadow-md group-hover:shadow-violet-100">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-base font-black text-slate-800 mb-1">{phase.title}</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                            Phase {phase.phase || i + 1} · {phase.duration}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          {(phase.skills || []).map((s, j) => (
                            <span key={j} className="text-[9px] px-3 py-1 rounded-lg bg-violet-100 text-violet-700 font-black uppercase tracking-widest">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{phase.description}</p>
                      {(phase.tools || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                          {phase.tools.map((t, j) => (
                            <span key={j} className="text-[9px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-400 font-black uppercase tracking-widest">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {roadmap.tips?.length > 0 && (
              <div className="pt-8 border-t border-violet-50">
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-violet-400 text-center mb-6">Practical Guidelines</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {roadmap.tips.map((tip, i) => (
                    <div key={i} className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-5 flex gap-4">
                      <Star size={14} className="text-violet-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main CoursesPage ───────────────────────────────────────────────────────
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [userDomain, setUserDomain] = useState('');
  const [filterDomain, setFilterDomain] = useState('All');
  const [activeTab, setActiveTab] = useState('catalog');

  const [courseInfoCache, setCourseInfoCache] = useState({});
  const [loadingInfo, setLoadingInfo] = useState({});

  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('beginner');

  const [showSyncAssessment, setShowSyncAssessment] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const [showOnboarding, setShowOnboarding] = useState(false);

  const { isFullscreen, showWarning, enterFullscreen, exitFullscreen } = useSecureMode(showSyncAssessment && !quizSubmitted);

  useEffect(() => {
    if (showLevelSelector || showSyncAssessment || showOnboarding) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showLevelSelector, showSyncAssessment, showOnboarding]);

  useScreenTime();

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await api.get('/auth/profile').catch(() => ({ data: {} }));
        const domain = profileRes.data?.domain_of_interest || '';
        setUserDomain(domain);

        // Show onboarding if no domain set and hasn't been shown yet
        if (!domain && !localStorage.getItem('neurolearn_onboarding_done')) {
          setShowOnboarding(true);
        }

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
              const diffDays = Math.ceil(Math.abs(now - new Date(p.last_assessment_date)) / 86400000);
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

  const handleOnboardingComplete = (savedForm) => {
    setShowOnboarding(false);
    if (savedForm?.domain_of_interest) setUserDomain(savedForm.domain_of_interest);
  };

  const fetchCourseInfo = async (course) => {
    if (courseInfoCache[course.id]) return;
    setLoadingInfo(prev => ({ ...prev, [course.id]: true }));
    try {
      const { data } = await api.post('/ai/course-info', { courseTitle: course.title, courseDescription: course.description });
      setCourseInfoCache(prev => ({ ...prev, [course.id]: data }));
    } catch (err) {
      console.error('Failed to get course info:', err);
    } finally {
      setLoadingInfo(prev => ({ ...prev, [course.id]: false }));
    }
  };

  const handleLaunchCourse = (course) => {
    if (enrolledCourses[course.id]) { window.location.href = `/dashboard/courses/${course.id}`; return; }
    setActiveCourse(course);
    setSelectedLevel('beginner');
    setShowLevelSelector(true);
  };

  const handleLevelConfirm = async () => {
    if (selectedLevel === 'beginner') {
      try {
        await api.post(`/assessments/level-test/${activeCourse.id}/submit`, { score: 100, targetLevel: 'beginner' });
        setEnrolledCourses(prev => ({ ...prev, [activeCourse.id]: true }));
        window.location.href = `/dashboard/courses/${activeCourse.id}`;
      } catch (err) { console.error(err); }
    } else {
      setShowLevelSelector(false);
      setShowSyncAssessment(true);
      setAssessmentLoading(true);
      setAssessmentData(null);
      setAnswers({});
      setQuizSubmitted(false);
      setQuizResult(null);
      enterFullscreen();
      try {
        const { data } = await api.post('/ai/level-test', {
          courseTitle: activeCourse.title,
          targetLevel: selectedLevel === 'intermediate' ? 'medium' : 'advanced'
        });
        setAssessmentData(data.test);
      } catch (err) {
        window.location.href = `/dashboard/courses/${activeCourse.id}`;
      } finally {
        setAssessmentLoading(false);
      }
    }
  };

  const submitSyncAssessment = async () => {
    if (!assessmentData) return;
    let correct = 0;
    assessmentData.forEach((q, idx) => { if (answers[idx] === q.answer) correct++; });
    const score = Math.round((correct / assessmentData.length) * 100);
    setQuizSubmitted(true);
    exitFullscreen();
    document.body.style.overflow = '';
    try {
      const res = await api.post(`/assessments/level-test/${activeCourse.id}/submit`, {
        score,
        targetLevel: selectedLevel === 'intermediate' ? 'medium' : 'advanced'
      });
      setQuizResult({
        score,
        passed: res.data.passed,
        message: res.data.message
      });
      setEnrolledCourses(prev => ({ ...prev, [activeCourse.id]: true }));
    } catch (err) { console.error('Failed to submit level test', err); }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 gap-5">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
        <p className="text-[11px] font-black tracking-[0.3em] uppercase text-violet-400 animate-pulse">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up w-full">
      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Page Header */}
      <div className="mb-12 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 rounded-full mb-5 shadow-lg shadow-indigo-200">
          <BrainCircuit size={13} className="text-white" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-white">
            {activeTab === 'catalog' ? 'All Available Courses' : 'AI Career Intelligence'}
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-4" style={{ fontFamily: 'Inter,sans-serif' }}>
          {activeTab === 'catalog'
            ? <><span className="text-[#191C1E]">Course </span><span className="text-[#4F46E5]">Catalog</span></>
            : <><span className="text-[#191C1E]">Career </span><span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Vector</span></>
          }
        </h1>
        <div className="w-20 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 mb-4" />
        <p className="text-[#777587] text-sm font-medium max-w-md">
          {activeTab === 'catalog' ? 'Explore curated learning pathways powered by AI' : 'Discover AI-powered career roadmaps tailored to your domain'}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-center mb-12">
        <div className="inline-flex bg-slate-100 rounded-2xl p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${activeTab === 'catalog'
              ? 'bg-white text-[#191C1E] shadow-md shadow-slate-200'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <BookOpen size={14} />
            Course Catalog
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${activeTab === 'career'
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-400 hover:text-violet-500'
              }`}
          >
            <Compass size={14} />
            Career Vector
            <span className="bg-violet-100 text-violet-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">AI</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'catalog' && (
        <>
          {courses.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              {['All', ...new Set(courses.map(c => c.domain).filter(Boolean))].map(domain => (
                <button
                  key={domain}
                  onClick={() => setFilterDomain(domain)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 ${filterDomain === domain
                    ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-200 border border-transparent'
                    : 'bg-white text-[#777587] hover:bg-indigo-50 hover:text-indigo-600 border border-[#ECEEF0]'
                    }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          )}

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
            <div className="text-center py-32 space-y-6 opacity-30">
              <BrainCircuit size={64} className="mx-auto text-black" />
              <p className="text-sm font-black uppercase tracking-widest">No courses found</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'career' && (
        <CareerVectorTab domain={userDomain} onOpenOnboarding={() => setShowOnboarding(true)} />
      )}

      {/* Level Selector Modal */}
      {showLevelSelector && activeCourse && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0f0f1a]/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#12121a] border border-violet-900/50 rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl shadow-violet-900/40 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="p-10">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white mb-8 shadow-xl shadow-violet-900/20">
                <Target size={28} />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-3 text-white">Select Expertise Level</h2>
              <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
                Choose your starting level for <strong className="text-violet-400">{activeCourse.title}</strong>. Intermediate and Master levels require a brief Sync Assessment to verify your expertise.
              </p>

              <div className="space-y-4">
                {[
                  { id: 'beginner', name: 'Beginner', desc: 'Start from basics. No assessment required.', icon: <CheckCircle size={20} /> },
                  { id: 'intermediate', name: 'Intermediate', desc: 'Skip fundamentals. Adaptive quiz required.', icon: <BrainCircuit size={20} /> },
                  { id: 'master', name: 'Master', desc: 'Advanced topics only. Strict assessment required.', icon: <Zap size={20} /> }
                ].map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`w-full flex items-center gap-6 p-6 border rounded-[1.5rem] text-left transition-all duration-300 ${selectedLevel === lvl.id
                      ? 'border-violet-500 bg-violet-600/10 shadow-lg shadow-violet-900/20 text-white'
                      : 'border-violet-900/30 bg-[#1a1a2e] hover:border-violet-600/50 hover:bg-[#1f1f3a] text-slate-400'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedLevel === lvl.id ? 'bg-violet-600 text-white' : 'bg-[#0f0f1a] text-slate-500'}`}>
                      {lvl.icon}
                    </div>
                    <div>
                      <h3 className={`text-base font-black ${selectedLevel === lvl.id ? 'text-white' : 'text-slate-200'}`}>{lvl.name}</h3>
                      <p className="text-xs font-medium opacity-60 leading-tight">{lvl.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => { setShowLevelSelector(false); }}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLevelConfirm}
                  className="flex-[2] py-5 rounded-[1.25rem] font-black text-xs tracking-[0.2em] uppercase text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 bg-violet-600 shadow-violet-900/40"
                >
                  {selectedLevel === 'beginner' ? 'Enroll Now' : 'Start Assessment'} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sync Assessment Modal */}
      {showSyncAssessment && activeCourse && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0b0a1a] overflow-y-auto flex flex-col animate-in slide-in-from-bottom-8 duration-500">
          {(showWarning || !isFullscreen) && !quizSubmitted && (
            <div className="fixed inset-0 z-[10000] bg-[#0b0a1a]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-8 animate-fade-in-up">
              <div className="w-24 h-24 bg-violet-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-violet-900 animate-pulse">
                <ShieldAlert size={40} />
              </div>
              <div className="text-center space-y-4 max-w-md px-6">
                <p className="text-3xl font-black tracking-tighter uppercase italic text-white">Secure Mode Active</p>
                <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                  Assessments must be completed in full-screen. Returning you to secure mode automatically...
                </p>
              </div>
              <button
                onClick={enterFullscreen}
                className="px-10 py-5 rounded-2xl text-[10px] font-black tracking-[0.25em] uppercase mt-4 text-white flex items-center gap-3 shadow-xl transition-transform hover:scale-105 active:scale-95 bg-violet-600"
              >
                <Maximize size={18} /> RESUME FULLSCREEN NOW
              </button>
            </div>
          )}

          <div className="px-6 py-6 md:px-12 border-b border-violet-900/20 sticky top-0 bg-[#12121a]/80 backdrop-blur-xl z-20 shadow-sm">
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-900/20">
                  <BrainCircuit size={28} />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">SYNC ASSESSMENT</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-violet-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">{activeCourse.title}</p>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Level: {selectedLevel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-5xl mx-auto p-6 py-12 md:p-12">
            {assessmentLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-8">
                <div className="w-20 h-20 rounded-full border-4 border-violet-900/20 border-t-violet-600 animate-spin" />
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-violet-400 animate-pulse">Generating Neural Test Matrix...</p>
              </div>
            ) : assessmentData ? (
              <div className="space-y-12">
                {quizSubmitted && quizResult && (
                  <div className="text-center p-12 rounded-[2.5rem] border border-violet-900/30 bg-violet-900/10 animate-in zoom-in-95 duration-500 shadow-xl shadow-violet-900/20">
                    <div className="text-7xl font-black mb-4 tracking-tighter text-white">{quizResult.score}%</div>
                    <p className="text-slate-300 text-base font-bold mb-2">
                      {quizResult.passed ? '✨ Threshold achieved. Neural Entry granted.' : '⚠️ Threshold not met. System will adapt to lower complexity.'}
                    </p>
                    <p className="text-violet-400 font-black uppercase tracking-[0.25em] text-xs">Assigned Complexity: {quizResult.levelName}</p>
                    <button
                      onClick={() => window.location.href = `/dashboard/courses/${activeCourse.id}`}
                      className="mt-10 px-10 py-5 text-white font-black tracking-[0.2em] uppercase text-xs rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl bg-violet-600 shadow-violet-900/40"
                    >
                      PROCEED TO COURSE →
                    </button>
                  </div>
                )}

                <div className="space-y-10">
                  {assessmentData.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-6 pb-10 border-b border-violet-900/10 last:border-0">
                      <div className="flex gap-6 items-start">
                        <div className="w-10 h-10 rounded-2xl bg-violet-900/20 border border-violet-900/30 flex items-center justify-center text-xs font-black text-violet-400 shrink-0 mt-0.5">
                          {(qIdx + 1).toString().padStart(2, '0')}
                        </div>
                        <p className="font-black text-lg md:text-xl leading-relaxed text-white">{q.question}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                        {Object.entries(q.options).map(([key, value]) => {
                          const isSelected = answers[qIdx] === key;
                          const isCorrect = quizSubmitted && key === q.answer;
                          const isWrong = quizSubmitted && isSelected && key !== q.answer;
                          return (
                            <button key={key}
                              onClick={() => !quizSubmitted && setAnswers(prev => ({ ...prev, [qIdx]: key }))}
                              disabled={quizSubmitted}
                              className={`text-left p-6 rounded-2xl border font-bold transition-all duration-200 flex items-center gap-5 group ${isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
                                isWrong ? 'bg-rose-500/10 border-rose-500 text-rose-400' :
                                  isSelected ? 'bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-900/40' :
                                    'bg-[#1a1a2e] border-violet-900/30 text-slate-400 hover:border-violet-600/50 hover:bg-[#1f1f3a]'
                                }`}
                            >
                              <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shrink-0 transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-[#0f0f1a] text-slate-500 group-hover:bg-violet-900/30 group-hover:text-violet-400'}`}>{key}</span>
                              <span className="leading-snug text-sm">{value}</span>
                              {isCorrect && <CheckCircle size={20} className="ml-auto shrink-0 text-emerald-500" />}
                              {isWrong && <XCircle size={20} className="ml-auto shrink-0 text-rose-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {!quizSubmitted && (
                  <div className="pt-8">
                    <button
                      onClick={submitSyncAssessment}
                      disabled={Object.keys(answers).length < assessmentData.length}
                      className="w-full py-6 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-base font-black tracking-[0.3em] uppercase rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-95 shadow-violet-900/40"
                    >
                      <BrainCircuit size={22} />
                      SUBMIT ASSESSMENT ({Object.keys(answers).length}/{assessmentData.length})
                    </button>
                    <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.25em] mt-6">Secure Transfer Protocol Active</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 text-rose-500 font-black tracking-widest text-xs uppercase bg-rose-500/10 rounded-[2.5rem]">
                Failed to initialize assessment matrix. Internal neural error.
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
