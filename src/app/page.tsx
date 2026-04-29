'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { trpc } from '@/lib/trpc';
import Image from 'next/image';
import '@/styles/cities.css';

type Climate = 'Умеренный' | 'Континентальный' | 'Резко континентальный' | 'Субтропический';

interface City {
  id: number;
  name: string;
  description: string;
  image: string;
  population: number;
  climate: Climate;
}

export default function CitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [populationRange, setPopulationRange] = useState<[number, number]>([0, 15000000]);
  const [selectedClimates, setSelectedClimates] = useState<Climate[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'population'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();
  
  const { data: citiesData, isLoading } = trpc.city.getAll.useQuery({
    search: searchTerm,
    minPopulation: populationRange[0],
    maxPopulation: populationRange[1],
    climates: selectedClimates,
    sortOrder,
  });
  
  const { data: climates } = trpc.city.getClimates.useQuery();

  // Загрузка сохраненных фильтров
  useEffect(() => {
    const savedFilters = localStorage.getItem('cities_filters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      setSearchTerm(filters.searchTerm || '');
      setPopulationRange(filters.populationRange || [0, 15000000]);
      setSelectedClimates(filters.selectedClimates || []);
      setSortBy(filters.sortBy || 'name');
      setSortOrder(filters.sortOrder || 'asc');
      setViewMode(filters.viewMode || 'grid');
    }
    setIsInitialized(true);
  }, []);
  
  // Сохранение фильтров
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cities_filters', JSON.stringify({
        searchTerm,
        populationRange,
        selectedClimates,
        sortBy,
        sortOrder,
        viewMode,
      }));
    }
  }, [searchTerm, populationRange, selectedClimates, sortBy, sortOrder, viewMode, isInitialized]);

  const toggleClimate = (climate: Climate) => {
    if (selectedClimates.includes(climate)) {
      setSelectedClimates(selectedClimates.filter(c => c !== climate));
    } else {
      setSelectedClimates([...selectedClimates, climate]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPopulationRange([0, 15000000]);
    setSelectedClimates([]);
    setSortBy('name');
    setSortOrder('asc');
  };

  // Сортировка городов
  const sortedCities = citiesData ? [...citiesData].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === 'asc'
        ? a.population - b.population
        : b.population - a.population;
    }
  }) : [];

  const formatPopulation = (pop: number) => {
    if (pop >= 1000000) {
      return `${(pop / 1000000).toFixed(1)} млн`;
    }
    return pop.toLocaleString();
  };

  const getClimateIcon = (climate: string) => {
    const icons: Record<string, string> = {
      'Умеренный': '🌿',
      'Континентальный': '🌲',
      'Резко континентальный': '❄️',
      'Субтропический': '🌴',
    };
    return icons[climate] || '🌍';
  };

  if (isLoading) {
    return (
      <div className="cities-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка городов...</p>
      </div>
    );
  }

  return (
    <div className="cities-page">
      <div className="cities-header">
        <div className="cities-title">
          <h1>🏙️ Все города России</h1>
          {user && <p>Добро пожаловать, {user.name}!</p>}
        </div>
        <button 
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? '🔽 Скрыть фильтры' : '🔼 Показать фильтры'}
        </button>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="filters-panel">
          {/* Поиск */}
          <div className="filter-search">
            <input
              type="text"
              placeholder="🔍 Поиск города..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-row">
            {/* Климат */}
            <div className="filter-group">
              <label>🌡️ Климат</label>
              <div className="climate-chips">
                {climates?.map((climate) => (
                  <button
                    key={climate}
                    className={`climate-chip ${selectedClimates.includes(climate as Climate) ? 'active' : ''}`}
                    onClick={() => toggleClimate(climate as Climate)}
                  >
                    {getClimateIcon(climate)} {climate}
                  </button>
                ))}
              </div>
            </div>

            {/* Население */}
            <div className="filter-group">
              <label>👥 Население</label>
              <div className="population-slider">
                <span>{formatPopulation(populationRange[0])}</span>
                <input
                  type="range"
                  min="0"
                  max="15000000"
                  step="500000"
                  value={populationRange[0]}
                  onChange={(e) => setPopulationRange([parseInt(e.target.value), populationRange[1]])}
                />
                <span>—</span>
                <input
                  type="range"
                  min="0"
                  max="15000000"
                  step="500000"
                  value={populationRange[1]}
                  onChange={(e) => setPopulationRange([populationRange[0], parseInt(e.target.value)])}
                />
                <span>{formatPopulation(populationRange[1])}</span>
              </div>
            </div>

            {/* Сортировка */}
            <div className="filter-group">
              <label>📊 Сортировка</label>
              <div className="sort-controls">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'population')}>
                  <option value="name">По названию</option>
                  <option value="population">По населению</option>
                </select>
                <button 
                  className={`sort-order ${sortOrder === 'asc' ? 'asc' : 'desc'}`}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Вид отображения */}
            <div className="filter-group">
              <label>👁️ Вид</label>
              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  ▦ Сетка
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  ≡ Список
                </button>
              </div>
            </div>
          </div>

          {/* Кнопка сброса */}
          <button className="clear-filters" onClick={clearFilters}>
            🗑️ Сбросить все фильтры
          </button>
        </div>
      )}

      {/* Результаты */}
      <div className="cities-results">
        <div className="results-header">
          <span>Найдено: <strong>{sortedCities.length}</strong> городов</span>
          {searchTerm && <span>Поиск: "{searchTerm}"</span>}
        </div>

        {sortedCities.length === 0 ? (
          <div className="no-results">
            <span>🔍</span>
            <p>Ничего не найдено</p>
            <button onClick={clearFilters}>Сбросить фильтры</button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="cities-grid">
            {sortedCities.map((city) => (
              <div key={city.id} className="city-card-new">
                <div className="city-card-image">
                  <img src={city.image} alt={city.name} />
                  <div className="city-card-badge">{getClimateIcon(city.climate)}</div>
                </div>
                <div className="city-card-content">
                  <h3>{city.name}</h3>
                  <p>{city.description}</p>
                  <div className="city-card-stats">
                    <span>👥 {formatPopulation(city.population)}</span>
                    <span>{getClimateIcon(city.climate)} {city.climate}</span>
                  </div>
                  <button 
                    className="city-card-btn"
                    onClick={() => router.push(`/city/${encodeURIComponent(city.name)}`)}
                  >
                    Подробнее →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cities-list">
            {sortedCities.map((city) => (
              <div key={city.id} className="city-list-item" onClick={() => router.push(`/city/${encodeURIComponent(city.name)}`)}>
                <div className="list-item-image">
                  <img src={city.image} alt={city.name} />
                </div>
                <div className="list-item-content">
                  <h4>{city.name}</h4>
                  <p>{city.description}</p>
                  <div className="list-item-tags">
                    <span className="tag">👥 {formatPopulation(city.population)}</span>
                    <span className="tag">{getClimateIcon(city.climate)} {city.climate}</span>
                  </div>
                </div>
                <div className="list-item-arrow">→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}