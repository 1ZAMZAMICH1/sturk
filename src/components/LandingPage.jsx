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

const LazySection = ({ children, height = '100vh', nextBg, type = 'ornament' }) => {
    const { ref, inView } = useInView({ rootMargin: '400px', once: true });
    return (
        <section ref={ref} style={{ minHeight: height, background: inView ? 'transparent' : '#1a0b05' }}>
            {inView ? (
                <>
                    {children}
                    {nextBg && <TransitionDivider type={type} nextBg={nextBg} />}
                </>
            ) : <div style={{ height }} />}
        </section>
    );
};

const LandingPage = () => {
    return (
        <div className="App">
            {/* 1. HERO - Всегда грузим сразу */}
            <section style={{ height: '100vh' }}>
                <Hero />
            </section>

            <TransitionDivider type="ornament" nextBg="#1a0b05" />

            {/* ОСТАЛЬНЫЕ СЕКЦИИ — лениво через Intersection Observer */}
            <LazySection nextBg="#261912">
                <Categories />
            </LazySection>

            <LazySection nextBg="#2a0a0a">
                <MapSection />
            </LazySection>

            <LazySection nextBg="#1a0b05">
                <div className="hospitality-hotels-wrapper" style={{ position: 'relative' }}>
                    <HospitalityBackground />
                    <section style={{ height: '100vh', position: 'relative' }}>
                        <Hospitality />
                    </section>
                    <section style={{ height: '100vh', position: 'relative' }}>
                        <Hotels />
                    </section>
                </div>
            </LazySection>

            <LazySection nextBg="#181614">
                <Guides />
            </LazySection>

            <LazySection>
                <Articles />
            </LazySection>
        </div>
    );
};

export default LandingPage;
