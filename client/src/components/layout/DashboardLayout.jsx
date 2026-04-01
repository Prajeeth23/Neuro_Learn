import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Activity, BarChart3, Sparkles, User, LogOut, Shield, LayoutDashboard, Menu, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .upsert({ 
            id: user.id, 
            email: user.email, 
            name: user.user_metadata?.full_name || 'Neural Pioneer' 
          }, { onConflict: 'id' });
      }
    };
    syncUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'My Courses', path: '/dashboard/courses', icon: <BookOpen size={20} /> },
    { label: 'AI Tutor', path: '/dashboard/personalized', icon: <Sparkles size={20} /> },
    { label: 'Learning Tracker', path: '/dashboard/tracker', icon: <Activity size={20} /> },
    { label: 'Analytics Dashboard', path: '/dashboard/analytics', icon: <BarChart3 size={20} /> },
    { label: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Panel', path: '/dashboard/admin', icon: <Shield size={20} /> });
  }

  const handleNavClick = (path) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] relative flex flex-col overflow-hidden font-sans">
      {/* Editorial Background Accents */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-secondary/5 blur-[150px] pointer-events-none z-0"></div>

      {/* Top Header */}
      <header className="relative z-30 w-full bg-white/70 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <Menu size={28} />
            </button>
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-all group hidden sm:flex"
            >
              <div className="p-1.5 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">NeuroLearn</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.substring(0, 2).toUpperCase() || 'JD'}
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Neural Pioneer'}
                </span>
             </div>

             <button 
               onClick={handleLogout} 
               className="group p-2.5 rounded-xl bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-all duration-300 shadow-sm"
               title="Sign Out"
             >
               <LogOut size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Sliding Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[70%] sm:w-[320px] bg-white backdrop-blur-xl border-r border-slate-200 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">NeuroLearn</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                        isActive 
                        ? 'bg-primary/10 text-primary border-l-4 border-l-primary' 
                        : 'text-slate-500 hover:text-primary hover:bg-primary/5 border-l-4 border-l-transparent'
                      }`}
                    >
                      <span className={isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary transition-colors'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-6 border-t border-slate-100 mt-auto bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.substring(0, 2).toUpperCase() || 'JD'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-slate-900 truncate max-w-[150px]">
                      {user?.user_metadata?.full_name || 'Neural Pioneer'}
                    </span>
                    <span className="text-xs font-medium text-slate-500 truncate max-w-[150px]">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
