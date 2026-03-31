import { useEffect, useRef, useState, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';

/**
 * useSecureMode
 * Enforces fullscreen, prevents navigation away, and disables common inspection tools.
 * @param {boolean} active - Whether the secure mode is currently engaged.
 */
export const useSecureMode = (active) => {
  const { setSecureMode } = useUI();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const warningTimerRef = useRef(null);

  // 1. Manage Global UI State
  useEffect(() => {
    setSecureMode(active);
    return () => setSecureMode(false);
  }, [active, setSecureMode]);

  // 2. Fullscreen Enforcement
  const enterFullscreen = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    const handleFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);

      if (!inFs && active) {
        setShowWarning(true);
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = setTimeout(() => {
          enterFullscreen();
          setShowWarning(false);
        }, 2500);
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      clearTimeout(warningTimerRef.current);
    };
  }, [active, enterFullscreen]);

  // 3. Block Navigation (React Router 6.7+)
  useBlocker(({ nextLocation }) => {
    if (active) {
      const confirmLeave = window.confirm(
        "Secure Assessment in progress. Navigating away will lose your progress and may be flagged. Are you sure?"
      );
      return !confirmLeave;
    }
    return false;
  });

  // 4. Browser Protection (beforeunload, right-click, keyboard)
  useEffect(() => {
    if (!active) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return { isFullscreen, showWarning, enterFullscreen, exitFullscreen };
};

