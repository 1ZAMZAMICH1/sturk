/* src/components/TransitionDivider.jsx */

import React from 'react';
import './TransitionDivider.css';

const TransitionDivider = ({ type, nextBg, color }) => {
    const styleVars = {
        '--bg-next': nextBg || '#0a1628',
        '--gold': color || '#c8a84b'
    };

    if (type === 'arch') {
        return (
            <div className="td-root" style={{ 
                ...styleVars, 
                height: '120px', 
                marginTop: '-119px', 
                position: 'relative', 
                zIndex: 100
            }}>
                <svg width="100%" height="100%" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: 'block' }}>
                    <path 
                        fill="var(--bg-next)" 
                        fillRule="evenodd"
                        /* Прямоугольник (рамка) МИНУС ТОТ САМЫЙ ПЕРВЫЙ ГОРБИК */
                        d="M0,0 H1440 V120 H0 Z 
                           M0,120 L0,60 C240,0 480,0 720,60 C960,120 1200,120 1440,60 L1440,120 Z" 
                    />
                </svg>
            </div>
        );
    }

    if (type === 'ornament') {
        return (
            <div className="td-root td-ornament" style={styleVars}>
                <div className="td-ornament-line" />
            </div>
        );
    }

    // Резервный вариант: просто полоса орнамента для разделения других блоков
    return (
        <div className="td-root td-ornament" style={{ ...styleVars, height: '30px', borderTop: 'none' }}>
            <div className="td-ornament-line" style={{ opacity: 0.2 }} />
        </div>
    );
};

export default TransitionDivider;
