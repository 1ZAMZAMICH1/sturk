// src/mobile/LandingPageMobile.jsx

import React, { useState, useEffect, useRef } from 'react';
import HeroMobile from './HeroMobile'; 
import CategoriesMobile from './CategoriesMobile'; 
import MapSectionMobile from './MapSectionMobile';
import HospitalityMobile from './HospitalityMobile';
import HotelsMobile from './HotelsMobile';
import GuidesMobile from './GuidesMobile';
import Articles from '../components/Articles';
import TransitionDivider from '../components/TransitionDivider';

import HospitalityBackground from '../components/HospitalityBackground';

const LandingPageMobile = () => {
    return (
        <div className="App-mobile">
            {/* 1. HERO */}
            <section style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <HeroMobile />
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

            {/* 4 & 5. HOSPITALITY & HOTELS (SHARED BACKGROUND) */}
            <div className="hospitality-hotels-wrapper-mob" style={{ position: 'relative' }}>
                <HospitalityBackground />
                <section style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                    <HospitalityMobile />
                </section>
                <section style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                    <HotelsMobile />
                </section>
            </div>

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
