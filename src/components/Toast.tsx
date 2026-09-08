import React from 'react';
import { useTrainees } from '../context/TraineeContext';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useTrainees();

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-space-24 right-space-24 z-50 transition-all duration-300 flex items-center gap-space-12 bg-inverse-surface text-inverse-on-surface px-space-20 py-space-12 rounded-xl shadow-2xl animate-fade-in">
      <span className="material-symbols-outlined text-secondary-fixed text-xl">
        {toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
      </span>
      <span className="font-body-md-medium text-body-md-medium">
        {toast.message}
      </span>
      <button
        type="button"
        onClick={hideToast}
        className="ml-2 text-outline-variant hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
};
