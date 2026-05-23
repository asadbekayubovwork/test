import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { isAuthenticated } from './lib/api/client';
import { useUserStore } from './lib/stores';
import { TabBar } from './components/ui';
import { useTelegram } from './lib/telegram/index';
import { useSessionTracking } from './lib/hooks/useSessionTracking';

// Tracks active session time and POSTs to /api/v1/analytics/sessions
// Must be inside TelegramProvider (uses useTelegram for auth state)
const SessionTracker = () => {
  const { isAuthenticating } = useTelegram();
  useSessionTracking(isAuthenticating);
  return null;
};

// Pulls account state once auth is ready. Subscription is included in UserResponse
// (/api/v1/users/me) when active. Without this, every gating check would default
// to "free" until a page that explicitly fetches account data mounts.
const SubscriptionSyncer = () => {
  const { pathname } = useLocation();
  const { isAuthenticating } = useTelegram();
  const refreshAccount = useUserStore((s) => s.refreshAccount);

  // Don't sync on auth pages
  const isAuthPage = ['/login', '/register', '/onboarding'].some(p => pathname.startsWith(p));

  useEffect(() => {
    if (isAuthPage) return;
    if (isAuthenticating) return;
    if (!isAuthenticated()) return;
    refreshAccount();
  }, [
    pathname,
    isAuthPage,
    isAuthenticating,
    refreshAccount,
  ]);

  return null;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Pages
import Home from './pages/Home';
import Courses from './pages/Courses';
import Friends from './pages/Friends';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Flashcards from './pages/Flashcards';
import Tests from './pages/Tests';
import Pomodoro from './pages/Pomodoro';
import Games from './pages/Games';
import DailyChallenge from './pages/Games/DailyChallenge';
import WordRush from './pages/Games/WordRush';
import OctoMemory from './pages/Games/OctoMemory';
import Shop from './pages/Shop';
import CourseDetail from './pages/CourseDetail';
import FriendDetail from './pages/FriendDetail';
import UnitDetail from './pages/UnitDetail';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Match from './pages/Match';
import Write from './pages/Write';
import Favorites from './pages/Favorites';
import Statistics from './pages/Statistics';
import Subscription from './pages/Subscription';

// Protected route that redirects to login if not authenticated
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

// Protected route that redirects to onboarding if not completed
// localStorage is synchronous — read it directly, no useEffect/null flash needed
const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const isCompleted = localStorage.getItem('wordzen_onboarding_completed') === 'true';
  const location = useLocation();

  // Not completed, redirect to onboarding
  if (!isCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <SessionTracker />
      <SubscriptionSyncer />
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Auth Routes - No TabBar */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main App Routes - Wrapped with RequireAuth and RequireOnboarding */}
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <RequireOnboarding>
                    <Routes>
                    {/* Main Tab Routes */}
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/friends/:id" element={<FriendDetail />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* Secondary Routes */}
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/unit/:unitId" element={<UnitDetail />} />
                    <Route path="/unit/:unitId/flashcards" element={<Flashcards />} />
                    <Route path="/unit/:unitId/test" element={<Tests />} />
                    <Route path="/unit/:unitId/match" element={<Match />} />
                    <Route path="/unit/:unitId/write" element={<Write />} />
                    <Route path="/flashcards" element={<Flashcards />} />
                    <Route path="/flashcards/:courseId" element={<Flashcards />} />
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/tests/:testId" element={<Tests />} />
                    <Route path="/pomodoro" element={<Pomodoro />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/games/daily-challenge" element={<DailyChallenge />} />
                    <Route path="/games/word-rush" element={<WordRush />} />
                    <Route path="/games/octo-memory" element={<OctoMemory />} />
                    <Route path="/games/:gameId" element={<Games />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/subscription" element={<Subscription />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/favorites/:courseId" element={<Favorites />} />
                    <Route path="/statistics" element={<Statistics />} />
                    </Routes>
                    {/* Bottom Tab Bar - Only shows after onboarding */}
                    <TabBar />
                  </RequireOnboarding>
                </RequireAuth>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}

export default App;
