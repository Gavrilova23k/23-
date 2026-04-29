'use client';

import { trpc } from '@/lib/trpc';
import Image from 'next/image';

interface WeatherWidgetProps {
  lat: string;
  lon: string;
  cityName: string;
}

export function WeatherWidget({ lat, lon, cityName }: WeatherWidgetProps) {
  const { data: weather, isLoading, error } = trpc.weather.getCurrent.useQuery({
    lat,
    lon,
  });

  if (isLoading) {
    return <div className="weather-loading">Загрузка погоды...</div>;
  }

  if (error || !weather) {
    return <div className="weather-error">Не удалось загрузить погоду</div>;
  }

  return (
    <div className="weather-widget">
      <h3>Погода в {cityName} сейчас</h3>
      <div className="weather-info">
        <Image src={weather.icon} alt={weather.description} width={50} height={50} />
        <div className="weather-temp">{weather.temp}°C</div>
        <div className="weather-desc">{weather.description}</div>
        <div className="weather-details">
          <span>💨 {weather.windSpeed} м/с</span>
          <span>💧 {weather.humidity}%</span>
        </div>
      </div>
    </div>
  );
}