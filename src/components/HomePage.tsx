'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

type Climate = 'Умеренный' | 'Континентальный' | 'Резко континентальный' | 'Субтропический';

interface City {
  name: string;
  description: string;
  image: string;
  population: number;
  climate: Climate;
}

const cities: City[] = [
  { name: 'Москва', description: 'Столица России. 🚀', image: '/Москва.webp', population: 12655050, climate: 'Умеренный' },
  { name: 'Санкт-Петербург', description: 'Культурная столица. 🎭', image: '/Питер.jpg', population: 5392992, climate: 'Умеренный' },
  { name: 'Новосибирск', description: 'Третий по населению город России. 🏙️', image: '/Новосиб.webp', population: 1625631, climate: 'Резко континентальный' },
  { name: 'Екатеринбург', description: 'Город на границе Европы и Азии. 🌍', image: '/Екатеринбург.jpg', population: 1493749, climate: 'Континентальный' },
  { name: 'Нижний Новгород', description: 'Исторический и культурный центр. 📖', image: '/Нижний.webp', population: 1244251, climate: 'Умеренный' },
  { name: 'Казань', description: 'Город с уникальным культурным наследием. 🕌', image: '/Казань.jpg', population: 1257391, climate: 'Умеренный' },
  { name: 'Челябинск', description: 'Известен своей металлообработкой. ⚙️', image: '/Челябинск.jpg', population: 1202371, climate: 'Континентальный' },
  { name: 'Омск', description: 'Крупный культурный центр Сибири. 🎨', image: '/Омск.jpg', population: 1125695, climate: 'Резко континентальный' },
  { name: 'Ростов-на-Дону', description: 'Южная столица России. 🌞', image: '/Ростов.jpg', population: 1137704, climate: 'Субтропический' },
];

const climates: Climate[] = ['Умеренный', 'Континентальный', 'Резко континентальный', 'Субтропический'];

