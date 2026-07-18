const Cart = () => {
  return (
    <div className="container">
      <div className="top-header">
        <div className="header-title">Корзина</div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-muted)' }}>
        <p>Ваша корзина пуста</p>
      </div>
    </div>
  );
};

export default Cart;
