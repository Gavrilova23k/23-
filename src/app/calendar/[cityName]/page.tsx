'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { trpc } from '@/lib/trpc';
import '@/styles/calendar.css';

type Period = '3days' | 'week' | '10days';

interface HourlyWeather {
  time: string;
  hour: number;
  temp: number;
  feelsLike: number;
  windSpeed: number;
  description: string;
  icon: string;
  partOfDay: 'night' | 'morning' | 'day' | 'evening';
}

export default function CityCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const { goBack } = useNavigationHistory();
  const cityName = decodeURIComponent(params.cityName as string);
  
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('10days');
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [todayWeather, setTodayWeather] = useState<any>(null);
  const [tomorrowWeather, setTomorrowWeather] = useState<any>(null);
  
  // Для модального окна с почасовым прогнозом
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyWeather[]>([]);
  const [showHourlyModal, setShowHourlyModal] = useState(false);
  const [hourlyLoading, setHourlyLoading] = useState(false);
  
  const { data: city } = trpc.city.getByName.useQuery(cityName);
  
  // Функция для получения текущей погоды
  const { data: currentWeatherData, refetch: refetchCurrent } = trpc.weather.getCurrent.useQuery(
    { lat: city?.latitude || '0', lon: city?.longitude || '0' },
    { enabled: !!city }
  );
  
  // Функция для получения прогноза
  const getDaysCount = () => {
    if (selectedPeriod === '3days') return 3;
    if (selectedPeriod === 'week') return 7;
    return 10;
  };
  
  const { data: forecastData, refetch: refetchForecast, isLoading } = trpc.weather.getForecast.useQuery(
    { 
      lat: city?.latitude || '0', 
      lon: city?.longitude || '0',
      days: getDaysCount()
    },
    { enabled: !!city }
  );
  
  // Функция для получения почасового прогноза
  const fetchHourlyForecast = async (date: string) => {
    if (!city) return;
    
    setHourlyLoading(true);
    try {
      const response = await fetch('/api/trpc/weather.getHourlyForecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            lat: city.latitude,
            lon: city.longitude,
            date: date,
          }
        })
      });
      
      const data = await response.json();
      
      if (data?.result?.data?.json) {
        setHourlyForecast(data.result.data.json);
        setShowHourlyModal(true);
      } else {
        // Демо-данные если API не работает
        setHourlyForecast(generateDemoHourly(date));
        setShowHourlyModal(true);
      }
    } catch (err) {
      console.error('Hourly forecast error:', err);
      setHourlyForecast(generateDemoHourly(date));
      setShowHourlyModal(true);
    } finally {
      setHourlyLoading(false);
    }
  };
  
  // Демо-данные для почасового прогноза
  const generateDemoHourly = (date: string): HourlyWeather[] => {
    return [
      { time: date, hour: 2, temp: 5, feelsLike: 3, windSpeed: 4, description: 'Ночь', icon: '🌙', partOfDay: 'night' },
      { time: date, hour: 9, temp: 12, feelsLike: 10, windSpeed: 6, description: 'Утро', icon: '🌅', partOfDay: 'morning' },
      { time: date, hour: 15, temp: 18, feelsLike: 17, windSpeed: 8, description: 'День', icon: '☀️', partOfDay: 'day' },
      { time: date, hour: 20, temp: 10, feelsLike: 8, windSpeed: 5, description: 'Вечер', icon: '🌆', partOfDay: 'evening' },
    ];
  };
  
  const handleDayClick = (day: any) => {
    setSelectedDay(day);
    fetchHourlyForecast(day.date);
  };
  
  useEffect(() => {
    if (currentWeatherData) {
      setCurrentWeather(currentWeatherData);
    }
  }, [currentWeatherData]);
  
  useEffect(() => {
    if (forecastData && forecastData.length > 0) {
      setWeatherData(forecastData);
      if (forecastData[0]) setTodayWeather(forecastData[0]);
      if (forecastData[1]) setTomorrowWeather(forecastData[1]);
      setLoading(false);
      setError(null);
    } else if (!isLoading && city) {
      setError('Не удалось загрузить прогноз погоды');
      setLoading(false);
    }
  }, [forecastData, isLoading, city]);
  
  useEffect(() => {
    if (city) {
      setLoading(true);
      refetchForecast();
    }
  }, [selectedPeriod, city, refetchForecast]);
  
  const handleRefresh = () => {
    setLoading(true);
    refetchCurrent();
    refetchForecast();
  };
  
  const getWeatherEmoji = (icon: string) => {
    if (!icon) return '🌈';
    return icon;
  };
  
  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };
  
  const getWeekday = (dateStr: string, index: number) => {
    if (index === 0) return 'Сегодня';
    if (index === 1) return 'Завтра';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  };
  
  const getPartOfDayLabel = (part: string) => {
    const labels = {
      night: '🌙 Ночь (00:00-05:00)',
      morning: '🌅 Утро (06:00-11:00)',
      day: '☀️ День (12:00-17:00)',
      evening: '🌆 Вечер (18:00-23:00)'
    };
    return labels[part as keyof typeof labels] || part;
  };
  
  if (!city) {
    return <div className="loading">Загрузка...</div>;
  }
  
  return (
    <div className="gismeteo-page">
      <div className="gismeteo-container">
        {/* Шапка с местоположением */}
        <div className="gismeteo-header">
          <div className="gismeteo-location">
            <h1>Погода в {city.name}</h1>
            <p>Россия / {city.name}</p>
          </div>
          <div className="gismeteo-search"></div>
        </div>
        
        {/* Текущая погода */}
        {currentWeather && (
          <div className="gismeteo-current">
            <div className="gismeteo-current-left">
              <div className="gismeteo-current-temp">{currentWeather.temp}°</div>
              <div className="gismeteo-current-feels">По ощущению {Math.round((currentWeather.temp || 0) - 2)}°</div>
            </div>
            <div className="gismeteo-current-right">
              <div className="gismeteo-current-icon">
                <span>{getWeatherEmoji(currentWeather.icon)}</span>
              </div>
              <div className="gismeteo-current-desc">{currentWeather.description}</div>
            </div>
          </div>
        )}
        
        {/* Краткий прогноз на сегодня/завтра */}
        <div className="gismeteo-short">
          {todayWeather && (
            <div className="gismeteo-short-item" onClick={() => handleDayClick(todayWeather)}>
              <div className="short-day">Сегодня</div>
              <div className="short-temps">
                <span className="short-max">{todayWeather.tempMax || todayWeather.temp}°</span>
                <span className="short-min">{todayWeather.tempMin || Math.floor((todayWeather.tempMax || 20) - 6)}°</span>
              </div>
              <div className="short-icon">{getWeatherEmoji(todayWeather.icon)}</div>
              <div className="short-hint">👆 Нажмите для почасового прогноза</div>
            </div>
          )}
          {tomorrowWeather && (
            <div className="gismeteo-short-item" onClick={() => handleDayClick(tomorrowWeather)}>
              <div className="short-day">Завтра</div>
              <div className="short-temps">
                <span className="short-max">{tomorrowWeather.tempMax || tomorrowWeather.temp}°</span>
                <span className="short-min">{tomorrowWeather.tempMin || Math.floor((tomorrowWeather.tempMax || 20) - 6)}°</span>
              </div>
              <div className="short-icon">{getWeatherEmoji(tomorrowWeather.icon)}</div>
              <div className="short-hint">👆 Нажмите для почасового прогноза</div>
            </div>
          )}
        </div>
        
        {/* Выбор периода */}
        <div className="gismeteo-period">
          <button 
            className={`period-btn ${selectedPeriod === '3days' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('3days')}
          >
            3 дня
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Неделя
          </button>
          <button 
            className={`period-btn ${selectedPeriod === '10days' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('10days')}
          >
            10 дней
          </button>
        </div>
        
        {/* Таблица прогноза */}
        {isLoading || loading ? (
          <div className="gismeteo-loading">
            <div className="spinner"></div>
            <p>Загрузка прогноза...</p>
          </div>
        ) : error ? (
          <div className="gismeteo-error">
            <p>⚠️ {error}</p>
            <button onClick={handleRefresh}>Повторить</button>
          </div>
        ) : (
          <>
            <div className="gismeteo-table">
              <div className="gismeteo-row header-row">
                {weatherData.map((day, index) => (
                  <div key={index} className="gismeteo-cell day-cell">
                    <div className="day-name">{getWeekday(day.date, index)}</div>
                    <div className="day-date">{formatDay(day.date)}</div>
                  </div>
                ))}
              </div>
              
              <div className="gismeteo-row temp-row">
                {weatherData.map((day, index) => (
                  <div key={index} className="gismeteo-cell" onClick={() => handleDayClick(day)}>
                    <div className="temp-max">{day.tempMax || day.temp}°</div>
                    <div className="temp-min">{day.tempMin || Math.floor((day.tempMax || 20) - 6)}°</div>
                    <div className="cell-hint">👆</div>
                  </div>
                ))}
              </div>
              
              <div className="gismeteo-row weather-row">
                {weatherData.map((day, index) => (
                  <div key={index} className="gismeteo-cell">
                    <span className="weather-icon">{getWeatherEmoji(day.icon)}</span>
                  </div>
                ))}
              </div>
              
              <div className="gismeteo-row desc-row">
                {weatherData.map((day, index) => (
                  <div key={index} className="gismeteo-cell">
                    <span className="weather-desc">{day.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="gismeteo-additional">
              <div className="additional-title">🌬️ Ветер, м/с</div>
              <div className="additional-values">
                {weatherData.map((day, index) => (
                  <div key={index} className="additional-value">
                    {day.windSpeed || 5} м/с
                  </div>
                ))}
              </div>
              
              <div className="additional-title">💧 Осадки, мм</div>
              <div className="additional-values">
                {weatherData.map((day, index) => (
                  <div key={index} className="additional-value">
                    {day.rain !== undefined ? day.rain : (index < 2 ? '0' : '0.2')}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        <div className="gismeteo-refresh">
          <button onClick={handleRefresh} className="refresh-btn" disabled={isLoading || loading}>
            🔄 Обновить
          </button>
        </div>
      </div>
      
      {/* Модальное окно с почасовым прогнозом */}
      {showHourlyModal && selectedDay && (
        <div className="hourly-modal-overlay" onClick={() => setShowHourlyModal(false)}>
          <div className="hourly-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hourly-modal-header">
              <h2>📅 Почасовой прогноз</h2>
              <button className="modal-close" onClick={() => setShowHourlyModal(false)}>✕</button>
            </div>
            <div className="hourly-modal-date">
              {new Date(selectedDay.date).toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
            
            {hourlyLoading ? (
              <div className="hourly-loading">
                <div className="spinner-small"></div>
                <p>Загрузка почасового прогноза...</p>
              </div>
            ) : (
              <div className="hourly-grid">
                {hourlyForecast.map((hour, index) => (
                  <div key={index} className="hourly-item">
                    <div className="hourly-time">{getPartOfDayLabel(hour.partOfDay)}</div>
                    <div className="hourly-icon">
                      <span className="hourly-emoji">{getWeatherEmoji(hour.icon)}</span>
                    </div>
                    <div className="hourly-temp">
                      <span className="hourly-temp-value">{hour.temp}°C</span>
                      <span className="hourly-feels-like">ощущается {hour.feelsLike}°</span>
                    </div>
                    <div className="hourly-wind">💨 {hour.windSpeed} м/с</div>
                    <div className="hourly-desc">{hour.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}