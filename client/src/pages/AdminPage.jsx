import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, PlusCircle, AlertCircle, Trash2, BookOpen, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../lib/api';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    playlist_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Course list state
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
    }
  }, [isAdmin]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const { data } = await api.get('/courses');
      setCourses(data || []);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-10 text-center space-y-4">
        <Shield size={64} className="mx-auto text-red-500/50" />
        <h1 className="text-3xl font-black text-white">Access Denied</h1>
        <p className="text-white/40">You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/admin/courses', formData);
      setMessage({ type: 'success', text: 'Course created successfully!' });
      setFormData({ title: '', playlist_url: '' });
      setShowForm(false);
      await fetchCourses();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create course' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    setDeletingId(courseId);
    try {
      // Ensure no double slashes in the URL
      const cleanId = String(courseId).replace(/^\/+/, '');
      await api.delete(`/admin/courses/${cleanId}`);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setMessage({ type: 'success', text: 'Course deleted successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete course' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-20">
      
      <div className="mb-10 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full border border-primary/20 mb-2">
          <Shield size={32} className="text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white">
          Admin <span className="text-accent">Control</span>
        </h1>
        <p className="text-white/40 font-medium tracking-widest uppercase text-xs">Manage Courses & Modules</p>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black tracking-tight text-white/70">
          All Courses ({courses.length})
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={fetchCourses}
            className="uiverse-btn-outline !px-4 !py-2 !text-[10px] font-black tracking-widest uppercase flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="uiverse-btn !px-5 !py-2.5 !text-xs font-black tracking-widest uppercase flex items-center gap-2"
          >
            <PlusCircle size={16} />
            {showForm ? 'Close Form' : 'Add Course'}
          </button>
        </div>
      </div>

      {/* Status message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.type === 'error' && <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Create course form */}
      {showForm && (
        <Card className="glass-card-premium neon-border-primary border-white/5 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>Add New Course</CardTitle>
            <CardDescription>Enter a YouTube playlist URL to create a new course and module.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest uppercase text-white/40 ml-1">Course Topic / Name</label>
                <input 
                  type="text" name="title" required value={formData.title} onChange={handleChange}
                  placeholder="e.g. Advanced System Design"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black tracking-widest uppercase text-white/40 ml-1">YouTube Playlist URL</label>
                <input 
                  type="url" name="playlist_url" required value={formData.playlist_url} onChange={handleChange}
                  placeholder="https://youtube.com/playlist?list=..."
                  className="w-full bg-primary/5 border border-primary/30 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                />
              </div>
              <button type="submit" disabled={loading}
                className="uiverse-btn w-full flex items-center justify-center gap-2 !py-4 shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Creating...' : (<><PlusCircle size={18} /> Publish Course</>)}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Course list */}
      {loadingCourses ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/30 text-sm">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <Card className="py-20 bg-white/[0.02] border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-4">
          <BookOpen size={48} className="text-white/10" />
          <p className="text-white/40 font-bold">No courses yet</p>
          <p className="text-white/20 text-sm">Click "Add Course" to create your first one.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="glass-card-premium border-white/5 p-6 flex items-center justify-between gap-6 group hover:border-white/10 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white truncate">{course.title}</h3>
                  {course.category && (
                    <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary shrink-0">{course.category}</span>
                  )}
                </div>
                <p className="text-sm text-white/40 line-clamp-1">{course.description || 'No description'}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                  className="uiverse-btn-outline !px-4 !py-2 !text-[10px] font-black tracking-widest uppercase"
                >
                  View
                </button>
                <button 
                  onClick={() => handleDelete(course.id)}
                  disabled={deletingId === course.id}
                  className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 transition-all disabled:opacity-30"
                  title="Delete course"
                >
                  {deletingId === course.id ? (
                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
