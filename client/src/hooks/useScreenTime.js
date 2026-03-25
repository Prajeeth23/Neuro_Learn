import { useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';

/**
 * Custom hook to track screen time on a page/course
 * Sends accumulated time to the server every 60 seconds
 */
export function useScreenTime(courseId = null) {
  const startTime = useRef(Date.now());
  const intervalRef = useRef(null);

  const logTime = useCallback(async () => {
    const now = Date.now();
    const elapsed = Math.round((now - startTime.current) / 1000);
    startTime.current = now;
    
    if (elapsed < 5) return; // Don't log trivial durations

    try {
      await api.post('/progress/screen-time', {
        course_id: courseId,
        duration_seconds: elapsed
      });
    } catch (err) {
      // Silently fail — screen time logging shouldn't break UX
      console.debug('Screen time log failed:', err.message);
    }
  }, [courseId]);

  useEffect(() => {
    startTime.current = Date.now();

    // Log every 60 seconds
    intervalRef.current = setInterval(() => {
      logTime();
    }, 60000);

    // Log on page visibility change (tab switch)
    const handleVisibility = () => {
      if (document.hidden) {
        logTime();
      } else {
        startTime.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Log on unmount
    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      logTime();
    };
  }, [courseId, logTime]);
}
