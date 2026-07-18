import { useState } from 'react';

const AdminPanel = ({ initData }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Basic mock authentication header for demo
  // In a real app, send initData and parse telegram_id
  const headers = {
    'Content-Type': 'application/json',
    'x-telegram-id': window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '123' // fallback
  };

  const handleAddBouquet = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/bouquets', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name,
        price: parseInt(price),
        image_url: imageUrl,
        description: '',
        is_hidden: false
      })
    });
    setName('');
    setPrice('');
    setImageUrl('');
    alert('Букет добавлен');
  };

  return (
    <div className="container">
      <div className="top-header">
        <div className="header-title">Панель администратора</div>
      </div>

      <div className="admin-section">
        <h3 style={{ marginBottom: '16px' }}>Добавить букет</h3>
        <form onSubmit={handleAddBouquet}>
          <input 
            type="text" 
            placeholder="Название букета (например: Дофаминовый сет)" 
            className="input" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <input 
            type="number" 
            placeholder="Цена (₽)" 
            className="input" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Ссылка на изображение" 
            className="input" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
          />
          <button type="submit" className="btn">Сохранить</button>
        </form>
      </div>

      <div className="admin-section">
        <h3 style={{ marginBottom: '16px' }}>Управление пользователями</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          (Здесь может быть список пользователей для назначения администраторами и курьерами)
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