const HomePage: React.FC = () => {
  const router = useRouter();
  
  // Восстанавливаем состояние из localStorage при загрузке
  const [name, setName] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [populationFilter, setPopulationFilter] = useState<[number, number]>([0, 15000000]);
  const [climateFilter, setClimateFilter] = useState<Climate[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Загрузка сохраненного состояния при монтировании
  useEffect(() => {
    const savedStep = localStorage.getItem('currentStep');
    const savedName = localStorage.getItem('userName');
    const savedSearchTerm = localStorage.getItem('searchTerm');
    const savedPopulationMin = localStorage.getItem('populationMin');
    const savedPopulationMax = localStorage.getItem('populationMax');
    const savedClimateFilter = localStorage.getItem('climateFilter');
    const savedSortOrder = localStorage.getItem('sortOrder');
    
    if (savedStep) setStep(parseInt(savedStep));
    if (savedName) setName(savedName);
    if (savedSearchTerm) setSearchTerm(savedSearchTerm);
    if (savedPopulationMin) setPopulationFilter([parseInt(savedPopulationMin), populationFilter[1]]);
    if (savedPopulationMax) setPopulationFilter([populationFilter[0], parseInt(savedPopulationMax)]);
    if (savedClimateFilter) setClimateFilter(JSON.parse(savedClimateFilter));
    if (savedSortOrder) setSortOrder(savedSortOrder as 'asc' | 'desc');
  }, []);

  // Сохранение состояния при изменении
  useEffect(() => {
    localStorage.setItem('currentStep', step.toString());
    if (name) localStorage.setItem('userName', name);
    localStorage.setItem('searchTerm', searchTerm);
    localStorage.setItem('populationMin', populationFilter[0].toString());
    localStorage.setItem('populationMax', populationFilter[1].toString());
    localStorage.setItem('climateFilter', JSON.stringify(climateFilter));
    localStorage.setItem('sortOrder', sortOrder);
  }, [step, name, searchTerm, populationFilter, climateFilter, sortOrder]);

  const filteredCities = cities
    .filter(city => {
      const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPopulation = city.population >= populationFilter[0] && city.population <= populationFilter[1];
      const matchesClimate = climateFilter.length === 0 || climateFilter.includes(city.climate);
      return matchesSearch && matchesPopulation && matchesClimate;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (name) setStep(1);
  };

  const handleNext = () => setStep(2);
  const handleCitySelect = (cityName: string) => router.push(`/city/${encodeURIComponent(cityName)}`);
  const handleBack = () => step > 0 ? setStep(step - 1) : router.push('/');
  const handleClear = () => {
    setName('');
    localStorage.removeItem('userName');
  };
  
  const toggleClimateFilter = (climate: Climate) => {
    setClimateFilter(prev =>
      prev.includes(climate) ? prev.filter(c => c !== climate) : [...prev, climate]
    );
  };

  return (
    <div className="homepage">
      {step === 0 ? (
        <div className="welcome-container">
          <h1 className="welcome-title">Добро пожаловать в "Туризм по крупным городам России!" 🌍</h1>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Введите ваше имя" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="name-input" 
            />
            <button type="submit" className="action-button">Введите</button>
          </form>
          <button onClick={handleClear} className="action-button secondary">Стереть</button>
        </div>
      ) : step === 1 ? (
        <div className="greeting-container">
          <h1 className="greeting-text">Приветствую тебя, {name}! 👋</h1>
          <div className="button-group">
            <button onClick={handleNext} className="action-button">Далее</button>
            <button onClick={handleBack} className="action-button secondary">Назад</button>
          </div>
        </div>
      ) : (
        <div className="city-selection-container">
          <h1 className="section-title">Выберите город</h1>
          <div className="filters">
            <div className="filter-group">
              <input 
                type="text" 
                placeholder="Поиск по названию города" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="filter-input" 
              />
            </div>
            <div className="filter-row">
              <div className="filter-option">
                <label className="filter-label">Сортировка: </label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} 
                  className="filter-select"
                >
                  <option value="asc">А-Я</option>
                  <option value="desc">Я-А</option>
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">
                Численность населения: от {populationFilter[0].toLocaleString()} до {populationFilter[1].toLocaleString()}
              </label>
              <div className="range-sliders">
                <input 
                  type="range" 
                  min="0" 
                  max="15000000" 
                  step="100000" 
                  value={populationFilter[0]} 
                  onChange={(e) => setPopulationFilter([parseInt(e.target.value), populationFilter[1]])} 
                  className="range-slider" 
                />
                <input 
                  type="range" 
                  min="0" 
                  max="15000000" 
                  step="100000" 
                  value={populationFilter[1]} 
                  onChange={(e) => setPopulationFilter([populationFilter[0], parseInt(e.target.value)])} 
                  className="range-slider" 
                />
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">Климат: </label>
              <div className="climate-options">
                {climates.map(climate => (
                  <label key={climate} className="climate-option">
                    <input 
                      type="checkbox" 
                      checked={climateFilter.includes(climate)} 
                      onChange={() => toggleClimateFilter(climate)} 
                    />
                    <span>{climate}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <p className="cities-count">Найдено городов: {filteredCities.length}</p>
          <div className="city-grid">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <div key={city.name} className="city-item">
                  <h2 className="city-name">{city.name}</h2>
                  {city.image && <img src={city.image} alt={city.name} className="city-image" />}
                  <p className="city-info">Население: {city.population.toLocaleString()}</p>
                  <p className="city-info">Климат: {city.climate}</p>
                  <button onClick={() => handleCitySelect(city.name)} className="city-button">Подробнее</button>
                </div>
              ))
            ) : (
              <p className="no-cities">Городы не найдены. Попробуйте изменить критерии поиска.</p>
            )}
          </div>
          <div className="button-group">
            <button 
              onClick={() => router.push('/favorites?returnUrl=/')}
              className="action-button"
            >
              Мои избранные города
            </button>
            <button onClick={() => router.push('/feedback')} className="action-button">Форма отзыва</button>
            <button onClick={handleBack} className="action-button secondary">Назад</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;