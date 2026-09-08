import React, { useState } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';

export const SettingsPage: React.FC = () => {
  const { showToast } = useTrainees();
  const { user, logout } = useAuth();
  const [districtSync, setDistrictSync] = useState(true);
  const [epfoIntegration, setEpfoIntegration] = useState(true);
  const [biometricSync, setBiometricSync] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBOSeOGLl5Gpt2MK1lUze0YOgLhb7833Qu8uGHKb3Yna4Rq46Yp5hplo_iY5ByDwVCJ03QMATkq-UnhCpoNvYC9XDKeTFe5mIbjP_RZN4Cgl2Phzv_ni-A649-cCrkKu_IUW3lzAd0r0w4_x56zANaSqh3S2EiulV4bV2O6sUeWiSLVhsDneiV27RHeTVa07YfB5rGEDi-J--M6n6-8AUGuc6iNNKIvCCOthhqKDSI0KvVjzuhLjBHB";
  const userAvatar = user?.photoURL || defaultAvatar;
  const userName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'State Mission Officer');
  const userEmail = user?.email || (user?.isAnonymous ? 'Demo Officer • State Directorate Session' : 'officer@mssds.gov.in');

  const handleLogout = async () => {
    try {
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

  const handleSave = () => {
    showToast('Platform preferences and sync settings updated successfully.');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-space-24 py-space-20 bg-surface-container-lowest border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <BackButton label="Back to Dashboard" to="dashboard" id="settings-back-btn" />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">settings</span>
            <span>State Skill Mission Directorate • Platform Configuration</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            System &amp; Directorate Settings
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Configure integration endpoints, automated Aadhaar biometric attendance sync, EPFO data bridges, and notification preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      <div className="p-space-24 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Directorate Profile */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">badge</span>
              <span>Officer Profile &amp; Jurisdiction</span>
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-low">
              <div className="flex items-center gap-4">
                <img
                  alt="Officer Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                  src={userAvatar}
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
                <div>
                  <div className="font-bold text-on-surface text-base">{userName}</div>
                  <div className="text-xs text-on-surface-variant font-medium">State Mission Registry • Authenticated Officer</div>
                  <div className="text-xs text-outline mt-0.5">Account ID: {userEmail} • Full Administrative Scope</div>
                </div>
              </div>

              <button
                type="button"
                id="settings-logout-button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant block mb-1">State Department:</span>
                <strong className="text-on-surface font-semibold">Skill Development, Employment &amp; Entrepreneurship</strong>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant block mb-1">Assigned Division:</span>
                <strong className="text-on-surface font-semibold">State Headquarters (All 36 Districts)</strong>
              </div>
            </div>
          </div>

          {/* Integration & Data Pipeline Bridges */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">sync_alt</span>
              <span>Statutory Data Bridges &amp; Automated Sync</span>
            </h3>

            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-on-surface">EPFO Automated Employment Tele-Audit</div>
                  <div className="text-xs text-on-surface-variant">Continuous cross-reference with EPFO universal account numbers</div>
                </div>
                <input
                  type="checkbox"
                  checked={epfoIntegration}
                  onChange={(e) => setEpfoIntegration(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-on-surface">AEBAS Biometric Daily Sync</div>
                  <div className="text-xs text-on-surface-variant">Aadhaar Enabled Biometric Attendance System at 184 centers</div>
                </div>
                <input
                  type="checkbox"
                  checked={biometricSync}
                  onChange={(e) => setBiometricSync(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-on-surface">District Skill Officer Auto-Feed</div>
                  <div className="text-xs text-on-surface-variant">Real-time candidate verification feeds across all 36 districts</div>
                </div>
                <input
                  type="checkbox"
                  checked={districtSync}
                  onChange={(e) => setDistrictSync(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-on-surface">SMS / Email Retention Alerts</div>
                  <div className="text-xs text-on-surface-variant">Automated candidate reminders for 6-mo &amp; 12-mo check-ins</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col gap-3">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <span>SkillTrack Platform Specifications</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-surface-container-low rounded-lg">
              <span className="text-outline block mb-1">Application Version</span>
              <span className="font-bold text-on-surface text-sm">v2.4.0-SIH2026</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg">
              <span className="text-outline block mb-1">State Registry Status</span>
              <span className="font-bold text-emerald-700 text-sm">Online • Live Sync</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg">
              <span className="text-outline block mb-1">Compliant Framework</span>
              <span className="font-bold text-on-surface text-sm">PMKVY 4.0 &amp; NSQF</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg">
              <span className="text-outline block mb-1">Data Retention Law</span>
              <span className="font-bold text-on-surface text-sm">5-Year Audit Mandate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
