import React from 'react';
import { useTrainees } from '../context/TraineeContext';
import { ActivePage } from '../types';

export interface BackButtonProps {
  label?: string;
  to?: ActivePage;
  onClick?: () => void;
  id?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  to,
  onClick,
  id,
  className = ''
}) => {
  const { setActivePage, navigateBack } = useTrainees();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (to) {
      setActivePage(to);
    } else {
      navigateBack();
    }
  };

  const autoId = id || `back-btn-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <button
      type="button"
      id={autoId}
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container bg-surface-container-lowest border border-outline-variant/30 transition-all duration-150 shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer select-none shrink-0 ${className}`}
      title={label}
      aria-label={label}
    >
      <span className="material-symbols-outlined text-sm shrink-0">arrow_back</span>
      <span>{label}</span>
    </button>
  );
};
