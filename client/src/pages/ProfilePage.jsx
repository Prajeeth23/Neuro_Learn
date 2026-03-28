import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', year: '', domain_of_interest: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const userInitials = user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.email?.substring(0, 2).toUpperCase() || 'NL';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};
        const res = await axios.get('/api/auth/profile', { headers });
        setProfile(res.data);
        setForm({
          name: res.data.name || '',
          department: res.data.department || '',
          year: res.data.year || '',
          domain_of_interest: res.data.domain_of_interest || '',
        });
      } catch (err) {
        setError('Could not load profile.');
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};
      await axios.put('/api/auth/profile', form, { headers });
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
    setSaving(false);
  };

  const fields = [
    { key: 'name',              label: 'Full Name',          icon: 'person',       type: 'text',   placeholder: 'Your full name' },
    { key: 'department',        label: 'Department',         icon: 'business',     type: 'text',   placeholder: 'e.g., Computer Science' },
    { key: 'year',              label: 'Year of Study',      icon: 'school',       type: 'text',   placeholder: 'e.g., 2nd Year' },
    { key: 'domain_of_interest',label: 'Domain of Interest', icon: 'interests',    type: 'text',   placeholder: 'e.g., Machine Learning' },
  ];

  const settingsItems = [
    { icon: 'notifications',  label: 'Notifications',       desc: 'Manage study reminders and alerts' },
    { icon: 'palette',        label: 'Appearance',          desc: 'Customize your visual preferences' },
    { icon: 'lock',           label: 'Privacy & Security',  desc: 'Manage your account security' },
    { icon: 'help',           label: 'Help & Support',      desc: 'Get assistance with the platform' },
  ];

  return (
    <div className="space-y-6 cs-animate-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-[var(--cs-text-primary)]">Profile & Settings</h1>
        <p className="text-sm text-[var(--cs-text-secondary)] mt-1">Manage your identity and learning preferences</p>
      </div>

      {/* Profile Card */}
      <div className="cs-card p-6">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, var(--cs-purple) 0%, var(--cs-teal) 100%)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
              {userInitials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--cs-teal)] flex items-center justify-center"
              style={{ boxShadow: '0 0 8px rgba(6,214,160,0.8)' }}>
              <span className="material-symbols-outlined text-[#0a0020]" style={{ fontSize: '12px' }}>check</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--cs-text-primary)]">{profile?.name || user?.user_metadata?.full_name || 'Neural Pioneer'}</h2>
            <p className="text-sm text-[var(--cs-text-muted)]">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="cs-badge cs-badge-purple">Premium Member</span>
              <span className="cs-badge cs-badge-teal">
                <span className="material-symbols-outlined text-[10px]" style={{ fontSize: '12px' }}>military_tech</span>
                Cognitive Lv. 84
              </span>
            </div>
          </div>
        </div>

        <div className="cs-divider" />

        {/* Success / Error */}
        {success && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.3)', color: 'var(--cs-teal)' }}>
            <span className="material-symbols-outlined text-base">check_circle</span>
            Profile saved successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}>
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Profile Fields */}
        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-[var(--cs-text-muted)] mb-1.5">{f.label}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cs-text-muted)]" style={{ fontSize: '18px' }}>{f.icon}</span>
                <input
                  className="cs-input pl-10"
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  disabled={!editing}
                  style={!editing ? { opacity: 0.7, cursor: 'default' } : {}}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="cs-btn-primary flex-1">
                <span className="material-symbols-outlined text-base">{saving ? 'hourglass_empty' : 'save'}</span>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="cs-btn-secondary px-4">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="cs-btn-secondary">
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="cs-card p-5">
        <h2 className="cs-section-title mb-4">Settings</h2>
        <div className="space-y-1">
          {settingsItems.map(item => (
            <button key={item.label}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.15)' }}>
                <span className="material-symbols-outlined text-[var(--cs-purple-light)]" style={{ fontSize: '18px' }}>{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--cs-text-primary)] group-hover:text-[var(--cs-purple-light)] transition-colors">{item.label}</div>
                <div className="text-xs text-[var(--cs-text-muted)]">{item.desc}</div>
              </div>
              <span className="material-symbols-outlined text-[var(--cs-text-muted)] group-hover:text-[var(--cs-text-secondary)] transition-colors" style={{ fontSize: '20px' }}>chevron_right</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
