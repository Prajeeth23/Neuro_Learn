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
    { label: 'Dashboard',          path: '/dashboard',             icon: <LayoutDashboard size={16} /> },
    { label: 'My Courses',         path: '/dashboard/courses',     icon: <BookOpen size={16} />        },
    { label: 'AI Tutor',           path: '/dashboard/personalized',icon: <Sparkles size={16} />        },
    { label: 'Learning Tracker',   path: '/dashboard/tracker',     icon: <Activity size={16} />        },
    { label: 'Analytics',          path: '/dashboard/analytics',   icon: <BarChart3 size={16} />       },
    { label: 'Profile',            path: '/dashboard/profile',     icon: <User size={16} />            },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Panel', path: '/dashboard/admin', icon: <Shield size={16} /> });
  }

  const handleNavClick = (path) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.email?.substring(0, 2).toUpperCase()
    || 'NL';

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Neural Pioneer';

  // Black sidebar nav content (shared between desktop + drawer)
  const SidebarNav = ({ onClose }) => (
    <div className="flex flex-col h-full" style={{ background: '#111111' }}>

      {/* Brand */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => { navigate('/'); onClose?.(); }}
            className="text-white font-black text-base tracking-tight hover:opacity-70 transition-opacity">
            NEURO<span style={{ color: '#aaaaaa' }}>LEARN</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
            || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-left"
              style={isActive ? {
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
              } : {
                color: 'rgba(255,255,255,0.45)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              <span className="flex-1" style={{ letterSpacing: '-0.01em' }}>{item.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full" style={{ background: '#ffffff' }} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom — user + logout */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate leading-tight" style={{ letterSpacing: '-0.01em' }}>{userName}</div>
            <div className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.email}</div>
          </div>
        </div>
        {/* Sign Out */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,100,100,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}>
          <LogOut size={14} />
          <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex font-sans" style={{ background: '#f7f7f7' }}>

      {/* ===== DESKTOP SIDEBAR — Fixed black sidebar ===== */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30"
        style={{ width: '220px', background: '#111111' }}>
        <SidebarNav />
      </aside>

      {/* ===== MOBILE DRAWER ===== */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-60 md:hidden"
              style={{ background: '#111111' }}
            >
              <SidebarNav onClose={() => setIsDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: '0', paddingLeft: '0' }}
        // Push content right of sidebar on desktop
      >
        <div className="md:ml-[220px] flex-1 flex flex-col">

          {/* Mobile top bar */}
          <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-5 h-14"
            style={{ background: '#ffffff', borderBottom: '1px solid #e5e5e5' }}>
            <button onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Menu size={20} style={{ color: '#111111' }} />
            </button>
            <span className="text-sm font-black tracking-tight" style={{ color: '#111111', letterSpacing: '-0.02em' }}>
              NEURO<span style={{ color: '#888888' }}>LEARN</span>
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: '#111111', color: '#ffffff' }}>
              {userInitials}
            </div>
          </header>

          {/* Desktop top bar */}
          <header className="hidden md:flex sticky top-0 z-20 items-center justify-between px-8 h-14"
            style={{ background: '#ffffff', borderBottom: '1px solid #e5e5e5' }}>
            <div /> {/* spacer */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg" style={{ background: '#f7f7f7', border: '1px solid #e5e5e5' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black"
                  style={{ background: '#111111', color: '#ffffff' }}>
                  {userInitials}
                </div>
                <span className="text-xs font-semibold" style={{ color: '#444444', letterSpacing: '-0.01em' }}>
                  {userName}
                </span>
              </div>
              <button onClick={handleLogout}
                className="p-2 rounded-lg transition-colors group"
                style={{ border: '1px solid #e5e5e5', background: '#ffffff' }}
                title="Sign out"
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffcccc'; e.currentTarget.style.background = '#fff5f5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#ffffff'; }}>
                <LogOut size={15} style={{ color: '#888888' }} />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-6 md:px-8 py-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
