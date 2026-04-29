'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useHistory } from '@/hooks/useHistory';
import { useAuth } from '@/components/providers/AuthProvider';
import { trpc } from '@/lib/trpc';
import '@/styles/App1.css';

// Данные о городах (кухня и достопримечательности с фото)
const citiesData: Record<string, any> = {
  'Москва': {
    cuisine: {
      description: 'В Москве можно попробовать блюда со всей России:',
      items: [
        { name: 'Столичный салат', description: 'Классический салат с курицей, грибами и овощами', image: '/Столичный салат.jpg' },
        { name: 'Блины с икрой', description: 'Тонкие блины с красной или черной икрой', image: '/Блины с икрой.jpg' },
        { name: 'Кулебяка', description: 'Пирог с начинкой из мяса, рыбы или капусты', image: '/Кулебяка.jpg' },
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Москвы:',
      items: [
        { name: 'Красная площадь', description: 'Главная площадь страны', image: '/Красная площадь.jpg' },
        { name: 'Московский Кремль', description: 'Исторический комплекс в центре Москвы', image: '/Кремль.jpg' },
        { name: 'Храм Василия Блаженного', description: 'Яркий символ России', image: '/Храм Василия Блаженного.webp' },
      ]
    }
  },
  'Санкт-Петербург': {
    cuisine: {
      description: 'Петербург славится своей изысканной кухней:',
      items: [
        { name: 'Бефстроганов', description: 'Говядина в сливочном соусе', image: '/Бефстроганов.jpg' },
        { name: 'Корюшка', description: 'Местная рыбка с характерным огуречным ароматом', image: '/Корюшка.jpg' },
        { name: 'Невские пирожки', description: 'Пирожки с разнообразными начинками', image: '/Невские пирожки.webp' },
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Санкт-Петербурга:',
      items: [
        { name: 'Эрмитаж', description: 'Один из крупнейших музеев мира', image: '/Эрмитаж.jpg' },
        { name: 'Петергоф', description: 'Великолепный дворцово-парковый ансамбль', image: '/Петергоф.jpg' },
        { name: 'Исаакиевский собор', description: 'Крупнейший православный храм города', image: '/Исаакиевский собор.jpg' },
      ]
    }
  },
  'Новосибирск': {
    cuisine: {
      description: 'Сибирская кухня с местными особенностями:',
      items: [
        { name: 'Сибирские пельмени', description: 'Пельмени с мясной начинкой', image: '/Сибирские пельмени.webp' },
        { name: 'Омуль', description: 'Байкальская рыба холодного копчения', image: '/Омуль.jpg' },
        { name: 'Медовик', description: 'Традиционный сибирский медовый торт', image: '/Медовик.jpg' },
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Новосибирска:',
      items: [
        { name: 'Новосибирский зоопарк', description: 'Один из крупнейших зоопарков России', image: '/Зоопарк.jpg' },
        { name: 'Оперный театр', description: 'Символ города, крупнейший театр России', image: '/Оперный театр.jpg' },
        { name: 'Бугринский мост', description: 'Вантовый мост через Обь', image: '/Бугринский мост.jpg' },
      ]
    }
  },
  'Екатеринбург': {
    cuisine: {
      description: 'Уральская кухня с местными деликатесами:',
      items: [
        { name: 'Пельмени по-уральски', description: 'Смесь трех видов мяса', image: '/Пельмени по-уральски.jpg' },
        { name: 'Черемуховый пирог', description: 'Традиционный уральский десерт', image: '/Черемуховый пирог.jpg' },
        { name: 'Уральские щи', description: 'Густые щи с мясом и грибами', image: '/Уральские щи.jpg' },
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Екатеринбурга:',
      items: [
        { name: 'Храм на Крови', description: 'Построен на месте расстрела царской семьи', image: '/Храм на Крови.jpg' },
        { name: 'Плотина городского пруда', description: 'Историческое место основания города', image: '/Плотина городского пруда.png' },
        { name: 'Высоцкий небоскреб', description: 'Смотровая площадка с видом на город', image: '/Высоцкий небоскреб.jpeg' },
      ]
    }
  },
  'Нижний Новгород': {
    cuisine: {
      description: 'Традиционная русская кухня с местным колоритом:',
      items: [
        { name: 'Нижегородский окорок', description: 'Особый способ приготовления свинины', image: '/Нижегородский окорок.jpg' },
        { name: 'Блины с припеком', description: 'Блины с начинкой в тесте', image: '/Блины с припеком.jpg' },
        { name: 'Медовуха', description: 'Традиционный славянский напиток', image: '/Медовуха.webp' },
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Нижнего Новгорода:',
      items: [
        { name: 'Нижегородский кремль', description: 'Исторический центр города', image: '/Нижегородский кремль.jpg' },
        { name: 'Чкаловская лестница', description: 'Одна из самых длинных лестниц в России', image: '/Чкаловская лестница.jpg' },
        { name: 'Рождественская улица', description: 'Историческая улица с купеческими особняками', image: '/Рождественская улица.jpg' },
      ]
    }
  },
  'Казань': {
    cuisine: {
      description: 'Татарская кухня с богатыми традициями:',
      items: [
        { name: 'Эчпочмак', description: 'Треугольный пирожок с мясом', image: '/Эчпочмак.png' },
        { name: 'Чак-чак', description: 'Сладкое татарское лакомство с медом', image: '/Чак-чак.jpg' },
        { name: 'Губадия', description: 'Многослойный пирог с творогом и рисом', image: '/Губадия.jpg' },
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Казани:',
      items: [
        { name: 'Казанский кремль', description: 'Объект Всемирного наследия ЮНЕСКО', image: '/Казанский кремль.jpg' },
        { name: 'Мечеть Кул-Шариф', description: 'Главная мечеть Татарстана', image: '/Мечеть Кул-Шариф.jpg' },
        { name: 'Улица Баумана', description: 'Пешеходная улица в историческом центре', image: '/Баумана улица.jpg' },
      ]
    }
  },
  'Челябинск': {
    cuisine: {
      description: 'Южно-уральская кухня с местными особенностями:',
      items: [
        { name: 'Пельмени по-челябински', description: 'С добавлением местных трав', image: '/Пельмени по-челябински.jpg' },
        { name: 'Уральские вареники', description: 'С творогом или картошкой', image: '/Уральские вареники.webp' },
        { name: 'Мед с горных лугов', description: 'Ароматный мед с разнотравья', image: '/Мед.jpg' },
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Челябинска:',
      items: [
        { name: 'Парк Гагарина', description: 'Центральный парк культуры и отдыха', image: '/Парк Гагарина.jpg' },
        { name: 'Кировка', description: 'Пешеходная улица в центре', image: '/Кировка.png' },
        { name: 'Краеведческий музей', description: 'Современный музей с богатой коллекцией', image: '/Музей.jpg' },
      ]
    }
  },
  'Омск': {
    cuisine: {
      description: 'Сибирская кухня с казачьими традициями:',
      items: [
        { name: 'Строганина', description: 'Замороженная рыба тонкими ломтиками', image: '/Строганина.jpg' },
        { name: 'Сибирские пельмени', description: 'С мясом и местными травами', image: '/Сибирские пельмени.jpeg' },
        { name: 'Омуль на рожне', description: 'Рыба на открытом огне', image: '/Омуль на Рожне.jpg' },
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Омска:',
      items: [
        { name: 'Омская крепость', description: 'Историческое место основания города', image: '/Омская крепость.jpg' },
        { name: 'Успенский собор', description: 'Главный православный храм', image: '/Успенский собор.jpg' },
        { name: 'Площадь Ленина', description: 'Центральная площадь города', image: '/Площадь Ленина.jpg' },
      ]
    }
  },
  'Ростов-на-Дону': {
    cuisine: {
      description: 'Донская кухня с казачьими традициями:',
      items: [
        { name: 'Уха по-донски', description: 'Рыбный суп с томатами', image: '/Уха по-донски.jpg' },
        { name: 'Раки', description: 'Отварные речные раки', image: '/Раки.jpg' },
        { name: 'Домашние вина', description: 'Вино из местных виноградников', image: '/Домашние вина.jpg' },
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Ростова-на-Дону:',
      items: [
        { name: 'Набережная Дона', description: 'Любимое место прогулок', image: '/Набережная дона.jpg' },
        { name: 'Парк Горького', description: 'Центральный парк культуры', image: '/Парк Горького.jpg' },
        { name: 'Собор Рождества', description: 'Главный православный храм', image: '/Собор Рождества.jpg' },
      ]
    }
  }
};

export default function CityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { goBack } = useHistory();
  
  const cityName = decodeURIComponent(params.cityName as string);
  const category = searchParams.get('category');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [newFeedback, setNewFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { user } = useAuth();
  
  const { data: cityFromDb } = trpc.city.getByName.useQuery(cityName);
  
  const { data: isFavorite, refetch: refetchFavorite } = trpc.favorites.isFavorite.useQuery(
    { cityId: cityFromDb?.id || 0 },
    { enabled: !!user && !!cityFromDb }
  );
  
  const addFavorite = trpc.favorites.add.useMutation({
    onSuccess: () => refetchFavorite(),
  });
  
  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: () => refetchFavorite(),
  });
  
  const { data: existingFeedbacks, refetch: refetchFeedbacks } = trpc.feedback.getByCity.useQuery(
    { cityId: cityFromDb?.id || 0 },
    { enabled: !!cityFromDb }
  );
  
  const addFeedback = trpc.feedback.add.useMutation({
    onSuccess: () => {
      refetchFeedbacks();
      setNewFeedback('');
      setRating(5);
      setShowFeedbackForm(false);
      alert('✨ Спасибо за отзыв!');
    },
  });
  
  const cityData = citiesData[cityName];
  
  const handleToggleFavorite = () => {
    if (!user) {
      alert('Войдите в систему');
      router.push('/auth');
      return;
    }
    if (cityFromDb) {
      if (isFavorite) {
        removeFavorite.mutate({ cityId: cityFromDb.id });
      } else {
        addFavorite.mutate({ cityId: cityFromDb.id });
      }
    }
  };
  
  const handleCategorySelect = (selectedCategory: string) => {
    setCurrentIndex(0);
    router.push(`/citydetails/${encodeURIComponent(cityName)}?category=${selectedCategory}`);
  };
  
  const handleNext = () => {
    if (!cityData) return;
    const items = category === 'Кухня' ? cityData.cuisine.items : cityData.attractions.items;
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };
  
  const handleSubmitFeedback = () => {
    if (!user) {
      alert('Войдите в систему');
      router.push('/auth');
      return;
    }
    if (newFeedback.trim().length < 5) {
      alert('Минимум 5 символов');
      return;
    }
    if (cityFromDb) {
      addFeedback.mutate({ cityId: cityFromDb.id, message: newFeedback, rating });
    }
  };
  
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Дата не указана';
    return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  
  const getImageUrl = (imagePath: string, itemName: string) => {
    if (imgError[imagePath]) {
      return `https://placehold.co/400x300/667eea/white?text=${encodeURIComponent(itemName)}`;
    }
    return imagePath;
  };
  
  if (!cityData) {
    return (
      <div className="city-page">
        <h1>Информация о городе временно недоступна</h1>
        <button onClick={goBack} className="action-button secondary">← Назад</button>
      </div>
    );
  }
  
  // Если категория не выбрана - показываем кнопки выбора
  if (!category) {
    return (
      <div className="city-page">
        <h1>{cityName}</h1>
        
        <div className="button-group">
          <button onClick={handleToggleFavorite} className={`action-button ${isFavorite ? 'favorite' : ''}`}>
            {isFavorite ? '★ В избранном' : '☆ Добавить в избранное'}
          </button>
        </div>
        
        <div className="content-section">
          <h3 style={{ textAlign: 'center' }}>Что вас интересует?</h3>
          <div className="button-group" style={{ marginTop: '20px' }}>
            <button onClick={() => handleCategorySelect('Кухня')} className="action-button">
              🍽️ Кухня
            </button>
            <button onClick={() => handleCategorySelect('Достопримечательности')} className="action-button">
              🏛️ Достопримечательности
            </button>
          </div>
        </div>
        
        <div className="city-footer-buttons">
          <button onClick={goBack} className="action-button secondary">← Назад</button>
          <button onClick={() => router.push(`/calendar/${encodeURIComponent(cityName)}`)} className="action-button">
            📅 Календарь
          </button>
        </div>
      </div>
    );
  }
  
  // Если категория выбрана - показываем контент
  const renderContent = () => {
    if (category === 'Кухня') {
      const items = cityData.cuisine.items;
      const currentItem = items[currentIndex];
      return (
        <div className="content-section">
          <h3>🍽️ Кухня {cityName}</h3>
          <p>{cityData.cuisine.description}</p>
          <div className="item-card">
            <h4>{currentItem.name}</h4>
            <p>{currentItem.description}</p>
            <img
              src={getImageUrl(currentItem.image, currentItem.name)}
              alt={currentItem.name}
              className="item-image"
              onError={() => setImgError(prev => ({ ...prev, [currentItem.image]: true }))}
            />
          </div>
          <div className="centered-button-container">
            <button onClick={handleNext} className="next-button">
              Следующее блюдо →
            </button>
          </div>
        </div>
      );
    }
    
    if (category === 'Достопримечательности') {
      const items = cityData.attractions.items;
      const currentItem = items[currentIndex];
      return (
        <div className="content-section">
          <h3>🏛️ Достопримечательности {cityName}</h3>
          <p>{cityData.attractions.description}</p>
          <div className="item-card">
            <h4>{currentItem.name}</h4>
            <p>{currentItem.description}</p>
            <img
              src={getImageUrl(currentItem.image, currentItem.name)}
              alt={currentItem.name}
              className="item-image"
              onError={() => setImgError(prev => ({ ...prev, [currentItem.image]: true }))}
            />
          </div>
          <div className="centered-button-container">
            <button onClick={handleNext} className="next-button">
              Следующая достопримечательность →
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="city-page">
      <h1>{cityName}</h1>
      
      <div className="button-group">
        <button onClick={handleToggleFavorite} className={`action-button ${isFavorite ? 'favorite' : ''}`}>
          {isFavorite ? '★ В избранном' : '☆ Добавить в избранное'}
        </button>
      </div>
      
      <div className="button-group">
        <button 
          onClick={() => handleCategorySelect('Кухня')} 
          className={category === 'Кухня' ? 'action-button active' : 'action-button'}
        >
          🍽️ Кухня
        </button>
        <button 
          onClick={() => handleCategorySelect('Достопримечательности')} 
          className={category === 'Достопримечательности' ? 'action-button active' : 'action-button'}
        >
          🏛️ Достопримечательности
        </button>
      </div>
      
      {renderContent()}
      
      {/* Отзывы */}
      <div className="reviews-section">
        <h3>📝 Отзывы</h3>
        
        {!showFeedbackForm ? (
          <button onClick={() => setShowFeedbackForm(true)} className="action-button">✍️ Оставить отзыв</button>
        ) : (
          <div className="feedback-form">
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value={5}>⭐⭐⭐⭐⭐ Отлично</option>
              <option value={4}>⭐⭐⭐⭐ Хорошо</option>
              <option value={3}>⭐⭐⭐ Средне</option>
              <option value={2}>⭐⭐ Плохо</option>
              <option value={1}>⭐ Ужасно</option>
            </select>
            <textarea value={newFeedback} onChange={(e) => setNewFeedback(e.target.value)} placeholder="Ваш отзыв..." rows={3} />
            <div className="button-group">
              <button onClick={handleSubmitFeedback} className="action-button">Отправить</button>
              <button onClick={() => setShowFeedbackForm(false)} className="action-button secondary">Отмена</button>
            </div>
          </div>
        )}
        
        <div className="reviews-list">
          {existingFeedbacks?.map((review: any) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <strong>{review.userName}</strong>
                <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
              <p>{review.message}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="city-footer-buttons">
        <button onClick={goBack} className="action-button secondary">← Назад</button>
        <button onClick={() => router.push(`/calendar/${encodeURIComponent(cityName)}`)} className="action-button">
          📅 Календарь
        </button>
      </div>
    </div>
  );
}