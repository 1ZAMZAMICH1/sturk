import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AIChat.css';
import MagicOrbWebGL from './MagicOrbWebGL';

const AIChat = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
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
            {/* МАГИЧЕСКАЯ ТЮРКСКАЯ СФЕРА (Кнопка чата) */}
            <div className={`ai-orb-trigger ${loading ? 'ai-loading' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                
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
