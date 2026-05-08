// src/mobile/LandingPageMobile.jsx

import React from 'react';
import { useInView } from 'react-intersection-observer';
import HeroMobile from './HeroMobile';
import HeroMobile2 from './HeroMobile2';
import CategoriesMobile from './CategoriesMobile';
import MapSectionMobile from './MapSectionMobile';
import HospitalityMobile from './HospitalityMobile';
import HotelsMobile from './HotelsMobile';
import GuidesMobile from './GuidesMobile';
import Articles from '../components/Articles';
import TransitionDivider from '../components/TransitionDivider';
import HospitalityBackground from '../components/HospitalityBackground';

const LandingPageMobile = () => {
    // Детекторы видимости, чтобы Hero не работали одновременно
    const { ref: hero1Ref, inView: hero1InView } = useInView({ threshold: 0.1 });
    const { ref: hero2Ref, inView: hero2InView } = useInView({ threshold: 0.1 });

    return (
        <div className="App-mobile">
            {/* 1. HERO (ORIGINAL / ADAPTIVE) */}
            <section ref={hero1Ref} style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
                <HeroMobile isInView={hero1InView} />
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
                <section style={{ width: '100%', position: 'relative' }}>
                    <HospitalityMobile />
                </section>
                <section style={{ width: '100%', position: 'relative' }}>
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

            <TransitionDivider type="ornament" nextBg="#1a0b05" />


        </div>
    );
};

export default LandingPageMobile;
