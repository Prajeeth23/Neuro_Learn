import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Nav items matching Stitch "Cognitive Sanctuary" design
const NAV_ITEMS = [
  { label: 'Dashboard',            path: '/dashboard',             icon: 'dashboard',        exact: true  },
  { label: 'My Courses',          path: '/dashboard/courses',     icon: 'auto_stories',     exact: false },
  { label: 'Adaptive Test',       path: '/dashboard/assessment',  icon: 'quiz',             exact: false },
  { label: 'Learning Path',       path: '/dashboard/tracker',     icon: 'alt_route',        exact: false },
  { label: 'AI Tutor',            path: '/dashboard/personalized',icon: 'psychology',       exact: false },
  { label: 'Analytics',           path: '/dashboard/analytics',   icon: 'insights',         exact: false },
  { label: 'Profile & Settings',  path: '/dashboard/profile',     icon: 'settings',         exact: false },
];

const ADMIN_ITEM = { label: 'Admin Panel', path: '/dashboard/admin', icon: 'admin_panel_settings', exact: false };

export default function DashboardLayout() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [cognitiveScore] = useState(84);

  useEffect(() => {
    // Sync user to public.users table
    const syncUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase.from('users').upsert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || 'Neural Pioneer'
        }, { onConflict: 'id' });
      }
    };
    syncUser();
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const allNavItems = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.email?.substring(0, 2).toUpperCase()
    || 'NL';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Neural Pioneer';

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-[var(--cs-border-subtle)]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--cs-purple)] to-[var(--cs-teal)] flex items-center justify-center">
            <span className="material-symbols-outlined material-symbols-filled text-white text-base">psychology_alt</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-black tracking-tight text-[var(--cs-text-primary)] leading-none">
              Cognitive
            </div>
            <div className="text-xs font-semibold text-[var(--cs-purple-light)] leading-none mt-0.5">
              Sanctuary
            </div>
          </div>
        </button>
      </div>

      {/* User Profile Chip */}
      <div className="mx-3 mt-4 mb-2 p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.18)' }}>
        <div className="flex items-center gap-3">
          <div className="cs-avatar" style={{ background: 'linear-gradient(135deg, #7c3aed, #06d6a0)' }}>
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[var(--cs-text-primary)] truncate leading-tight">{userName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold text-[var(--cs-teal)]">Cognitive Level:</span>
              <span className="text-[10px] font-black text-[var(--cs-teal)]">{cognitiveScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {allNavItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`cs-nav-item w-full text-left ${active ? 'active' : ''}`}
            >
              <span
                className={`material-symbols-outlined cs-nav-icon text-xl ${active ? 'material-symbols-filled' : ''}`}
                style={{ color: active ? 'var(--cs-teal)' : 'var(--cs-text-muted)', fontSize: '20px' }}
              >
                {item.icon}
              </span>
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--cs-teal)] shadow-[0_0_8px_rgba(6,214,160,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: Sign Out */}
      <div className="p-3 border-t border-[var(--cs-border-subtle)]">
        <button
          onClick={handleLogout}
          className="cs-nav-item w-full text-left group"
          style={{ color: 'var(--cs-text-muted)' }}
        >
          <span
            className="material-symbols-outlined text-xl transition-colors group-hover:text-red-400"
            style={{ color: 'inherit', fontSize: '20px' }}
          >
            logout
          </span>
          <span className="font-medium text-sm group-hover:text-red-400 transition-colors">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="cs-layout">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="cs-sidebar hidden md:flex" style={{ flexDirection: 'column' }}>
        <SidebarContent />
      </aside>

      {/* ===== MOBILE: Overlay + Drawer ===== */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 md:hidden flex flex-col"
              style={{ background: 'var(--cs-sidebar-bg)', borderRight: '1px solid var(--cs-border-subtle)' }}
            >
              {/* Close button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[var(--cs-text-muted)] text-xl">close</span>
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div className="cs-main flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3"
          style={{ background: 'rgba(10, 0, 32, 0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--cs-border-subtle)' }}>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[var(--cs-text-primary)]">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--cs-purple)] to-[var(--cs-teal)] flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>psychology_alt</span>
            </div>
            <span className="text-sm font-black tracking-tight text-[var(--cs-text-primary)]">Cognitive<span className="text-[var(--cs-purple-light)]">Sanctuary</span></span>
          </div>
          <div className="cs-avatar w-8 h-8 text-xs">{userInitials}</div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Background ambient orbs */}
      <div className="fixed top-0 left-[20%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
    </div>
  );
}
