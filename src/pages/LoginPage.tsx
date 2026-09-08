import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrainees } from '../context/TraineeContext';
import skillTrackLogo from '../assets/skilltrack-logo.svg';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { signInWithGoogle, signInAsDemoOfficer, authError, clearAuthError } = useAuth();
  const { showToast, setActivePage } = useTrainees();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState('Dr. Rajesh Shinde (State Mission Director)');

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    clearAuthError();
    try {
      const user = await signInWithGoogle();
      if (user) {
        showToast(`Welcome to SkillTrack, ${user.displayName || user.email || 'Officer'}!`, 'success');
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          setActivePage('dashboard');
        }
      }
    } catch (err: any) {
      // Handled in AuthContext authError
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsDemoLoading(true);
    clearAuthError();
    try {
      const user = await signInAsDemoOfficer(selectedDemoRole);
      if (user) {
        showToast(`Signed in as ${user.displayName || 'State Mission Director'} (Demo Mode)`, 'success');
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          setActivePage('dashboard');
        }
      }
    } catch (err: any) {
      // Handled in AuthContext authError
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface flex flex-col justify-between p-4 sm:p-8 font-sans antialiased text-on-surface">
      {/* Top Directorate Header Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full gap-4">
        <div className="flex items-center gap-3">
          <img
            alt="SkillTrack Logo"
            className="h-9 w-auto object-contain"
            src={skillTrackLogo}
          />
          <div className="flex flex-col">
            <div className="font-bold text-lg text-primary tracking-tight leading-tight">SkillTrack</div>
            <div className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
              State Mission Registry
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container border border-secondary/20 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="hidden sm:inline">Govt of Maharashtra &amp; India •</span>
          <span>SIH 2026 Registry</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md mx-auto my-6 sm:my-10 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-6 sm:p-8 flex flex-col">
        {/* Brand identity inside card */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center mb-3 shadow-sm ring-1 ring-primary/20">
            <img
              alt="SkillTrack Badge"
              className="h-9 w-9 object-contain"
              src={skillTrackLogo}
            />
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            SkillTrack Portal Login
          </h1>
          <p className="text-xs font-medium text-primary uppercase tracking-wider mt-0.5">
            State Mission Registry
          </p>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Unified candidate tracking, post-placement verification, and outcome intelligence portal.
          </p>
        </div>

        {/* Auth Error Notification */}
        {authError && (
          <div className="mb-5 p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-error">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
            <div className="flex-1">
              <p className="font-semibold">{authError}</p>
            </div>
            <button
              type="button"
              onClick={clearAuthError}
              className="text-error/70 hover:text-error text-sm font-bold ml-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Primary Google Sign-In Action */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            id="google-signin-button"
            disabled={isGoogleLoading || isDemoLoading}
            onClick={handleGoogleSignIn}
            className="w-full h-12 px-4 rounded-xl border border-outline-variant/50 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 font-semibold text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isGoogleLoading ? (
              <>
                <span className="material-symbols-outlined text-xl text-primary animate-spin">progress_activity</span>
                <span>Connecting with Google...</span>
              </>
            ) : (
              <>
                {/* Official Google 4-color 'G' icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-on-surface font-semibold text-sm">Sign in with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Prototype / Demo Messaging Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface-container-lowest px-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Prototype &amp; Jury Access
            </span>
          </div>
        </div>

        {/* Demo Officer Role Selector & One-Click Login */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">verified_user</span>
            <span className="text-xs font-semibold text-on-surface">Evaluation &amp; Prototype Mode</span>
          </div>
          <p className="text-[12px] text-on-surface-variant leading-relaxed">
            Connected to real Firebase Authentication. Evaluators can sign in with any Google account or experience the system as a State Mission Director.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Select Demo Officer Profile
            </label>
            <select
              value={selectedDemoRole}
              onChange={(e) => setSelectedDemoRole(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-container-lowest text-xs font-medium text-on-surface border border-outline-variant/30 focus:outline-none cursor-pointer"
            >
              <option value="Dr. Rajesh Shinde (State Mission Director)">Dr. Rajesh Shinde • State Mission Director</option>
              <option value="Smt. Anjali Rao (District Skill Officer)">Smt. Anjali Rao • District Skill Officer</option>
              <option value="Shri Vikram Deshmukh (Placement Auditor)">Shri Vikram Deshmukh • Placement Auditor</option>
            </select>
          </div>

          <button
            type="button"
            id="demo-signin-button"
            disabled={isGoogleLoading || isDemoLoading}
            onClick={handleDemoSignIn}
            className="w-full h-10 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {isDemoLoading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                <span>Authenticating Officer Session...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">login</span>
                <span>Continue with Selected Demo Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Security & Statutory Notice */}
        <div className="mt-5 text-center text-[11px] text-on-surface-variant leading-relaxed">
          <span>Protected by Firebase Authentication. Authorized access only.</span>
          <br />
          <span>Compliant with Aadhaar AEBAS &amp; EPFO statutory privacy mandates.</span>
        </div>
      </main>

      {/* Footer info */}
      <footer className="text-center text-xs text-on-surface-variant max-w-xl mx-auto py-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-on-surface">
          <span>SkillTrack</span>
          <span>•</span>
          <span>State Skill Mission Directorate</span>
          <span>•</span>
          <span>SIH 2026</span>
        </div>
        <div className="text-[11px] text-outline mt-1">
          From Training to Career — Track Every Outcome • Secure Firebase Cloud Session
        </div>
      </footer>
    </div>
  );
};
