import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SkeletonLoader from './components/SkeletonLoader';
import InteractiveCursor from './components/InteractiveCursor';

// Eager-load auth pages (critical path)
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedLayout from './pages/ProtectedLayout';

// Lazy-load all protected pages (code splitting)
const HomePage = lazy(() => import('./pages/HomePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const PostList = lazy(() => import('./pages/PostList'));
const NotesList = lazy(() => import('./pages/NotesList'));
const CreateNote = lazy(() => import('./pages/CreateNote'));
const NoteView = lazy(() => import('./pages/NoteView'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));
const UnitHub = lazy(() => import('./pages/UnitHub'));

const PageFallback = () => (
  <div className="main-content">
    <SkeletonLoader type="title" />
    <SkeletonLoader type="grid" count={3} />
  </div>
);

export default function App() {
  const location = useLocation();

  return (
    <>
      <div className="mesh-gradient"></div>
      <InteractiveCursor />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageFallback />}>
          <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/plans" element={<PricingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/notes" element={<NotesList />} />
            <Route path="/create-note" element={<CreateNote />} />
            <Route path="/notes/:id" element={<NoteView />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/unit-hub/:unitCode" element={<UnitHub />} />
          </Route>
        </Routes>
      </Suspense>
      </AnimatePresence>
    </>
  );
}
