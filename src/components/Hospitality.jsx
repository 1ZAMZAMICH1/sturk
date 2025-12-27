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
  ],
  hotels: [
    { id: 2, title: "Karavan", type: "Boutique", size: "small", img: HOTEL_IMG },
    { id: 3, title: "Hampton", type: "Hotel", size: "small", img: HOTEL_IMG },
    { id: 4, title: "Silk Way", type: "Hostel", size: "small", img: HOTEL_IMG },
    { id: 5, title: "Grand", type: "Hotel", size: "small", img: HOTEL_IMG },
    { id: 1, title: "Rixos", type: "Resort", size: "large", img: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/291667636.jpg?k=123456" },
  ]
};

// --- ФОН ---
const DarkAtmosphere = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, -10, 5]} intensity={1.5} color="#ff6600" />
      <Cloud position={[0, -5, -5]} speed={0.1} opacity={0.3} color="#5c2a2a" bounds={[10, 2, 2]} />
      <Sparkles count={250} scale={[15, 10, 5]} size={3} speed={0.3} opacity={0.6} color="#ffcc99" noise={0.5} />
    </>
  );
};

const Hospitality = () => {
  return (
    <div className="hospitality-section">
      
      {/* ФОН */}
      <div className="hosp-canvas-container">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <DarkAtmosphere />
        </Canvas>
        <div className="fabric-texture-overlay"></div>
        <div className="warm-vignette"></div>
      </div>

      <div className="hosp-content">
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="mosaic-col left-mosaic">
          <div className="mosaic-grid">
            {DATA.food.map((item) => (
              <div className={`khan-card ${item.size}`} key={item.id}>
                
                {/* Изображение */}
                <div className="khan-img-box">
                  <img src={item.img} alt={item.title} />
                  <div className="grain-overlay"></div> {/* Эффект шума/старины */}
                </div>

                {/* Декор рамки */}
                <div className="khan-border">
                  <div className="corner c-tl"></div>
                  <div className="corner c-tr"></div>
                  <div className="corner c-bl"></div>
                  <div className="corner c-br"></div>
                </div>

                {/* Текст */}
                <div className="khan-info">
                  <span className="khan-type">{item.type}</span>
                  <h4 className="khan-title">{item.title}</h4>
                </div>
                
              </div>
            ))}
          </div>
        </div>

        {/* РАЗДЕЛИТЕЛЬ */}
        <div className="vertical-divider">
          <div className="divider-line"></div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className="mosaic-col right-mosaic">
          <div className="mosaic-grid">
            {DATA.hotels.map((item) => (
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

      </div>
    </div>
  );
};

export default Hospitality;