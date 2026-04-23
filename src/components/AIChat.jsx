import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AIChat.css';

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

    return (
        <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
            <button className="ai-chat-trigger" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                )}
            </button>

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
                                {m.content}
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
