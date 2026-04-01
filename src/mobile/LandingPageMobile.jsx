// src/mobile/LandingPageMobile.jsx

import React, { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero'; 
import CategoriesMobile from './CategoriesMobile'; 
import MapSectionMobile from './MapSectionMobile';
import HospitalityMobile from './HospitalityMobile';
import HotelsMobile from './HotelsMobile';
import GuidesMobile from './GuidesMobile';
import Articles from '../components/Articles';

const LandingPageMobile = () => {
    return (
        <div className="App-mobile">
            {/* 1. HERO */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <Hero />
            </section>

            {/* 2. CATEGORIES */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <CategoriesMobile />
            </section>

            {/* 3. MAP */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <MapSectionMobile />
            </section>

            {/* 4. HOSPITALITY */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <HospitalityMobile />
            </section>

            {/* 5. HOTELS */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <HotelsMobile />
            </section>

            {/* 6. GUIDES */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <GuidesMobile />
            </section>

            {/* 7. ARTICLES */}
            <section style={{ minHeight: '100vh', width: '100%' }}>
                <Articles />
            </section>
        </div>
    );
};

export default LandingPageMobile;
