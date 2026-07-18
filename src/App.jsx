import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [initData, setInitData] = useState('');
  
  useEffect(() => {
    // Initialize Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      setInitData(window.Telegram.WebApp.initData || '');
      
      // Optionally get user info
      // const user = window.Telegram.WebApp.initDataUnsafe.user;
    }
  }, []);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home initData={initData} />} />
        <Route path="/cart" element={<Cart initData={initData} />} />
        <Route path="/admin" element={<AdminPanel initData={initData} />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
