import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TraineeProvider, useTrainees } from './context/TraineeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { TraineesPage } from './pages/TraineesPage';
import { TraineeProfilePage } from './pages/TraineeProfilePage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { TrainingAttendancePage } from './pages/TrainingAttendancePage';
import { AssessmentCertificationPage } from './pages/AssessmentCertificationPage';
import { PlacementTrackingPage } from './pages/PlacementTrackingPage';
import { EmploymentTrackingPage } from './pages/EmploymentTrackingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AICareerIntelligencePage } from './pages/AICareerIntelligencePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import skillTrackLogo from './assets/skilltrack-logo.svg';

const MainAppLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { activePage, setActivePage } = useTrainees();
  const [currentPath, setCurrentPath] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/login';
  });

  // Track route changes and prevent accessing protected pages via browser Back button after logout
  useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (!user && path !== '/login') {
          window.history.replaceState(null, '', '/login');
          setCurrentPath('/login');
          return;
        }
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [user]);

  // If unauthenticated, immediately sync URL to /login and prevent viewing any protected route
  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
        setCurrentPath('/login');
      }
    }
  }, [loading, user]);

  // If authenticated and on /login or root, redirect to /dashboard
  useEffect(() => {
    if (!loading && user) {
      if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/')) {
        window.history.replaceState(null, '', '/dashboard');
        setCurrentPath('/dashboard');
        setActivePage('dashboard');
      }
    }
  }, [loading, user, setActivePage]);

  // 1. Loading Splash Screen while Firebase Auth restores session
  // CRITICAL: Prevent flash of protected content while Firebase checks authentication state
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface flex-col gap-5 select-none p-4">
        <div className="flex items-center gap-3 animate-pulse">
          <img
            alt="SkillTrack Logo"
            className="h-10 w-auto object-contain"
            src={skillTrackLogo}
          />
          <div className="flex flex-col">
            <span className="font-bold text-xl text-primary tracking-tight">SkillTrack</span>
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
              State Mission Registry
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container text-xs font-semibold text-on-surface-variant border border-outline-variant/30 shadow-xs">
          <span className="material-symbols-outlined text-base animate-spin text-primary">progress_activity</span>
          <span>Verifying Directorate Session...</span>
        </div>
      </div>
    );
  }

  // 2. PROTECTED ROUTES SECURITY ENFORCEMENT:
  // If NO authenticated Firebase user exists, ALWAYS render the existing Login Page.
  // Under NO circumstances render Dashboard, Settings, Trainees, or any other protected page.
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setActivePage('dashboard');
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/dashboard');
            setCurrentPath('/dashboard');
          }
        }}
      />
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'trainees':
        return <TraineesPage />;
      case 'trainee-profile':
        return <TraineeProfilePage />;
      case 'training':
        return <TrainingAttendancePage />;
      case 'assessment':
        return <AssessmentCertificationPage />;
      case 'placement':
        return <PlacementTrackingPage />;
      case 'employment':
        return <EmploymentTrackingPage />;
      case 'follow-ups':
        return <FollowUpsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'ai-insights':
        return <AICareerIntelligencePage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-on-surface font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Primary Content Region: Offset by sidebar width (16rem/256px) on desktop */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden md:ml-64">
        {/* Global Header */}
        <Header />

        {/* Scrollable Main Workspace: Offset by header height (64px) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-surface pt-16">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Toast Notification */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TraineeProvider>
        <MainAppLayout />
      </TraineeProvider>
    </AuthProvider>
  );
}
