import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Activity, BarChart3, Sparkles, User, LogOut, Shield, LayoutDashboard, Menu, X } from 'lucide-react';
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
    <div className="min-h-screen bg-[#050510] text-white relative flex flex-col overflow-hidden font-sans">
      {/* Immersive Background Effects */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[130px] mix-blend-screen pointer-events-none animate-pulse z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-accent/10 blur-[150px] mix-blend-screen pointer-events-none z-0"></div>

      {/* Top Header */}
      <header className="relative z-30 w-full bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu size={28} />
            </button>
            <h1 
              onClick={() => navigate('/')} 
              className="text-2xl font-black tracking-tighter cursor-pointer hover:opacity-80 transition-all group hidden sm:block"
            >
              NEURO<span className="text-accent group-hover:text-primary transition-colors">LEARN</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-black">
                  {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.substring(0, 2).toUpperCase() || 'JD'}
                </div>
                <span className="text-xs font-bold text-white/60">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Neural Pioneer'}
                </span>
             </div>

             <button 
               onClick={handleLogout} 
               className="group p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
               title="Sign Out"
             >
               <LogOut size={18} className="text-white/40 group-hover:text-red-400 transition-colors" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Animated Hamburger Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[70%] sm:w-[300px] bg-[#0A0A15]/95 backdrop-blur-3xl border-r border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter">
                  NEURO<span className="text-accent">LEARN</span>
                </h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 group ${
                        isActive 
                        ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_20px_rgba(124,58,237,0.15)]' 
                        : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className={isActive ? 'text-primary' : 'text-white/40 group-hover:text-white/80 transition-colors'}>
                        {item.icon}
                      </span>
                      {item.label}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(124,58,237,0.8)]"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-black">
                    {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.substring(0, 2).toUpperCase() || 'JD'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-white truncate max-w-[150px]">
                      {user?.user_metadata?.full_name || 'Neural Pioneer'}
                    </span>
                    <span className="text-xs font-medium text-white/40 truncate max-w-[150px]">
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
