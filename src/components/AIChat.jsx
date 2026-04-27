import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AIChat.css';
import MagicOrbWebGL from './MagicOrbWebGL';

const AIChat = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const mobileTuning = {
        orbBottom: 30,
        hudHeight: 97,
        hudBottom: 30
    };

    const isMobile = window.innerWidth < 768;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg,
                    history: messages.slice(-6) 
                })
            });

            const data = await response.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                throw new Error("Empty reply");
            }
        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Извини, что-то пошло не так. Попробуй позже!" }]);
        } finally {
            setLoading(false);
        }
    };

    const formatMessage = (text) => {
        if (!text) return null;
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\n\n/g, '<br/><br/>');
        formatted = formatted.replace(/\n- /g, '<br/>• ');
        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
    };

    return (
        <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
            {/* ═══════════════════ ПОЛНОЭКРАННЫЙ HUD BAR ═══════════════════ */}
            <div className="ai-hud-bar-wrapper" style={isMobile ? { bottom: `${mobileTuning.hudBottom}px` } : {}}>
                <svg
                    className="ai-hud-bar-svg"
                    viewBox="0 -30 1440 130"
                    preserveAspectRatio={isMobile ? "xMidYMax slice" : "xMidYMax meet"}
                    xmlns="http://www.w3.org/2000/svg"
                    style={isMobile ? { height: `${mobileTuning.hudHeight}px` } : {}}
                >
                    <defs>
                        {/* Основной золотой градиент (по горизонтали: тёмный → золото → светлый → золото → тёмный) */}
                        <linearGradient id="hudGold" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%"   stopColor="#1a0f00"/>
                            <stop offset="8%"   stopColor="#7a5010"/>
                            <stop offset="20%"  stopColor="#c8a84b"/>
                            <stop offset="35%"  stopColor="#ffd700"/>
                            <stop offset="50%"  stopColor="#fff5a0"/>
                            <stop offset="65%"  stopColor="#ffd700"/>
                            <stop offset="80%"  stopColor="#c8a84b"/>
                            <stop offset="92%"  stopColor="#7a5010"/>
                            <stop offset="100%" stopColor="#1a0f00"/>
                        </linearGradient>

                        {/* Вертикальный градиент для объёмной панели */}
                        <linearGradient id="hudPanelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%"  stopColor="#4a3510" stopOpacity="0.9"/>
                            <stop offset="40%" stopColor="#1a0f00" stopOpacity="0.97"/>
                            <stop offset="100%" stopColor="#0a0500" stopOpacity="1"/>
                        </linearGradient>

                        {/* Градиент для свечения снизу (магическое) */}
                        <linearGradient id="hudGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%"   stopColor="#00b3ff" stopOpacity="0"/>
                            <stop offset="30%"  stopColor="#00b3ff" stopOpacity="0.15"/>
                            <stop offset="50%"  stopColor="#00cfff" stopOpacity="0.4"/>
                            <stop offset="70%"  stopColor="#00b3ff" stopOpacity="0.15"/>
                            <stop offset="100%" stopColor="#00b3ff" stopOpacity="0"/>
                        </linearGradient>

                        {/* Золотое свечение верхней линии */}
                        <filter id="goldGlow" x="-5%" y="-100%" width="110%" height="350%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>

                        {/* Синее свечение орба */}
                        <filter id="orbGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
                            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>

                        {/* Паттерн геометрический (ромбы) */}
                        <pattern id="hudPattern" x="0" y="0" width="24" height="20" patternUnits="userSpaceOnUse">
                            <polygon points="12,0 24,10 12,20 0,10" fill="none" stroke="#c8a84b" strokeWidth="0.4" opacity="0.3"/>
                        </pattern>

                        {/* Клип прямой*/}
                        <clipPath id="hudClip">
                            <rect x="0" y="0" width="1440" height="100"/>
                        </clipPath>
                    </defs>

                    {/* Фон полностью прозрачный — только линии и декор */}


                    {/* === ТЮРКСКИЕ ДЕКОРАТИВНЫЕ ЭЛЕМЕНТЫ === */}

                    {/* --- ЛЕВЫЙ ОРНАМЕНТАЛЬНЫЙ БЛОК --- */}
                    {/* Скобка-когть L1 */}
                    <path d="M 570 8 L 570 35 Q 570 50, 555 55 L 480 70 Q 460 75, 440 70 L 0 70"
                        fill="none" stroke="url(#hudGold)" strokeWidth="1.5" opacity="0.7"/>
                    {/* Скобка-когть L2 чуть выше */}
                    <path d="M 600 8 L 600 28 Q 600 40, 588 44 L 520 58 Q 505 62, 490 60 L 0 60"
                        fill="none" stroke="#c8a84b" strokeWidth="0.8" opacity="0.45"/>


                    {/* --- ПРАВЫЙ ОРНАМЕНТАЛЬНЫЙ БЛОК (зеркально) --- */}
                    <path d="M 870 8 L 870 35 Q 870 50, 885 55 L 960 70 Q 980 75, 1000 70 L 1440 70"
                        fill="none" stroke="url(#hudGold)" strokeWidth="1.5" opacity="0.7"/>
                    <path d="M 840 8 L 840 28 Q 840 40, 852 44 L 920 58 Q 935 62, 950 60 L 1440 60"
                        fill="none" stroke="#c8a84b" strokeWidth="0.8" opacity="0.45"/>


                    {/* === ЦЕНТРАЛЬНЫЙ АРТЕФАКТ (гнездо шара) === */}
                    {/* Большая центральная арка */}
                    <path d="M 620 8 Q 660 -12, 720 -14 Q 780 -12, 820 8"
                        fill="none" stroke="url(#hudGold)" strokeWidth="3" filter="url(#goldGlow)"/>
                    {/* Внутренняя арка */}
                    <path d="M 640 8 Q 672 -4, 720 -6 Q 768 -4, 800 8"
                        fill="none" stroke="#ffe066" strokeWidth="1.2" opacity="0.6"/>

                    {/* СИНЕЕ ПОДСВЕЧИВАНИЕ УБРАНО ПО ЗАПРОСУ */}

                    {/* Боковые якорные крюки возле шара */}
                    <path d="M 640 8 L 640 30 Q 640 44, 628 48 L 598 58" fill="none" stroke="url(#hudGold)" strokeWidth="2.2" strokeLinecap="round"/>
                    <path d="M 800 8 L 800 30 Q 800 44, 812 48 L 842 58" fill="none" stroke="url(#hudGold)" strokeWidth="2.2" strokeLinecap="round"/>

                    {/* Малые декор. круги у основания крюков */}
                    <circle cx="598" cy="60" r="4" fill="none" stroke="#ffd700" strokeWidth="1.5" opacity="0.8"/>
                    <circle cx="842" cy="60" r="4" fill="none" stroke="#ffd700" strokeWidth="1.5" opacity="0.8"/>

                    {/* Центральный крупный ромб-разделитель */}
                    <polygon points="720,1 730,11 720,21 710,11" fill="#daa520" opacity="0.9" stroke="#fff8b0" strokeWidth="0.8" filter="url(#goldGlow)"/>

                    {/* Малые декор точки по верху */}
                    {[660, 680, 700, 740, 760, 780].map(x => (
                        <circle key={x} cx={x} cy="8" r="1.5" fill="#ffd700" opacity="0.7"/>
                    ))}
                </svg>
            </div>

            {/* МАГИЧЕСКАЯ ТЮРКСКАЯ СФЕРА (Кнопка чата) */}
            <div 
                className={`ai-orb-trigger ${loading ? 'ai-loading' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                style={isMobile ? { bottom: `${mobileTuning.orbBottom}px` } : {}}
            >
                
                {/* 3D Фрактал от Sabosugi (на фоне) */}
                <MagicOrbWebGL />

                {/* Оболочка: чистое строгое золото и выгравированные руны (SVG поверх) */}
                <svg viewBox="0 0 120 120" className="ai-orb-svg" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2 }}>
                    <defs>
                        {/* ИДЕАЛЬНОЕ ЗОЛОТОЕ КОЛЬЦО (Линейный градиент - реалистичный металл) */}
                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   stopColor="#ffd700"/>
                            <stop offset="25%"  stopColor="#b8860b"/>
                            <stop offset="50%"  stopColor="#fff8b0"/>
                            <stop offset="75%"  stopColor="#daa520"/>
                            <stop offset="100%" stopColor="#ffd700"/>
                        </linearGradient>

                        {/* Фильтр свечения рун */}
                        <filter id="runeGlow">
                            <feGaussianBlur stdDeviation="0.4" result="b"/>
                            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>

                        {/* Блик стекла */}
                        <radialGradient id="gloss" cx="34%" cy="28%" r="48%">
                            <stop offset="0%"   stopColor="white" stopOpacity="0.85"/>
                            <stop offset="55%"  stopColor="white" stopOpacity="0.1"/>
                            <stop offset="100%" stopColor="white" stopOpacity="0"/>
                        </radialGradient>

                        {/* Путь для текста (r=46) */}
                        <path id="runeRing" d="M 60 14 a 46 46 0 1 1 -0.01 0" fill="none"/>
                    </defs>

                    {/* Внешний ореол */}
                    <circle cx="60" cy="60" r="58" fill="none" stroke="#daa520" strokeWidth="0.5" opacity="0.4"/>

                    {/* КОЛЬЦО — строгое золото */}
                    <circle cx="60" cy="60" r="49" fill="none" stroke="url(#ringGrad)" strokeWidth="12" />
                    
                    {/* Тонкие грани кольца для объема */}
                    <circle cx="60" cy="60" r="55" fill="none" stroke="#ffe066" strokeWidth="0.8" opacity="0.6"/>
                    <circle cx="60" cy="60" r="43" fill="none" stroke="#6b4c10" strokeWidth="1" opacity="0.8"/>

                    {/* РУНЫ — Выгравированные темные на светлом золоте */}
                    <g className="rune-ring-group">
                        <text fontSize="8.5" fontWeight="900" fill="#362005" filter="drop-shadow(0px 1px 0px rgba(255,255,255,0.4))">
                            <textPath href="#runeRing" startOffset="0%" textLength="289" lengthAdjust="spacing">
                                𐰀𐰣 𐱅𐰇𐰼𐰚 𐰴𐰀𐰍𐰀𐰣 𐱅𐰇𐰼𐰚𐰃𐰾𐱅𐰀𐰣 𐰸𐰆𐱃 𐰀𐰣 𐱅𐰇𐰼𐰚 𐰴𐰀𐰍𐰀𐰣
                            </textPath>
                        </text>
                    </g>
                </svg>
            </div>

            <div className="ai-chat-window">
                <div className="ai-chat-header">
                    <h4>{t('ai.helper_title', 'AI Помощник')}</h4>
                    <span>Online</span>
                </div>

                <div className="ai-chat-messages" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="ai-chat-welcome">
                            <p>Привет! Я искусственный интеллект Turkistan Travel. Могу помочь спланировать маршрут или найти лучший отель. Что тебя интересует?</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`ai-msg ${m.role}`}>
                            <div className="ai-msg-bubble">
                                {m.role === 'assistant' ? formatMessage(m.content) : m.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="ai-msg assistant">
                            <div className="ai-msg-bubble loading">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    )}
                </div>

                <form className="ai-chat-input-area" onSubmit={handleSend}>
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder="Напиши сообщение..."
                    />
                    <button type="submit" disabled={!input.trim() || loading}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChat;
