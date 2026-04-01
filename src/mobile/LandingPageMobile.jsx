// src/mobile/LandingPageMobile.jsx

import React, { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero'; 
import CategoriesMobile from './CategoriesMobile'; 
import MapSectionMobile from './MapSectionMobile';
import HospitalityMobile from './HospitalityMobile';
import HotelsMobile from './HotelsMobile';
import GuidesMobile from './GuidesMobile';
import Articles from '../components/Articles';
import TransitionDivider from '../components/TransitionDivider';

const LandingPageMobile = () => {
    return (
        <div className="App-mobile">
            {/* 1. HERO */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <Hero />
            </section>

            <TransitionDivider type="ornament" nextBg="#1a0b05" />

            {/* 2. CATEGORIES */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <CategoriesMobile />
            </section>

            <TransitionDivider type="ornament" nextBg="#261912" />

            {/* 3. MAP */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <MapSectionMobile />
            </section>

            <TransitionDivider type="ornament" nextBg="#2a0a0a" />

            {/* 4. HOSPITALITY */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <HospitalityMobile />
            </section>

            {/* 5. HOTELS (NO DIVIDER BEFORE THIS ONE AS PER USER REQUEST) */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <HotelsMobile />
            </section>

            <TransitionDivider type="ornament" nextBg="#1a0b05" />

            {/* 6. GUIDES */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <GuidesMobile />
            </section>

            <TransitionDivider type="ornament" nextBg="#181614" />

            {/* 7. ARTICLES */}
            <section style={{ minHeight: '100vh', width: '100%' }}>
                <Articles />
            </section>
        </div>
    );
};

export default LandingPageMobile;
