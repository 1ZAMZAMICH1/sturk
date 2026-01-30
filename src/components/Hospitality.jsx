import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles, Cloud } from '@react-three/drei';
import './Hospitality.css';

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop";
const HOTEL_IMG = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop";

const DATA = {
  food: [
    { id: 1, title: "Sandyq", type: "Этно-Ресторан", size: "large", img: "https://lh3.googleusercontent.com/p/AF1QipN-Z1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1=s1360-w1360-h1020" },
    { id: 2, title: "Navat", type: "Чайхана", size: "small", img: "https://lh3.googleusercontent.com/p/AF1QipO_y_y_y_y_y_y_y_y_y_y_y_y_y_y_y_y_y_y=s1360-w1360-h1020" },
    { id: 3, title: "Edem", type: "Кофейня", size: "small", img: PLACEHOLDER_IMG },
    { id: 4, title: "Plov Center", type: "Асхана", size: "small", img: PLACEHOLDER_IMG },
    { id: 5, title: "Chai", type: "Лаунж", size: "small", img: PLACEHOLDER_IMG },
  ]
};

const Hospitality = () => {
  return (
    <div className="hospitality-section hospitality-food">
      <div className="hosp-content">
        <div className="mosaic-col left-mosaic">
          <div className="mosaic-grid">
            {DATA.food.map((item) => (
              <div className={`khan-card ${item.size}`} key={item.id}>
                <div className="khan-img-box">
                  <img src={item.img} alt={item.title} />
                  <div className="grain-overlay"></div>
                </div>
                <div className="khan-border">
                  <div className="corner c-tl"></div>
                  <div className="corner c-tr"></div>
                  <div className="corner c-bl"></div>
                  <div className="corner c-br"></div>
                </div>
                <div className="khan-info">
                  <span className="khan-type">{item.type}</span>
                  <h4 className="khan-title">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hosp-text-block right-text">
          <h2 className="hosp-subtitle">Вкус Великого Шелкового Пути</h2>
          <p className="hosp-description">
            Кухня Туркестана — это живая история, вобравшая в себя ароматы степи и изысканность восточных городов.
            От традиционного плова, приготовленного на открытом огне, до современных гастрономических интерпретаций —
            каждое блюдо здесь рассказывает свою легенду. Почувствуйте истинное восточное гостеприимство в лучших заведениях города.
          </p>
          <div className="hosp-ornament"></div>
        </div>
      </div>
    </div>
  );
};

export default Hospitality;