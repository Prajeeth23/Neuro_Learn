import { useEffect, useRef, useState, useCallback } from 'react';

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
    const handleFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);

      // Always dispatch a resize event so the browser recomputes layout
      // This prevents the "misaligned grid/cards" bug after ESC
      window.dispatchEvent(new Event('resize'));

      if (!inFs && active) {
        // User pressed ESC mid-assessment — show warning and re-enter
        setShowWarning(true);
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = setTimeout(() => {
          enterFullscreen();
          setShowWarning(false);
        }, 2500);
      } else if (!inFs && !active) {
        // Assessment is done / not started — ensure secure mode is cleared
        setSecureMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      clearTimeout(warningTimerRef.current);
      // Dispatch resize on unmount as well to restore normal layouts
      window.dispatchEvent(new Event('resize'));
    };
  }, [active, enterFullscreen, setSecureMode]);


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

