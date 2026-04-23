/* src/App.jsx */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Ленивая загрузка компонентов
const LandingPage = lazy(() => import('./components/LandingPage'));
const LandingPageMobile = lazy(() => import('./mobile/LandingPageMobile'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const CategoryPageMobile = lazy(() => import('./mobile/CategoryPageMobile'));
const HotelsPage = lazy(() => import('./components/HotelsPage'));
const HotelsPageMobile = lazy(() => import('./mobile/HotelsPageMobile'));
const RestaurantsPage = lazy(() => import('./components/RestaurantsPage'));
const RestaurantsPageMobile = lazy(() => import('./mobile/RestaurantsPageMobile'));
const GuidesPage = lazy(() => import('./components/GuidesPage'));
const AdminPanel = lazy(() => import('./admin/AdminPanel'));
const RegionalHistory = lazy(() => import('./components/RegionalHistory'));
const RegionalHistoryMobile = lazy(() => import('./mobile/RegionalHistoryMobile'));
const AIChat = lazy(() => import('./components/AIChat'));

// Простой загрузчик на время подгрузки чанков
const LoadingFallback = () => (
    <div style={{ 
        width: '100vw', 
        height: '100vh', 
        background: '#1a0b05', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
    }}>
        <div className="loader-logo" style={{ color: '#c8a84b', fontSize: '1.5rem', fontFamily: 'serif' }}>
            Turkistan Travel
        </div>
    </div>
);

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={isMobile ? <LandingPageMobile /> : <LandingPage />} />
          <Route path="/category/:id" element={isMobile ? <CategoryPageMobile /> : <CategoryPage />} />
          <Route path="/hotels" element={isMobile ? <HotelsPageMobile /> : <HotelsPage />} />
          <Route path="/restaurants" element={isMobile ? <RestaurantsPageMobile /> : <RestaurantsPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/history" element={isMobile ? <RegionalHistoryMobile /> : <RegionalHistory />} />
        </Routes>
        <AIChat />
      </Suspense>
    </Router>
  );
}

export default App;