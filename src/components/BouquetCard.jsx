import { Heart } from 'lucide-react';

const BouquetCard = ({ bouquet }) => {
  return (
    <div className="bouquet-card">
      <div className="card-image-wrapper">
        <img 
          src={bouquet.image_url || 'https://via.placeholder.com/150'} 
          alt={bouquet.name} 
          className="card-image"
        />
        <button className="fav-btn">
          <Heart size={16} color="white" />
        </button>
      </div>
      <div className="card-price">{bouquet.price} ₽</div>
      <div className="card-title">{bouquet.name}</div>
    </div>
  );
};

export default BouquetCard;
