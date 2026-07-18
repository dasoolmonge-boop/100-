import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Главная</span>
      </Link>
      <Link to="/favorites" className={`nav-item ${path === '/favorites' ? 'active' : ''}`}>
        <Heart size={24} />
        <span>Избранное</span>
      </Link>
      <Link to="/cart" className={`nav-item ${path === '/cart' ? 'active' : ''}`}>
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={24} />
          {/* Badge example, could be connected to state */}
          <div className="badge">1</div>
        </div>
        <span>Корзина</span>
      </Link>
      <Link to="/admin" className={`nav-item ${path === '/admin' ? 'active' : ''}`}>
        <User size={24} />
        <span>Профиль</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
