// src/mobile/LandingPageMobile.jsx

import React, { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero'; 
import CategoriesMobile from './CategoriesMobile'; 
import MapSectionMobile from './MapSectionMobile';
import HospitalityMobile from './HospitalityMobile';
import HotelsMobile from './HotelsMobile';
import GuidesMobile from './GuidesMobile';
import Articles from '../components/Articles';

// Обертка для разгрузки видеопамяти (WebGL)
const LazySection = ({ children, height = '100vh', threshold = 0.5 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <section ref={ref} style={{ minHeight: height, width: '100%', position: 'relative' }}>
      {/* key={isVisible} принудительно убивает все ресурсы внутри при увольнении секции */}
      {isVisible ? <div key="active-canvas">{children}</div> : <div style={{ height }} />}
    </section>
  );
};

const LandingPageMobile = () => {
    return (
        <div className="App-mobile">
            {/* 1. HERO */}
            <LazySection>
                <Hero />
            </LazySection>

            {/* 2. CATEGORIES */}
            <LazySection>
                <CategoriesMobile />
            </LazySection>

            {/* 3. MAP */}
            <LazySection>
                <MapSectionMobile />
            </LazySection>

            {/* 4. HOSPITALITY */}
            <LazySection minHeight="100vh">
                <HospitalityMobile />
            </LazySection>

            {/* 4. HOTELS */}
            <LazySection minHeight="100vh">
                <HotelsMobile />
            </LazySection>

            {/* 5. GUIDES */}
            <LazySection>
                <GuidesMobile />
            </LazySection>

            {/* 6. ARTICLES (Обычный HTML, не требует отсечения) */}
            <section style={{ minHeight: '100vh', width: '100%' }}>
                <Articles />
            </section>
        </div>
    );
};

export default LandingPageMobile;
