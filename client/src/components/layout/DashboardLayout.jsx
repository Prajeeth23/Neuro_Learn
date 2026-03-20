import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Sparkles, User, LogOut, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const syncUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Sync user to public.users table if not already synced
        await supabase
          .from('users')
          .upsert({ 
            id: user.id, 
            email: user.email, 
            name: user.user_metadata?.full_name || 'Neural Pioneer' 
          }, { onConflict: 'id' });
      } else {
        // Only redirect to login if we are actually trying to access a protected route
        // and we are CERTAIN there is no user. 
        // For now, we'll let the ProtectedRoute (if any) handle it or just stay on the page.
      }
    };
    syncUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: null },
    { label: 'My Courses', path: '/dashboard/courses', icon: <BookOpen size={16} /> },
    { label: 'Personalized Tutor', path: '/dashboard/personalized', icon: <Sparkles size={16} /> },
    { label: 'Profile', path: '/dashboard/profile', icon: <User size={16} /> }
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Panel', path: '/dashboard/admin', icon: <Shield size={16} /> });
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white relative flex flex-col overflow-hidden font-sans">
      {/* Immersive Background Effects for Dashboard */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[130px] mix-blend-screen pointer-events-none animate-pulse z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-accent/10 blur-[150px] mix-blend-screen pointer-events-none z-0"></div>

      {/* Premium Top Navigation Bar */}
      <header className="relative z-30 w-full bg-black/40 backdrop-blur-2xl border-b border-white/5">
        {/* Animated Glowing Bottom Border */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_1px_10px_rgba(124,58,237,0.3)]"></div>
        
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 
              onClick={() => navigate('/')} 
              className="text-2xl font-black tracking-tighter cursor-pointer hover:opacity-80 transition-all group"
            >
              NEURO<span className="text-accent group-hover:text-primary transition-colors">LEARN</span>
            </h1>

            {/* Main Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                      isActive 
                      ? 'bg-white/5 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] border border-white/10' 
                      : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    {item.icon && <span className={isActive ? 'text-primary' : ''}>{item.icon}</span>}
                    {item.label}
                    {isActive && <div className="w-1 h-1 rounded-full bg-primary animate-pulse ml-1"></div>}
                  </button>
                );
              })}
            </nav>
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
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-10 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Footer Nav (Simplified for now) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-black/60 backdrop-blur-2xl border-t border-white/5 z-40 flex items-center justify-around px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-white/30'}`}
              >
                {item.icon}
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
      </nav>
    </div>
  );
}
