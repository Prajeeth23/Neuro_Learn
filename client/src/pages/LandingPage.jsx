import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: 'psychology',       title: 'Adaptive AI Engine',       desc: 'Personalized learning paths that evolve with your cognitive patterns.' },
    { icon: 'quiz',             title: 'Smart Assessments',        desc: 'Dynamic quizzes that adjust difficulty based on your mastery level.' },
    { icon: 'insights',         title: 'Cognitive Analytics',      desc: 'Deep insights into your learning velocity and skill mastery.' },
    { icon: 'alt_route',        title: 'Learning Path',            desc: 'Visual roadmaps guiding you from fundamentals to mastery.' },
    { icon: 'smart_toy',        title: 'AI Tutor',                 desc: 'An always-available mentor powered by advanced language models.' },
    { icon: 'auto_stories',     title: 'Rich Course Library',      desc: 'Curated content across Data Science, ML, Programming and more.' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--cs-bg-deep)' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background: 'rgba(10,0,32,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--cs-border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--cs-purple), var(--cs-teal))' }}>
            <span className="material-symbols-outlined material-symbols-filled text-white" style={{ fontSize: '16px' }}>psychology_alt</span>
          </div>
          <span className="text-base font-black text-[var(--cs-text-primary)] tracking-tight">
            Cognitive<span style={{ color: 'var(--cs-purple-light)' }}>Sanctuary</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="cs-btn-secondary text-sm px-4 py-2">Sign In</button>
          <button onClick={() => navigate('/signup')} className="cs-btn-primary text-sm px-4 py-2">Get Started</button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden pt-16">
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.6) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, rgba(6,214,160,0.5) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.5) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto cs-animate-in">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <span className="material-symbols-outlined material-symbols-filled text-[var(--cs-teal)]" style={{ fontSize: '16px' }}>auto_awesome</span>
            <span className="text-xs font-semibold text-[var(--cs-purple-light)]">AI-Powered Adaptive Learning</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="cs-text-gradient">Elevate Your</span>
            <br />
            <span className="text-[var(--cs-text-primary)]">Cognitive Potential</span>
          </h1>

          <p className="text-lg text-[var(--cs-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            A sanctuary for deep learning. Our AI engine adapts to your mind, building personalized paths that turn knowledge into mastery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')} className="cs-btn-primary px-8 py-3 text-base">
              <span className="material-symbols-outlined text-base">rocket_launch</span>
              Begin Your Journey
            </button>
            <button onClick={() => navigate('/login')} className="cs-btn-secondary px-8 py-3 text-base">
              <span className="material-symbols-outlined text-base">login</span>
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-14 flex-wrap">
            {[
              { value: '10K+', label: 'Active Learners' },
              { value: '94%',  label: 'Skill Improvement' },
              { value: '50+',  label: 'Course Domains' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black cs-text-gradient">{s.value}</div>
                <div className="text-xs font-semibold text-[var(--cs-text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[var(--cs-text-primary)] mb-3">Built for Deep Learning</h2>
            <p className="text-[var(--cs-text-secondary)]">Every feature designed to optimize your cognitive growth</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={f.title} className="cs-card p-6 cs-animate-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(6,214,160,0.15) 100%)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <span className="material-symbols-outlined material-symbols-filled text-[var(--cs-teal)]" style={{ fontSize: '24px' }}>{f.icon}</span>
                </div>
                <h3 className="text-base font-bold text-[var(--cs-text-primary)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--cs-text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-2xl mx-auto cs-card-featured p-10 text-center cs-animate-in">
          <span className="material-symbols-outlined material-symbols-filled text-[var(--cs-teal)] mb-4 cs-animate-float" style={{ fontSize: '48px' }}>psychology_alt</span>
          <h2 className="text-3xl font-black text-[var(--cs-text-primary)] mb-3">Your Mind Deserves More</h2>
          <p className="text-[var(--cs-text-secondary)] mb-8">Join thousands of learners who've unlocked their full cognitive potential.</p>
          <button onClick={() => navigate('/signup')} className="cs-btn-teal px-8 py-3 text-base mx-auto">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Start for Free
          </button>
        </div>
      </section>
    </div>
  );
}
