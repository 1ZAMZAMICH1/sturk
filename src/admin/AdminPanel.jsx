// src/admin/AdminPanel.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminPanel.css';
import { Icons } from './AdminIcons';
import DashboardView from './DashboardView';
import CategoriesManager from './pages/CategoriesManager';
import HotelsManager from './pages/HotelsManager';
import RestaurantsManager from './pages/RestaurantsManager';
import GuidesManager from './pages/GuidesManager';
import ArticlesManager from './pages/ArticlesManager';
import MapManager from './pages/MapManager';

const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('dashboard');

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return <DashboardView />;
            case 'categories': return <CategoriesManager />;
            case 'hotels': return <HotelsManager />;
            case 'restaurants': return <RestaurantsManager />;
            case 'guides': return <GuidesManager />;
            case 'articles': return <ArticlesManager />;
            case 'map': return <MapManager />;
            default: return <DashboardView />;
        }
    };

    return (
        <div className="admin-root">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <h2>TURKISTAN <span>ADMIN</span></h2>
                </div>
                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveSection('dashboard')}
                    >
                        <Icons.Dashboard /> Дашборд
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveSection('categories')}
                    >
                        <Icons.Categories /> Категории
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'hotels' ? 'active' : ''}`}
                        onClick={() => setActiveSection('hotels')}
                    >
                        <Icons.Hotels /> Отели
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'restaurants' ? 'active' : ''}`}
                        onClick={() => setActiveSection('restaurants')}
                    >
                        <Icons.Restaurants /> Рестораны
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'guides' ? 'active' : ''}`}
                        onClick={() => setActiveSection('guides')}
                    >
                        <Icons.Guides /> Гиды
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'articles' ? 'active' : ''}`}
                        onClick={() => setActiveSection('articles')}
                    >
                        <Icons.Article /> Статьи
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'map' ? 'active' : ''}`}
                        onClick={() => setActiveSection('map')}
                    >
                        <Icons.Map /> Карта
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-title">
                        <h1>{activeSection.toUpperCase()}</h1>
                    </div>
                    <div className="admin-user-info">
                        <Link to="/" className="admin-view-site">
                            На сайт <Icons.External />
                        </Link>
                    </div>
                </header>

                <div className="admin-content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
