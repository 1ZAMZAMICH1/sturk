import React, { useState, useRef } from 'react';
import './Articles.css';

// !!! ВАЖНО: Импортируем картинку. 
// Проверь путь: если assets лежит в папке src, то путь правильный.
// Если assets в public, то импорт не нужен, можно просто писать "/assets/nature.jpg"
import natureImg from '../assets/nature.jpg'; 

const rawData = [
  { 
    id: 1, 
    title: "Открытие сезона Кокпар", 
    date: "27.12.2025", 
    description: "Великая степь оживает. Лучшие всадники соберутся у подножия гор...", 
    category: "Спорт", 
    // Используем переменную natureImg вместо ссылки
    image: natureImg 
  },
  { 
    id: 2, 
    title: "Фестиваль «Голос Умай»", 
    date: "15.01.2026", 
    description: "Этно-музыканты со всего тюркского мира представят новые композиции...", 
    category: "Культура", 
    image: natureImg 
  },
  { 
    id: 3, 
    title: "Обновление коллекции юрт", 
    date: "05.02.2026", 
    description: "Мастера из Кызылорды представили новый метод сборки кереге...", 
    category: "Ремесло", 
    image: natureImg 
  },
  { 
    id: 4, 
    title: "Легенды старого шамана", 
    date: "12.02.2026", 
    description: "Новая рубрика на сайте о забытых мифах и легендах...", 
    category: "Истории", 
    image: natureImg 
  },
  { 
    id: 5, 
    title: "Находка в Береле", 
    date: "20.02.2026", 
    description: "Археологи нашли золото сакского периода...", 
    category: "История", 
    image: natureImg 
  },
  { 
    id: 6, 
    title: "Совет старейшин", 
    date: "01.03.2026", 
    description: "Приняты новые решения касательно развития этно-туризма...", 
    category: "Общество", 
    image: natureImg 
  },
  { 
    id: 7, 
    title: "Праздник Наурыз", 
    date: "22.03.2026", 
    description: "Готовимся к великому дню весеннего равноденствия...", 
    category: "Праздник", 
    image: natureImg 
  },
];

const ITEMS_PER_PAGE = 6;

const Articles = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const newsTopRef = useRef(null);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentArticles = rawData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rawData.length / ITEMS_PER_PAGE);

  const scrollToTop = () => {
    if (newsTopRef.current) {
      newsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    scrollToTop();
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      scrollToTop();
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      scrollToTop();
    }
  };

  return (
    <div className="turkic-news-container" ref={newsTopRef}>
      <header className="news-header">
        <h1 className="news-title">Шежіре</h1>
        <p className="news-subtitle">Страница {currentPage} из {totalPages}</p>
        <div className="header-ornament"></div>
      </header>

      <div className="timeline-wrapper">
        <div className="timeline-line"></div>
        
        {currentArticles.map((article, index) => (
          <div key={article.id} className={`article-card ${index % 2 === 0 ? 'left' : 'right'}`}>
            <div className="timeline-node">
              <div className="node-inner"></div>
            </div>

            <div className="card-content">
              <div className="card-date-wrapper">
                <span className="card-date">{article.date}</span>
              </div>
              <div className="card-body">
                <div className="image-container">
                    <img src={article.image} alt={article.title} />
                    <span className="category-tag">{article.category}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <button className="read-more-btn">
                  Читать далее <span>&#10142;</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-container">
        <button 
          className="page-btn prev" 
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          &#8592; Прошлое
        </button>

        <div className="page-numbers">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button 
          className="page-btn next" 
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Будущее &#8594;
        </button>
      </div>
    </div>
  );
};

export default Articles;