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
    <div className="min-h-screen bg-white text-gray-900 relative flex flex-col overflow-hidden font-sans">
      {/* Subtle sky-blue ambient orbs */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-sky-200/30 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-sky-100/20 blur-[150px] pointer-events-none z-0" />

      {/* Top Header */}
      <header className="relative z-30 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu size={26} />
            </button>
            <h1
              onClick={() => navigate('/')}
              className="text-xl font-black tracking-tighter cursor-pointer hover:opacity-80 transition-all group hidden sm:block text-gray-900"
            >
              NEURO<span className="text-sky-500 group-hover:text-sky-600 transition-colors">LEARN</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-[10px] font-black text-white">
                {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.substring(0, 2).toUpperCase() || 'JD'}
              </div>
              <span className="text-xs font-semibold text-gray-600">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Neural Pioneer'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="group p-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
              title="Sign Out"
            >
              <LogOut size={17} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Animated Hamburger Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Sliding Drawer — white */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[70%] sm:w-[280px] bg-white border-r border-gray-100 shadow-xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tighter text-gray-900">
                  NEURO<span className="text-sky-500">LEARN</span>
                </h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Nav Items */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-sky-50 text-sky-600 border border-sky-200 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <span className={isActive ? 'text-sky-500' : 'text-gray-400'}>
                        {item.icon}
                      </span>
                      {item.label}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer — user info */}
              <div className="p-5 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-xs font-black text-white">
                    {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.substring(0, 2).toUpperCase() || 'JD'}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm font-bold text-gray-900 truncate max-w-[160px]">
                      {user?.user_metadata?.full_name || 'Neural Pioneer'}
                    </span>
                    <span className="text-xs text-gray-400 truncate max-w-[160px]">
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
