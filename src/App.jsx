// src/App.js
import Hero from './components/Hero';
import Categories from './components/Categories';
import MapSection from './components/MapSection';
import Hospitality from './components/Hospitality';
import Guides from './components/Guides';
import Articles from './components/Articles';

function App() {
  return (
    <div className="App">
      {/* Первая страница */}
      <section style={{ height: '100vh' }}>
        <Hero />
      </section>

      {/* Вторая страница */}
      <section style={{ height: '100vh' }}>
        <Categories />
      </section>

      {/* Третья страница */}
      <section style={{ height: '100vh' }}>
        <MapSection />
      </section>

      {/* Четвертая страница */}
      <section style={{ height: '100vh' }}>
        <Hospitality />
      </section>

      {/* Пятая страница */}
      <section style={{ height: '100vh' }}>
        <Guides />
      </section>

      {/* Шестая страница */}
      <section style={{ height: '100vh' }}>
        <Articles />
      </section>
    </div>
  );
}

export default App;