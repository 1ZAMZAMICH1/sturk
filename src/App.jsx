/* src/App.jsx */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Обычные импорты для всех страниц (используются на локалке для стабильности)
import LandingPage from './components/LandingPage';
import LandingPageMobile from './mobile/LandingPageMobile';
import CategoryPage from './components/CategoryPage';
import CategoryPageMobile from './mobile/CategoryPageMobile';
import HotelsPage from './components/HotelsPage';
import HotelsPageMobile from './mobile/HotelsPageMobile';
import RestaurantsPage from './components/RestaurantsPage';
import RestaurantsPageMobile from './mobile/RestaurantsPageMobile';
import GuidesPage from './components/GuidesPage';
import AdminPanel from './admin/AdminPanel';
import RegionalHistory from './components/RegionalHistory';
import RegionalHistoryMobile from './mobile/RegionalHistoryMobile';
import AIChat from './components/AIChat';

// "Ленивые" версии для сервера
const LazyCategoryPage = lazy(() => import('./components/CategoryPage'));
const LazyCategoryPageMobile = lazy(() => import('./mobile/CategoryPageMobile'));
const LazyGuidesPage = lazy(() => import('./components/GuidesPage'));
const LazyAdminPanel = lazy(() => import('./admin/AdminPanel'));
const LazyRegionalHistory = lazy(() => import('./components/RegionalHistory'));
const LazyRegionalHistoryMobile = lazy(() => import('./mobile/RegionalHistoryMobile'));

// Проверяем, находимся ли мы на сервере (Production)
const isProd = import.meta.env.PROD;

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
          {/* На лендинге и страницах с картами всегда используем прямые импорты для стабильности Leaflet */}
          <Route path="/" element={isMobile ? <LandingPageMobile /> : <LandingPage />} />
          <Route path="/hotels" element={isMobile ? <HotelsPageMobile /> : <HotelsPage />} />
          <Route path="/restaurants" element={isMobile ? <RestaurantsPageMobile /> : <RestaurantsPage />} />
          
          {/* Для остальных страниц на сервере используем Lazy, на локалке - обычные */}
          <Route path="/category/:id" element={
            isProd ? (isMobile ? <LazyCategoryPageMobile /> : <LazyCategoryPage />) : (isMobile ? <CategoryPageMobile /> : <CategoryPage />)
          } />
          
          <Route path="/guides" element={isProd ? <LazyGuidesPage /> : <GuidesPage />} />
          <Route path="/admin" element={isProd ? <LazyAdminPanel /> : <AdminPanel />} />
          
          <Route path="/history" element={
            isProd ? (isMobile ? <LazyRegionalHistoryMobile /> : <LazyRegionalHistory />) : (isMobile ? <RegionalHistoryMobile /> : <RegionalHistory />)
          } />
        </Routes>
      </Suspense>
      <AIChat />
    </Router>
  );
}

export default App;