import React, { ReactNode, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAthleteStore } from './store/athleteStore';

// Error Boundary & Hydration Gate
import AppErrorBoundary from './components/common/AppErrorBoundary';
import ProfileHydrationGate from './components/common/ProfileHydrationGate';

// Lazy-loaded Pages (Code-Split for performance)
const Landing = lazy(() => import('./pages/Landing'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const SportAssessmentPage = lazy(() => import('./pages/SportAssessmentPage'));
const VideoCapture = lazy(() => import('./pages/VideoCapture'));
const Analysis = lazy(() => import('./pages/Analysis'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TrainingPlan = lazy(() => import('./pages/TrainingPlan'));
const RecoveryPlan = lazy(() => import('./pages/RecoveryPlan'));
const Progress = lazy(() => import('./pages/Progress'));

// Components
import MobileTopBar from './components/layout/MobileTopBar';
import MobileBottomNav from './components/layout/MobileBottomNav';

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
    <span className="text-xs text-slate-500 font-mono tracking-wider uppercase">Loading...</span>
  </div>
);

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = useAthleteStore((state) => state.token);
  const isAuthenticated = useAthleteStore((state) => state.isAuthenticated);

  if (!token && !isAuthenticated) {
    return <Navigate to="/onboarding?mode=signin" replace />;
  }

  return <>{children}</>;
};

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] bg-[#07080C] text-[#F1F5F9] flex flex-col w-full selection:bg-white/20 relative">
      <MobileTopBar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-28 md:pb-8">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <ProfileHydrationGate>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/assessment/:sport"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SportAssessmentPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/video"
              element={
                <ProtectedRoute>
                  <VideoCapture />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Analysis />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TrainingPlan />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recovery"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <RecoveryPlan />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Progress />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* Catch-all route to prevent blank screens */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ProfileHydrationGate>
    </AppErrorBoundary>
  );
};

export default App;
