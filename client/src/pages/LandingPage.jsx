import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Brain, 
  Target, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Layout,
  BarChart3,
  Cpu
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#09090b] font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">NeuroLearn</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Sign In</Link>
              <Link to="/signup" className="btn-primary text-sm px-5 py-2">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full mb-8 animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">The Cognitive Atelier</span>
              <div className="w-1 h-1 bg-primary rounded-full" />
              <span className="text-xs font-medium text-primary/80">Next-Gen EdTech</span>
            </div>
            
            <h1 className="display-hero mb-8 animate-fade-in">
              Accelerate Learning through <br />
              <span className="text-primary italic">Neural Synchronicity</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Experience the Digital Curator for your mind. Our AI-driven engine maps your cognitive baseline, delivering personalized neural pathways for rapid skill acquisition.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/signup" className="btn-primary group text-lg px-8 py-4 w-full sm:w-auto">
                Join the Network
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof Line */}
      <section className="py-12 bg-white border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Cognition AI', 'NeuralWorks', 'SynthLearn', 'MindFlow', 'EduVector'].map((partner) => (
              <span key={partner} className="text-lg font-bold tracking-tighter text-slate-900">{partner}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">The Neural Advantage</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Precision-engineered tools for the modern intellectual explorer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="surface-elevated p-8 hover:border-primary/50 group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Cognitive Baseline</h3>
              <p className="text-slate-600 leading-relaxed">Advanced diagnostic assessments that map your current neural understanding before you even start.</p>
            </div>

            <div className="surface-elevated p-8 hover:border-primary/50 group">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Neural Pathways</h3>
              <p className="text-slate-600 leading-relaxed">Dynamic content adaptation that evolves in real-time based on your absorption rate and performance.</p>
            </div>

            <div className="surface-elevated p-8 hover:border-primary/50 group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Secure Certification</h3>
              <p className="text-slate-600 leading-relaxed">Academic-grade integrity with our Secure Assessment Mode, ensuring your credentials mean more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-primary rounded-[2rem] p-12 md:p-20 text-center overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 relative z-10">Start Your Synthesis Today</h2>
            <p className="text-xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto relative z-10">
              Join thousands of learners who have unlocked their cognitive peak.
            </p>
            
            <Link to="/signup" className="btn-secondary text-lg px-10 py-5 w-full sm:w-auto relative z-10 bg-white text-primary border-none hover:bg-slate-50">
              Launch Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center space-x-2 mb-8">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">NeuroLearn</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 NeuroLearn Platform. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-8">
            {['Privacy', 'Terms', 'Security', 'Feedback'].map((f) => (
              <a key={f} href="#" className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">{f}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
