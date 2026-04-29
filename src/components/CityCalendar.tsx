'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface WeatherData {
  date: string;
  temp: number;
  description: string;
  emoji: string;
}

interface CityCalendarProps {
  cityName: string;
}

const CityCalendar: React.FC<CityCalendarProps> = ({ cityName }) => {
  const router = useRouter();
  const [date, setDate] = useState<Value>(new Date());
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    router.push(`/citydetails/${encodeURIComponent(cityName)}`);
  };

  const getWeatherEmoji = (description: string): string => {
    switch (description) {
      case 'Ясно': return '☀️';
      case 'Облачно': return '☁️';
      case 'Дождь': return '🌧️';
      case 'Снег': return '❄️';
      default: return '🌈';
    }
  };

  const generateWeatherData = (date: Date): WeatherData => {
    const month = date.getMonth();
    let temp: number;
    let description: string;

    if (month === 11 || month === 0 || month === 1) {
      temp = Math.round(Math.random() * -10);
      description = 'Снег';
    } else if (month >= 2 && month <= 4) {
      temp = Math.round(Math.random() * 20);
      description = Math.random() > 0.5 ? 'Ясно' : 'Облачно';
    } else if (month >= 5 && month <= 7) {
      temp = Math.round(20 + Math.random() * 15);
      description = Math.random() > 0.5 ? 'Ясно' : 'Дождь';
    } else {
      temp = Math.round(Math.random() * 10);
      description = 'Облачно';
    }

    return {
      date: date.toLocaleDateString('ru-RU'),
      temp,
      description,
      emoji: getWeatherEmoji(description)
    };
  };

  const fetchWeather = async (startDate: Date, endDate?: Date) => {
    setLoading(true);
    setError('');

    try {
      let mockWeather: WeatherData[] = [];
      
      if (!endDate || startDate.getTime() === endDate.getTime()) {
        mockWeather = [generateWeatherData(startDate)];
      } else {
        const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        mockWeather = [generateWeatherData(startDate)];
        
        for (let i = 1; i <= days; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          mockWeather.push(generateWeatherData(currentDate));
        }
      }

      setWeather(mockWeather);
    } catch (err) {
      setError('Не удалось получить данные о погоде');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (value: Value) => {
    setDate(value);

    if (!value) {
      setWeather([]);
    } else if (Array.isArray(value)) {
      const [start, end] = value;
      if (start && end) {
        fetchWeather(start, end);
      }
    } else {
      fetchWeather(value);
    }
  };

  return (
    <div className="calendar-container">
      <h2>Выберите даты для посещения {cityName}</h2>
      <Calendar onChange={handleDateChange} value={date} selectRange={true} locale="ru-RU" />
      {loading && <div className="loading">Загрузка данных о погоде...</div>}
      {error && <div className="error">{error}</div>}
      {weather.length > 0 && (
        <div className="weather-forecast">
          <h3>Прогноз погоды на выбранные даты:</h3>
          <div className="weather-grid">
            {weather.map((day, index) => (
              <div key={index} className="weather-day">
                <div className="weather-date">{day.date}</div>
                <div className="weather-emoji">{day.emoji}</div>
                <div className="weather-temp">{day.temp}°C</div>
                <div className="weather-desc">{day.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="button-group">
        <button onClick={handleBack} className="action-button secondary">Назад</button>
      </div>
    </div>
  );
};

export default CityCalendar;