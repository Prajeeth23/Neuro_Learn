import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, Activity, BarChart3, Sparkles, User, LogOut,
  Shield, LayoutDashboard, Menu, X, Bell, ChevronRight,
  GraduationCap, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    const syncUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || 'Learner'
          }, { onConflict: 'id' });
      }
    };
    syncUser();
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Close on outside click (desktop)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard',        path: '/dashboard',              icon: <LayoutDashboard size={17} />, color: 'indigo' },
    { label: 'My Courses',       path: '/dashboard/courses',      icon: <BookOpen size={17} />,        color: 'violet' },
    { label: 'AI Tutor',         path: '/dashboard/personalized', icon: <Sparkles size={17} />,        color: 'teal'   },
    { label: 'Learning Tracker', path: '/dashboard/tracker',      icon: <Activity size={17} />,        color: 'amber'  },
    { label: 'Analytics',        path: '/dashboard/analytics',    icon: <BarChart3 size={17} />,       color: 'indigo' },
    { label: 'Profile',          path: '/dashboard/profile',      icon: <User size={17} />,            color: 'violet' },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin', path: '/dashboard/admin', icon: <Shield size={17} />, color: 'rose' });
  }

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.email?.substring(0, 2).toUpperCase()
    || 'NL';

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';

  const getPageTitle = () => {
    const item = navItems.find(n =>
      n.path === location.pathname ||
      (n.path !== '/dashboard' && location.pathname.startsWith(n.path))
    );
    return item?.label || 'Dashboard';
  };

  // Sidebar Drawer Content
  const DrawerContent = ({ onClose }) => (
    <div className="flex flex-col h-full" style={{ background: '#ffffff' }}>

      {/* Brand Header */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #F2F4F6' }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => { navigate('/'); onClose?.(); }}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3525CD, #4F46E5)' }}>
              <GraduationCap size={16} style={{ color: '#ffffff' }} />
            </div>
            <span className="font-bold text-base" style={{ color: '#191C1E', letterSpacing: '-0.02em' }}>
              Neuro<span style={{ color: '#4F46E5' }}>Learn</span>
            </span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#777587' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F2F4F6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#C7C4D8' }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
            || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          const colorMap = {
            indigo: { bg: '#EEF2FF', text: '#4F46E5', border: '#4F46E5' },
            violet: { bg: '#F5F3FF', text: '#7C3AED', border: '#7C3AED' },
            teal:   { bg: '#F0FDFA', text: '#0D9488', border: '#0D9488' },
            amber:  { bg: '#FFFBEB', text: '#D97706', border: '#D97706' },
            rose:   { bg: '#FFF1F2', text: '#E11D48', border: '#E11D48' },
          };
          const c = colorMap[item.color] || colorMap.indigo;

          return (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); onClose?.(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left border-none cursor-pointer"
              style={isActive ? {
                background: c.bg,
                color: c.text,
                fontWeight: 600,
                borderLeft: `3px solid ${c.border}`,
                paddingLeft: 'calc(0.75rem - 3px)',
              } : {
                color: '#464555',
                background: 'transparent',
                fontWeight: 400,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = c.bg;
                  e.currentTarget.style.color = c.text;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#464555';
                }
              }}
            >
              <span style={{ color: isActive ? c.text : '#777587' }}>{item.icon}</span>
              <span className="flex-1" style={{ letterSpacing: '-0.01em' }}>{item.label}</span>
              {isActive && <ChevronRight size={13} style={{ color: c.text, opacity: 0.6 }} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom — User Profile + Logout */}
      <div className="p-3" style={{ borderTop: '1px solid #F2F4F6' }}>
        {/* User chip */}
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1.5 cursor-pointer transition-colors"
          style={{ background: '#F8FAFC' }}
          onClick={() => { navigate('/dashboard/profile'); onClose?.(); }}
          onMouseEnter={e => e.currentTarget.style.background = '#EEF2FF'}
          onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
        >
          <div className="avatar w-8 h-8 text-[11px] flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate leading-tight" style={{ color: '#191C1E', letterSpacing: '-0.01em' }}>
              {userName}
            </div>
            <div className="text-[11px] truncate" style={{ color: '#777587' }}>{user?.email}</div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left border-none cursor-pointer"
          style={{ color: '#777587', background: 'transparent', fontWeight: 400 }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#E11D48';
            e.currentTarget.style.background = '#FFF1F2';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#777587';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={15} />
          <span style={{ letterSpacing: '-0.01em' }}>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex font-sans relative overflow-hidden mesh-gradient-aura">

      {/* ===== PRISM AURA BACKGROUND ELEMENTS ===== */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-floating" />
      <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-teal-500/10 blur-[100px] animate-floating-slow" />
      <div className="absolute top-[30%] right-[10%] w-[25%] h-[25%] rounded-full bg-violet-500/10 blur-[80px] animate-floating" />


      {/* ===== PERSISTENT DESKTOP SIDEBAR ===== */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-30 card !rounded-none !border-y-0 !border-l-0"
        style={{ width: '240px' }}
      >
        <DrawerContent />
      </aside>

      {/* ===== MOBILE / TABLET DRAWER ===== */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(25, 28, 30, 0.4)', backdropFilter: 'blur(2px)' }}
            />
            {/* Drawer Panel */}
            <motion.aside
              ref={drawerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 z-50 lg:hidden"
              style={{ width: '260px', background: '#ffffff', boxShadow: '4px 0 24px rgba(25,28,30,0.12)' }}
            >
              <DrawerContent onClose={() => setIsDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">

        {/* ===== TOP NAVIGATION BAR ===== */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-5 lg:px-8 glass-luxe"
          style={{
            height: '70px',
            borderBottom: '1px solid rgba(79, 70, 229, 0.1)',
          }}
        >
          {/* Left: Hamburger (mobile) + Page Title */}
          <div className="flex items-center gap-3">
            {/* Hamburger button — visible on mobile/tablet only */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl transition-colors -ml-1"
              style={{ color: '#464555' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F2F4F6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            {/* Mobile brand logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3525CD, #4F46E5)' }}>
                <GraduationCap size={14} style={{ color: '#ffffff' }} />
              </div>
              <span className="font-bold text-sm" style={{ color: '#191C1E', letterSpacing: '-0.02em' }}>
                Neuro<span style={{ color: '#4F46E5' }}>Learn</span>
              </span>
            </div>

            {/* Desktop: page title breadcrumb */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: '#777587' }}>NeuroLearn</span>
              <ChevronRight size={13} style={{ color: '#C7C4D8' }} />
              <span className="text-sm font-semibold" style={{ color: '#191C1E' }}>{getPageTitle()}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Search button — desktop */}
            <button
              className="hidden lg:flex p-2 rounded-xl transition-colors"
              style={{ color: '#777587' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F2F4F6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => navigate('/dashboard/search')}
              title="Search courses"
            >
              <Search size={18} />
            </button>

            {/* Notification bell */}
            <button
              className="p-2 rounded-xl transition-colors relative"
              style={{ color: '#777587' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F2F4F6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Notifications"
            >
              <Bell size={18} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: '#E11D48', border: '1.5px solid white' }}
              />
            </button>

            {/* User avatar chip — desktop */}
            <button
              className="hidden lg:flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl transition-colors"
              style={{ background: '#F8FAFC', border: '1px solid #ECEEF0' }}
              onClick={() => navigate('/dashboard/profile')}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#EEF2FF';
                e.currentTarget.style.borderColor = '#C3C0FF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.borderColor = '#ECEEF0';
              }}
            >
              <div className="avatar w-7 h-7 text-[10px]">
                {userInitials}
              </div>
              <span className="text-xs font-semibold" style={{ color: '#464555', letterSpacing: '-0.01em' }}>
                {userName.split(' ')[0]}
              </span>
            </button>

            {/* Logout — desktop only */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex p-2 rounded-xl transition-colors"
              style={{ color: '#777587' }}
              title="Sign out"
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FFF1F2';
                e.currentTarget.style.color = '#E11D48';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#777587';
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* ===== PAGE CONTENT ===== */}
        <main className="flex-1 px-5 lg:px-8 py-10 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
