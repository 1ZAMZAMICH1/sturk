/* src/App.jsx */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
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
    </Router>
  );
}

export default App;