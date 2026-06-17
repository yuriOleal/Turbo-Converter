import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { LanguageProvider } from './language';
import { ThemeProvider } from './theme';

// Lazy-loaded pages for code splitting
const Home = React.lazy(() => import('./pages/Home'));
const ToolProcessor = React.lazy(() => import('./pages/ToolProcessor'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ErrorBoundary>
                      <Home />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/tool/:toolId"
                  element={
                    <ErrorBoundary>
                      <ToolProcessor />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
