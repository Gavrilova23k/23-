'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Dish {
  name: string;
  description: string;
  image: string;
}

interface Attraction {
  name: string;
  description: string;
  image: string;
}

interface CityInfo {
  name: string;
  cuisine: {
    description: string;
    dishes: Dish[];
  };
  attractions: {
    description: string;
    places: Attraction[];
  };
}

const citiesInfo: Record<string, CityInfo> = {
  'Москва': {
    name: 'Москва',
    cuisine: {
      description: 'В Москве можно попробовать блюда со всей России:',
      dishes: [
        {
          name: 'Столичный салат',
          description: 'Классический салат с курицей, грибами и овощами',
          image: '/Столичный салат.jpg'
        },
        {
          name: 'Блины с икрой',
          description: 'Тонкие блины с красной или черной икрой',
          image: '/Блины с икрой.jpg'
        },
        {
          name: 'Кулебяка',
          description: 'Пирог с начинкой из мяса, рыбы или капусты',
          image: '/Кулебяка.jpg'
        }
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Москвы:',
      places: [
        {
          name: 'Красная площадь',
          description: 'Главная площадь страны',
          image: '/Красная площадь.jpg'
        },
        {
          name: 'Кремль',
          description: 'Исторический комплекс в центре Москвы',
          image: '/Кремль.jpg'
        },
        {
          name: 'Храм Василия Блаженного',
          description: 'Яркий символ России',
          image: '/Храм Василия Блаженного.webp'
        }
      ]
    }
  },
  'Санкт-Петербург': {
    name: 'Санкт-Петербург',
    cuisine: {
      description: 'Петербург славится своей изысканной кухней:',
      dishes: [
        {
          name: 'Бефстроганов',
          description: 'Говядина в сливочном соусе',
          image: '/Бефстроганов.jpg'
        },
        {
          name: 'Корюшка',
          description: 'Местная рыбка с характерным огуречным ароматом',
          image: '/Корюшка.jpg'
        },
        {
          name: 'Невские пирожки',
          description: 'Пирожки с разнообразными начинками',
          image: '/Невские пирожки.webp'
        }
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Санкт-Петербурга:',
      places: [
        {
          name: 'Эрмитаж',
          description: 'Один из крупнейших музеев мира',
          image: '/Эрмитаж.webp'
        },
        {
          name: 'Петергоф',
          description: 'Великолепный дворцово-парковый ансамбль',
          image: '/Петергоф.jpg'
        },
        {
          name: 'Исаакиевский собор',
          description: 'Крупнейший православный храм города',
          image: '/Исаакиевский собор.jpg'
        }
      ]
    }
  },
  'Новосибирск': {
    name: 'Новосибирск',
    cuisine: {
      description: 'Сибирская кухня с местными особенностями:',
      dishes: [
        {
          name: 'Сибирские пельмени',
          description: 'Пельмени с мясной начинкой, традиционное блюдо',
          image: '/Сибирские пельмени.webp'
        },
        {
          name: 'Омуль',
          description: 'Байкальская рыба холодного копчения',
          image: '/Омуль.jpg'
        },
        {
          name: 'Медовик',
          description: 'Традиционный сибирский медовый торт',
          image: '/Медовик.jpg'
        }
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Новосибирска:',
      places: [
        {
          name: 'Новосибирский зоопарк',
          description: 'Один из крупнейших зоопарков России',
          image: '/Зоопарк.jpg'
        },
        {
          name: 'Оперный театр',
          description: 'Символ города, крупнейший театр России',
          image: '/Оперный театр.jpg'
        },
        {
          name: 'Бугринский мост',
          description: 'Вантовый мост через Обь с уникальной аркой',
          image: '/Бугринский мост.jpg'
        }
      ]
    }
  },
  'Екатеринбург': {
    name: 'Екатеринбург',
    cuisine: {
      description: 'Уральская кухня с местными деликатесами:',
      dishes: [
        {
          name: 'Пельмени по-уральски',
          description: 'Смесь трех видов мяса в нежном тесте',
          image: '/Пельмени по-уральски.jpg'
        },
        {
          name: 'Черемуховый пирог',
          description: 'Традиционный уральский десерт',
          image: '/Черемуховый пирог.jpg'
        },
        {
          name: 'Уральские щи',
          description: 'Густые щи с мясом и грибами',
          image: '/Уральские щи.jpg'
        }
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Екатеринбурга:',
      places: [
        {
          name: 'Храм на Крови',
          description: 'Построен на месте расстрела царской семьи',
          image: '/Храм на Крови.jpg'
        },
        {
          name: 'Плотина городского пруда',
          description: 'Историческое место основания города',
          image: '/Плотина городского пруда.png'
        },
        {
          name: 'Высоцкий небоскреб',
          description: 'Смотровая площадка с видом на город',
          image: '/Высоцкий небоскреб.jpeg'
        }
      ]
    }
  },
  'Нижний Новгород': {
    name: 'Нижний Новгород',
    cuisine: {
      description: 'Традиционная русская кухня с местным колоритом:',
      dishes: [
        {
          name: 'Нижегородский окорок',
          description: 'Особый способ приготовления свинины',
          image: '/Нижегородский окорок.jpg'
        },
        {
          name: 'Блины с припеком',
          description: 'Блины с начинкой, запеченной прямо в тесте',
          image: '/Блины с припеком.jpg'
        },
        {
          name: 'Медовуха',
          description: 'Традиционный славянский слабоалкогольный напиток',
          image: '/Медовуха.webp'
        }
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Нижнего Новгорода:',
      places: [
        {
          name: 'Нижегородский кремль',
          description: 'Исторический центр города',
          image: '/Нижегородский кремль.jpg'
        },
        {
          name: 'Чкаловская лестница',
          description: 'Одна из самых длинных лестниц в России',
          image: '/Чкаловская лестница.jpg'
        },
        {
          name: 'Рождественская улица',
          description: 'Историческая улица с купеческими особняками',
          image: '/Рождественская улица.jpg'
        }
      ]
    }
  },
  'Казань': {
    name: 'Казань',
    cuisine: {
      description: 'Татарская кухня с богатыми традициями:',
      dishes: [
        {
          name: 'Эчпочмак',
          description: 'Треугольный пирожок с мясом и картофелем',
          image: '/Эчпочмак.png'
        },
        {
          name: 'Чак-чак',
          description: 'Сладкое татарское лакомство из теста с медом',
          image: '/Чак-чак.jpg'
        },
        {
          name: 'Губадия',
          description: 'Многослойный пирог с творогом и рисом',
          image: '/Губадия.jpg'
        }
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Казани:',
      places: [
        {
          name: 'Казанский кремль',
          description: 'Объект Всемирного наследия ЮНЕСКО',
          image: '/Казанский кремль.jpg'
        },
        {
          name: 'Мечеть Кул-Шариф',
          description: 'Главная мечеть Татарстана',
          image: '/Мечеть Кул-Шариф.jpg'
        },
        {
          name: 'Баумана улица',
          description: 'Пешеходная улица в историческом центре',
          image: '/Баумана улица.jpg'
        }
      ]
    }
  },
  'Челябинск': {
    name: 'Челябинск',
    cuisine: {
      description: 'Южно-уральская кухня с местными особенностями:',
      dishes: [
        {
          name: 'Пельмени по-челябински',
          description: 'С добавлением местных трав и специй',
          image: '/Пельмени по-челябински.jpg'
        },
        {
          name: 'Уральские вареники',
          description: 'С творогом, картошкой или ягодами',
          image: '/Уральские вареники.webp'
        },
        {
          name: 'Мед с горных лугов',
          description: 'Ароматный мед с разнотравья Южного Урала',
          image: '/Мед.jpg'
        }
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Челябинска:',
      places: [
        {
          name: 'Парк "Гагарина"',
          description: 'Центральный парк культуры и отдыха',
          image: '/Парк Гагарина.jpg'
        },
        {
          name: 'Кировка',
          description: 'Пешеходная улица в центре города',
          image: '/Кировка.png'
        },
        {
          name: 'Челябинский краеведческий музей',
          description: 'Современный музей с богатой коллекцией',
          image: '/Музей.jpg'
        }
      ]
    }
  },
  'Омск': {
    name: 'Омск',
    cuisine: {
      description: 'Сибирская кухня с казачьими традициями:',
      dishes: [
        {
          name: 'Строганина',
          description: 'Замороженная рыба, нарезанная тонкими ломтиками',
          image: '/Строганина.jpg'
        },
        {
          name: 'Сибирские пельмени',
          description: 'С мясом диких животных и местными травами',
          image: '/Сибирские пельмени.jpeg'
        },
        {
          name: 'Омуль на рожне',
          description: 'Рыба, запеченная на открытом огне',
          image: '/Омуль на Рожне.jpg'
        }
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Омска:',
      places: [
        {
          name: 'Омская крепость',
          description: 'Историческое место основания города',
          image: '/Омская крепость.jpg'
        },
        {
          name: 'Успенский собор',
          description: 'Главный православный храм Омска',
          image: '/Успенский собор.jpg'
        },
        {
          name: 'Площадь Ленина',
          description: 'Центральная площадь города',
          image: '/Площадь Ленина.jpg'
        }
      ]
    }
  },
  'Ростов-на-Дону': {
    name: 'Ростов-на-Дону',
    cuisine: {
      description: 'Донская кухня с казачьими традициями:',
      dishes: [
        {
          name: 'Уха по-донски',
          description: 'Рыбный суп с томатами и пряностями',
          image: '/Уха по-донски.jpg'
        },
        {
          name: 'Раки',
          description: 'Отварные речные раки - донской деликатес',
          image: '/Раки.jpg'
        },
        {
          name: 'Домашние вина',
          description: 'Вино из местных виноградников',
          image: '/Домашние вина.jpg'
        }
      ]
    },
    attractions: {
      description: 'Главные достопримечательности Ростова-на-Дону:',
      places: [
        {
          name: 'Набережная Дона',
          description: 'Любимое место прогулок горожан и гостей',
          image: '/Набережная дона.jpg'
        },
        {
          name: 'Парк Горького',
          description: 'Центральный парк культуры и отдыха',
          image: '/Парк Горького.jpg'
        },
        {
          name: 'Собор Рождества Пресвятой Богородицы',
          description: 'Главный православный храм города',
          image: '/Собор Рождества.jpg'
        }
      ]
    }
  }
};

const CityDetails: React.FC = () => {
  const params = useParams<{ cityName: string; category?: string }>();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const cityName = params.cityName;
  const category = params.category;
  
  const city = citiesInfo[cityName || ''];

  if (!city) {
    return <h2>Город не найден</h2>;
  }

  const handleCategorySelect = (selectedCategory: string) => {
    setCurrentIndex(0);
    router.push(`/citydetails/${encodeURIComponent(cityName || '')}/${selectedCategory}`);
  };

  const handleBack = () => {
    router.push(`/city/${encodeURIComponent(cityName || '')}`);
  };

  const handleNext = () => {
    let items: any[] = [];
    if (category === 'Кухня') {
      items = city.cuisine.dishes;
    } else if (category === 'Достопримечательности') {
      items = city.attractions.places;
    }

    if (items.length === 0) return;

    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const renderContent = () => {
    switch (category) {
      case 'Кухня':
        if (city.cuisine.dishes.length === 0) {
          return <p>Нет информации о блюдах</p>;
        }
        
        const currentDish = city.cuisine.dishes[currentIndex];
        return (
          <div className="content-section">
            <h3>Кухня {city.name}</h3>
            <p>{city.cuisine.description}</p>
            
            <div className="item-card">
              <h4>{currentDish.name}</h4>
              <p>{currentDish.description}</p>
              <img 
                src={currentDish.image} 
                alt={currentDish.name} 
                className="item-image"
              />
            </div>
            
            <button 
              onClick={handleNext}
              className="next-button"
            >
              Следующее блюдо →
            </button>
          </div>
        );
        
      case 'Достопримечательности':
        if (city.attractions.places.length === 0) {
          return <p>Нет информации о достопримечательностях</p>;
        }
        
        const currentAttraction = city.attractions.places[currentIndex];
        return (
          <div className="content-section">
            <h3>Достопримечательности {city.name}</h3>
            <p>{city.attractions.description}</p>
            
            <div className="item-card">
              <h4>{currentAttraction.name}</h4>
              <p>{currentAttraction.description}</p>
              <img 
                src={currentAttraction.image} 
                alt={currentAttraction.name} 
                className="item-image"
              />
            </div>
            
            <button 
              onClick={handleNext}
              className="next-button"
            >
              Следующая достопримечательность →
            </button>
          </div>
        );
        
      default:
        return (
          <div className="content-section">
            <h3>Выберите категорию для просмотра информации о городе {city.name}</h3>
          </div>
        );
    }
  };

  return (
    <div className="city-page">
      <h1>{city.name}</h1>
      <h2>Информация о городе:</h2>
      
      <div className="button-group">
        <button onClick={() => handleCategorySelect('Кухня')}>Кухня</button>
        <button onClick={() => handleCategorySelect('Достопримечательности')}>Достопримечательности</button>
      </div>

      {renderContent()}

      <div className="button-group">
        <button onClick={handleBack} className="action-button secondary">Назад</button>
        <button onClick={() => router.push(`/calendar/${encodeURIComponent(cityName || '')}`)} className="action-button">Далее</button>
      </div>
    </div>
  );
};

export default CityDetails;