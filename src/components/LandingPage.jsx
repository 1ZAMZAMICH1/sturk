/* src/components/LandingPage.jsx */

import React from 'react';
import Hero from './Hero';
import Categories from './Categories';
import MapSection from './MapSection';
import HospitalityBackground from './HospitalityBackground';
import Hospitality from './Hospitality';
import Hotels from './Hotels';
import Guides from './Guides';
import Articles from './Articles';
import TransitionDivider from './TransitionDivider';

import { useInView } from '../hooks/useInView';

const LandingPage = () => {
    return (
        <div className="App">
            {/* 1. HERO */}
            <section style={{ height: '100vh' }}>
                <Hero />
            </section>

            <TransitionDivider type="ornament" nextBg="#1a0b05" />

            {/* 2. CATEGORIES */}
            <section style={{ height: '100vh' }}>
                <Categories />
            </section>

            <TransitionDivider type="ornament" nextBg="#261912" />

            {/* 3. MAP */}
            <section style={{ height: '100vh' }}>
                <MapSection />
            </section>

            <TransitionDivider type="ornament" nextBg="#2a0a0a" />

            {/* 4. HOSPITALITY & HOTELS */}
            <div className="hospitality-hotels-wrapper" style={{ position: 'relative' }}>
                <HospitalityBackground />
                <section style={{ height: '100vh', position: 'relative' }}>
                    <Hospitality />
                </section>
                <section style={{ height: '100vh', position: 'relative' }}>
                    <Hotels />
                </section>
            </div>

            <TransitionDivider type="ornament" nextBg="#1a0b05" />

            {/* 5. GUIDES */}
            <section style={{ height: '100vh' }}>
                <Guides />
            </section>

            <TransitionDivider type="ornament" nextBg="#181614" />

            {/* 6. ARTICLES (News) */}
            <section style={{ height: '100vh' }}>
                <Articles />
            </section>
        </div>
    );
};

export default LandingPage;
