import axios from 'axios';
import { supabase } from './supabase';

let baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
if (baseURL.endsWith('/')) baseURL = baseURL.slice(0, -1);
if (!baseURL.endsWith('/api')) {
  baseURL = `${baseURL}/api`;
}

// Force Vercel Serverless Functions in production instead of old external Render APIs
if (import.meta.env.PROD) {
  baseURL = '/api';
}

const api = axios.create({
  baseURL,
});

// Add a request interceptor to attach the Supabase access token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
