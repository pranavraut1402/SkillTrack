import React, { useState } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { useAuth } from '../context/AuthContext';
import { getTraineeAvatar } from '../utils/avatarHelper';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    setActivePage,
    showToast,
    trainees,
    openTraineeProfile,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    setGlobalSearchQuery,
    isSyncing
  } = useTrainees();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBOSeOGLl5Gpt2MK1lUze0YOgLhb7833Qu8uGHKb3Yna4Rq46Yp5hplo_iY5ByDwVCJ03QMATkq-UnhCpoNvYC9XDKeTFe5mIbjP_RZN4Cgl2Phzv_ni-A649-cCrkKu_IUW3lzAd0r0w4_x56zANaSqh3S2EiulV4bV2O6sUeWiSLVhsDneiV27RHeTVa07YfB5rGEDi-J--M6n6-8AUGuc6iNNKIvCCOthhqKDSI0KvVjzuhLjBHB";
  const userAvatar = user?.photoURL || defaultAvatar;
  const userName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'State Mission Officer');
  const userEmail = user?.email || (user?.isAnonymous ? 'Demo Officer Session' : 'officer@mssds.gov.in');

  const handleLogout = async () => {
    try {
      setShowUserMenu(false);
      showToast('Signing out of SkillTrack Directorate...', 'info');
      await logout();
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (err) {
      showToast('Error during logout. Please try again.', 'error');
    }
  };

  const term = searchTerm.trim().toLowerCase();
  const filteredTrainees = term
    ? trainees.filter(t => 
        t.name.toLowerCase().includes(term) || 
        t.id.toLowerCase().includes(term) ||
        t.course.toLowerCase().includes(term) ||
        t.batch.toLowerCase().includes(term) ||
        t.district.toLowerCase().includes(term) ||
        t.employer.toLowerCase().includes(term) ||
        t.trainingProvider.toLowerCase().includes(term)
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setGlobalSearchQuery(searchTerm.trim());
      setActivePage('trainees');
      setShowSearchResults(false);
      showToast(`Filtering Trainee Directory for "${searchTerm.trim()}"`);
    }
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-24 transition-[left] duration-200">
      {/* Left side breadcrumbs and tags */}
      <div className="flex items-center gap-space-12 sm:gap-space-16">
        {/* Mobile menu toggle button */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden p-1.5 -ml-1.5 rounded-lg text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center cursor-pointer"
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="flex items-center gap-space-8 font-label-md text-label-md text-on-surface-variant">
          <button
            type="button"
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-space-4 text-on-surface font-body-md-medium hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            SkillTrack
          </button>
          <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
          <span className="text-primary font-body-md-medium">Outcome Tracking</span>
        </div>

        <div className="hidden xl:flex items-center gap-space-8 px-space-12 py-space-4 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          SkillTrack Outcome Tracking
        </div>

        <div className="hidden lg:flex items-center px-space-8 py-space-2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
          Prototype Demo Data • Firestore Connected
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-space-8 py-space-2 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-medium border border-outline-variant/30">
          <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          <span>{isSyncing ? 'Syncing...' : 'Firestore Active'}</span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-space-16">
        {/* Quick Search */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-space-8 text-outline text-lg pointer-events-none">
            search
          </span>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Quick search trainees, batches..."
              className="w-64 h-9 pl-space-32 pr-space-12 bg-surface-container-lowest rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
            />
          </form>

          {/* Quick Search Dropdown */}
          {showSearchResults && searchTerm.trim() && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSearchResults(false)}
              />
              <div className="absolute top-11 -right-8 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden z-50">
                <div className="p-2.5 bg-surface-container-low/80 border-b border-surface-container-low flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                  <span>Matching Trainees ({filteredTrainees.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setShowSearchResults(false);
                    }}
                    className="text-outline hover:text-on-surface"
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-surface-container-low">
                  {filteredTrainees.slice(0, 5).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        openTraineeProfile(t.id);
                        setShowSearchResults(false);
                        setSearchTerm('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-surface-container flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-primary-container text-on-primary font-bold text-[10px] flex items-center justify-center shrink-0 ring-1 ring-outline-variant/30">
                          <img
                            src={getTraineeAvatar(t)}
                            alt={t.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-on-surface">{t.name} <span className="text-primary font-mono font-bold">({t.id})</span></div>
                          <div className="text-[11px] text-on-surface-variant">{t.course} • {t.district}</div>
                        </div>
                      </div>
                      <span className="text-xs text-secondary font-medium">{t.employmentStatus}</span>
                    </button>
                  ))}
                  {filteredTrainees.length === 0 && (
                    <div className="p-4 text-xs text-on-surface-variant text-center">No candidates found matching "{searchTerm}"</div>
                  )}
                </div>
                {filteredTrainees.length > 0 && (
                  <div className="p-2 border-t border-surface-container-low bg-surface-container-lowest">
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalSearchQuery(searchTerm.trim());
                        setActivePage('trainees');
                        setShowSearchResults(false);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-xs font-semibold text-primary text-center transition-colors cursor-pointer"
                    >
                      View All {filteredTrainees.length} in Trainee Directory →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => showToast('All 36 district verification feeds are synced. 0 active alerts.')}
          className="relative p-space-8 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error"></span>
        </button>

        {/* Officer Login Button */}
        <button
          type="button"
          id="header-officer-login-btn"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState(null, '', '/login');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-semibold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none shrink-0"
          title="Officer Login"
          aria-label="Officer Login"
        >
          <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
          <span>Officer Login</span>
        </button>

        {/* User avatar & Profile Menu */}
        <div className="relative flex items-center">
          <button
            type="button"
            id="user-profile-menu-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer ring-1 ring-outline-variant/30 hover:ring-primary/40"
            title={`Signed in as ${userName}`}
          >
            <img
              alt={userName}
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/40"
              src={userAvatar}
              onError={(e) => {
                e.currentTarget.src = defaultAvatar;
              }}
            />
            <span className="material-symbols-outlined text-sm text-outline hidden sm:inline">
              {showUserMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* User Profile Popover Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-11 w-72 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* User Info Header */}
                <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center gap-3">
                  <img
                    alt={userName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-primary/30 shrink-0"
                    src={userAvatar}
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface truncate">
                      {userName}
                    </span>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      {userEmail}
                    </span>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider mt-0.5">
                      State Mission Registry
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-primary">settings</span>
                    <span>Directorate Settings</span>
                  </button>

                  <button
                    type="button"
                    id="header-logout-button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-error hover:bg-error/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-error">logout</span>
                    <span>Sign Out of SkillTrack</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
