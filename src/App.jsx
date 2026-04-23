/* src/App.jsx */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Только Лендинг и Чат грузим сразу, чтобы они были видны мгновенно
import LandingPage from './components/LandingPage';
import LandingPageMobile from './mobile/LandingPageMobile';
import AIChat from './components/AIChat';

// ВСЕ остальные страницы делаем "ленивыми". 
// Т.к. StrictMode отключен, конфликтов с картами (Leaflet) быть не должно.
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

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={isMobile ? <LandingPageMobile /> : <LandingPage />} />
          <Route path="/category/:id" element={isMobile ? <CategoryPageMobile /> : <CategoryPage />} />
          <Route path="/hotels" element={isMobile ? <HotelsPageMobile /> : <HotelsPage />} />
          <Route path="/restaurants" element={isMobile ? <RestaurantsPageMobile /> : <RestaurantsPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/history" element={isMobile ? <RegionalHistoryMobile /> : <RegionalHistory />} />
        </Routes>
      </Suspense>
      <AIChat />
    </Router>
  );
}

export default App;