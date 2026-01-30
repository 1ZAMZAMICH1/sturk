import Hero from './components/Hero';
import Categories from './components/Categories';
import MapSection from './components/MapSection';
import HospitalityBackground from './components/HospitalityBackground';
import Hospitality from './components/Hospitality';
import Hotels from './components/Hotels';
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

      {/* Объединенный раздел: Еда и Отели */}
      <div className="hospitality-hotels-wrapper" style={{ position: 'relative' }}>
        <HospitalityBackground />

        <section style={{ height: '100vh', position: 'relative', zIndex: 1 }}>
          <Hospitality />
        </section>

        <section style={{ height: '100vh', position: 'relative', zIndex: 1 }}>
          <Hotels />
        </section>
      </div>

      {/* Шестая страница */}
      <section style={{ height: '100vh' }}>
        <Guides />
      </section>

      {/* Седьмая страница */}
      <section style={{ height: '100vh' }}>
        <Articles />
      </section>
    </div>
  );
}

export default App;