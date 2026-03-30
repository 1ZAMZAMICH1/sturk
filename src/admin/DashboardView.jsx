// src/admin/DashboardView.jsx
import React from 'react';

const DashboardView = () => (
    <div className="admin-dashboard">
        <div className="admin-stats-grid">
            <div className="admin-stat-card">
                <span className="stat-label">Всего категорий</span>
                <span className="stat-value">6</span>
                <span className="stat-trend trend-up">Активно</span>
            </div>
            <div className="admin-stat-card">
                <span className="stat-label">Отелей</span>
                <span className="stat-value">12</span>
                <span className="stat-trend trend-up">+2 за месяц</span>
            </div>
            <div className="admin-stat-card">
                <span className="stat-label">Ресторанов</span>
                <span className="stat-value">8</span>
                <span className="stat-trend">Норма</span>
            </div>
            <div className="admin-stat-card">
                <span className="stat-label">Гидов</span>
                <span className="stat-value">15</span>
                <span className="stat-trend trend-up">+3 новых</span>
            </div>
        </div>

        <div className="admin-table-container">
            <div className="admin-table-header">
                <h3>Недавняя активность</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Объект</th>
                        <th>Раздел</th>
                        <th>Дата изменения</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Rixos Turkistan</strong></td>
                        <td>Отели</td>
                        <td>Сегодня, 14:20</td>
                        <td><span style={{ color: 'var(--adm-accent)' }}>Обновлено</span></td>
                    </tr>
                    <tr>
                        <td><strong>Мавзолей Ходжи Ахмеда Ясави</strong></td>
                        <td>Категории</td>
                        <td>Вчера, 10:15</td>
                        <td><span style={{ color: 'var(--adm-accent)' }}>Изменено</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

export default DashboardView;
