import axios from 'axios';
import { supabase } from './supabase';

let baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
if (baseURL.endsWith('/')) baseURL = baseURL.slice(0, -1);

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
