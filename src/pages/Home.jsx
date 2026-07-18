import { useState, useEffect } from 'react';
import BouquetCard from '../components/BouquetCard';
import { AlignLeft, Search } from 'lucide-react';

const Home = () => {
  const [bouquets, setBouquets] = useState([]);

  useEffect(() => {
    fetch('/api/bouquets')
      .then(res => res.json())
      .then(data => setBouquets(data))
      .catch(console.error);
  }, []);

  return (
    <div className="container">
      <div className="top-header">
        <AlignLeft size={24} />
        <div className="header-title">Around You</div>
        <Search size={24} />
      </div>

      <div className="filter-bar">
        <div className="chip" style={{ background: '#2a303c' }}>
          <span>⇅</span>
        </div>
        <div className="chip">
          Категории <span>⌄</span>
        </div>
        <div className="chip">
          Цветочная подписка
        </div>
      </div>

      <div className="bouquets-grid">
        {bouquets.map(b => (
          <BouquetCard key={b.id} bouquet={b} />
        ))}
        {bouquets.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>Нет доступных букетов</p>
        )}
      </div>
    </div>
  );
};

export default Home;
