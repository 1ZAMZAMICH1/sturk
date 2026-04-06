import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Articles.css';
import { Icons } from '../admin/AdminIcons';
import { fetchSheetData } from '../services/api';

const ArticleModal = ({ article, onClose }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="art-modal-overlay" onClick={onClose}>
      <div className="art-modal-inner shepherd-style" onClick={e => e.stopPropagation()}>
        <div className="art-modal-frame-top"></div>
        <button className="art-modal-close-gold" onClick={onClose}>
           <span>×</span>
        </button>

        <div className="art-modal-scroll-area">
          <div className="art-modal-hero-mini">
            <img src={article.image} alt={article[`title_${i18n.language}`] || article.title_ru || article.title} />
            <div className="art-modal-hero-overlay" />
          </div>

          <div className="art-modal-body-neat">
            <div className="art-modal-header-info">
              <span className="art-modal-tag">{article.category}</span>
              <span className="art-modal-date-mini">{article.date}</span>
            </div>
            
            <h2 className="art-modal-title-neat">{article[`title_${i18n.language}`] || article.title_ru || article.title}</h2>
            
            <div className="art-modal-divider">
              <div className="div-line"></div>
              <div className="div-diamond"></div>
              <div className="div-line"></div>
            </div>

            <div className="art-modal-text-neat">
              {article[`content_${i18n.language}`] || article.content_ru || article.content}
            </div>

            {article.gallery && article.gallery.length > 0 && (
              <div className="art-modal-gallery-compact">
                {article.gallery.map((url, i) => (
                  <div key={i} className="gallery-img-frame">
                    <img src={url} alt="" />
                  </div>
                ))}
              </div>
            )}
            
            <div className="art-modal-footer-ornament">
              <span>{t('articles.author_label', { name: article.author })}</span>
            </div>
          </div>
        </div>
        <div className="art-modal-frame-bottom"></div>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 6;

const Articles = () => {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const newsTopRef = useRef(null);

  useEffect(() => {
    const loadArticles = async () => {
      const data = await fetchSheetData('articles');
      setArticles(data);
      setLoading(false);
    };
    loadArticles();
  }, []);

  if (loading) return <div className="loading-state">{t('articles.loading')}</div>;

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentArticles = articles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);

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
    <div className="turkic-news-container">

      <header className="news-header">
        <h1 className="news-title">{t('articles.title')}</h1>
        <p className="news-subtitle">{t('articles.page_info', { current: currentPage, total: totalPages })}</p>
        <div className="header-ornament"></div>
      </header>

      <div className="timeline-wrapper">
        <div className="timeline-line"></div>

        {currentArticles.map((article, index) => {
          const localizedTitle = article[`title_${i18n.language}`] || article.title_ru || article.title;
          const localizedExcerpt = article[`excerpt_${i18n.language}`] || article.excerpt_ru || article.excerpt;
          return (
            <div key={article.id} className={`article-card ${index % 2 === 0 ? 'left' : 'right'}`} onClick={() => setSelectedArticle(article)}>
              <div className="timeline-node">
                <div className="node-inner"></div>
              </div>

              <div className="card-content">
                <div className="card-date-wrapper">
                  <span className="card-date">{article.date}</span>
                </div>
                <div className="card-body">
                  <div className="image-container">
                    <img src={article.image} alt={localizedTitle} />
                    <span className="category-tag">{article.category}</span>
                  </div>
                  <h3>{localizedTitle}</h3>
                  <p>{localizedExcerpt}</p>
                  <button className="read-more-btn">
                    {t('articles.read_more')} <span>&#10142;</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {selectedArticle && (
          <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        )}
      </div>

      <div className="pagination-container">
        <button
          className="page-btn prev"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          &#8592; {t('articles.prev')}
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
          {t('articles.next')} &#8594;
        </button>
      </div>
    </div>
  );
};

export default Articles;