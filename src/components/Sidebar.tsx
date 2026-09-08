import React from 'react';
import { useTrainees } from '../context/TraineeContext';
import { useAuth } from '../context/AuthContext';
import { ActivePage } from '../types';
import skillTrackLogo from '../assets/skilltrack-logo.svg';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, isMobileSidebarOpen, setIsMobileSidebarOpen, showToast } = useTrainees();
  const { user, logout } = useAuth();

  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBOSeOGLl5Gpt2MK1lUze0YOgLhb7833Qu8uGHKb3Yna4Rq46Yp5hplo_iY5ByDwVCJ03QMATkq-UnhCpoNvYC9XDKeTFe5mIbjP_RZN4Cgl2Phzv_ni-A649-cCrkKu_IUW3lzAd0r0w4_x56zANaSqh3S2EiulV4bV2O6sUeWiSLVhsDneiV27RHeTVa07YfB5rGEDi-J--M6n6-8AUGuc6iNNKIvCCOthhqKDSI0KvVjzuhLjBHB";
  const userAvatar = user?.photoURL || defaultAvatar;
  const userName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'State Mission Officer');
  const userEmail = user?.email || (user?.isAnonymous ? 'Demo Officer Session' : 'officer@mssds.gov.in');

  const handleLogout = async () => {
    try {
      showToast('Signing out of SkillTrack Directorate...', 'info');
      await logout();
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (err) {
      showToast('Error during logout.', 'error');
    }
  };

  const navItems: { path: ActivePage; label: string; icon: string }[] = [
    { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: 'trainees', label: 'Trainees', icon: 'group' },
    { path: 'training', label: 'Training', icon: 'school' },
    { path: 'employment', label: 'Employment', icon: 'work' },
    { path: 'follow-ups', label: 'Follow-ups', icon: 'event_available' },
    { path: 'analytics', label: 'Analytics', icon: 'bar_chart' },
    { path: 'ai-insights', label: 'AI Insights', icon: 'auto_awesome' },
    { path: 'reports', label: 'Reports', icon: 'description' },
  ];

  const handleNavClick = (path: ActivePage) => {
    setActivePage(path);
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none transition-transform duration-200 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div
            className="p-space-20 pb-space-16 cursor-pointer flex items-start justify-between"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="flex items-center gap-space-12">
              <img
                alt="SkillTrack Logo"
                className="h-8 w-auto object-contain"
                src={skillTrackLogo}
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                  SkillTrack
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">
                  State Mission Registry
                </span>
              </div>
            </div>

            {/* Mobile close icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileSidebarOpen(false);
              }}
              className="md:hidden text-outline hover:text-on-surface p-1 rounded-md cursor-pointer"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="px-space-20 pb-space-12">
            <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
              From Training to Career — Track Every Outcome
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col px-space-12 gap-space-4">
            {navItems.map((item) => {
              const isActive = activePage === item.path || (item.path === 'trainees' && activePage === 'trainee-profile');
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-space-12 px-space-12 py-space-8 rounded-lg transition-colors text-left font-body-md cursor-pointer ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-body-md-medium shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-body-md'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Settings */}
        <div className="p-space-12 flex flex-col gap-space-8 bg-surface-container-low">
          <button
            type="button"
            id="sidebar-officer-login-btn"
            onClick={() => {
              setIsMobileSidebarOpen(false);
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="flex items-center gap-space-12 px-space-12 py-space-8 rounded-lg text-left transition-colors font-body-md text-primary font-semibold hover:bg-primary-container/20 cursor-pointer"
            title="Officer Login"
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            <span>Officer Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-space-12 px-space-12 py-space-8 rounded-lg text-left transition-colors font-body-md cursor-pointer ${
              activePage === 'settings'
                ? 'bg-surface-container text-on-surface font-body-md-medium'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">settings</span>
            <span>Settings</span>
          </button>
          <div className="flex items-center justify-between gap-2 p-space-8 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
            <div
              className="flex items-center gap-space-8 min-w-0 flex-1 cursor-pointer"
              onClick={() => handleNavClick('settings')}
              title={`View ${userName}'s profile`}
            >
              <img
                alt={userName}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-outline-variant/30"
                src={userAvatar}
                onError={(e) => {
                  e.currentTarget.src = defaultAvatar;
                }}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-body-md-medium text-body-md-medium text-on-surface truncate text-xs">
                  {userName}
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant truncate">
                  {userEmail}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="sidebar-logout-button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors shrink-0 cursor-pointer"
              title="Sign Out of SkillTrack"
              aria-label="Sign out"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
