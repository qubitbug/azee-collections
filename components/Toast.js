'use client';

import { useState, useEffect, useCallback } from 'react';

let toastTimeout = null;

export function showToast(message) {
  // Dispatch custom event to trigger toast
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('azee-toast', { detail: message }));
  }
}

export default function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const handleToast = useCallback((e) => {
    if (toastTimeout) clearTimeout(toastTimeout);
    setMessage(e.detail);
    setVisible(true);
    toastTimeout = setTimeout(() => {
      setVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    window.addEventListener('azee-toast', handleToast);
    return () => window.removeEventListener('azee-toast', handleToast);
  }, [handleToast]);

  if (!message) return null;

  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
}
