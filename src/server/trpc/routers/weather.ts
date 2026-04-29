import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import axios from 'axios';

// Тип для почасовой погоды
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

// Словарь для перевода кодов погоды на русский
const weatherCodes: Record<number, { ru: string; icon: string }> = {
  0: { ru: 'Ясно', icon: '☀️' },
  1: { ru: 'Преимущественно ясно', icon: '🌤️' },
  2: { ru: 'Переменная облачность', icon: '⛅' },
  3: { ru: 'Пасмурно', icon: '☁️' },
  45: { ru: 'Туман', icon: '🌫️' },
  48: { ru: 'Туман', icon: '🌫️' },
  51: { ru: 'Морось', icon: '🌦️' },
  53: { ru: 'Морось', icon: '🌦️' },
  55: { ru: 'Морось', icon: '🌦️' },
  61: { ru: 'Небольшой дождь', icon: '🌧️' },
  63: { ru: 'Дождь', icon: '🌧️' },
  65: { ru: 'Сильный дождь', icon: '🌧️' },
  71: { ru: 'Небольшой снег', icon: '❄️' },
  73: { ru: 'Снег', icon: '❄️' },
  75: { ru: 'Сильный снег', icon: '❄️' },
  77: { ru: 'Снег', icon: '❄️' },
  80: { ru: 'Ливень', icon: '🌧️' },
  81: { ru: 'Ливень', icon: '🌧️' },
  82: { ru: 'Сильный ливень', icon: '🌧️' },
  85: { ru: 'Снегопад', icon: '❄️' },
  86: { ru: 'Снегопад', icon: '❄️' },
  95: { ru: 'Гроза', icon: '⛈️' },
  96: { ru: 'Гроза с градом', icon: '⛈️' },
  99: { ru: 'Гроза с градом', icon: '⛈️' },
};

// Функция для генерации демо-данных почасового прогноза
function generateDemoHourlyForecast(date: string): HourlyWeather[] {
  const parts = [
    { part: 'night', hour: 2, temp: 5, feelsLike: 3, icon: '🌙', desc: 'Ночь' },
    { part: 'morning', hour: 9, temp: 12, feelsLike: 10, icon: '🌅', desc: 'Утро' },
    { part: 'day', hour: 15, temp: 18, feelsLike: 17, icon: '☀️', desc: 'День' },
    { part: 'evening', hour: 20, temp: 10, feelsLike: 8, icon: '🌆', desc: 'Вечер' }
  ];
  
  return parts.map(p => ({
    time: date,
    hour: p.hour,
    temp: p.temp + Math.floor(Math.random() * 5),
    feelsLike: p.feelsLike + Math.floor(Math.random() * 5),
    windSpeed: 5 + Math.floor(Math.random() * 10),
    description: p.desc,
    icon: p.icon,
    partOfDay: p.part as 'night' | 'morning' | 'day' | 'evening',
  }));
}

export const weatherRouter = router({
  // Текущая погода
  getCurrent: publicProcedure
    .input(z.object({ lat: z.string(), lon: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await axios.get(
          'https://api.open-meteo.com/v1/forecast',
          {
            params: {
              latitude: input.lat,
              longitude: input.lon,
              current_weather: true,
              timezone: 'auto',
            },
          }
        );

        const current = response.data.current_weather;
        const weatherCode = current.weathercode;
        const weatherInfo = weatherCodes[weatherCode] || { ru: 'Облачно', icon: '☁️' };

        return {
          temp: Math.round(current.temperature),
          description: weatherInfo.ru,
          icon: weatherInfo.icon,
          windSpeed: Math.round(current.windspeed),
        };
      } catch (error) {
        console.error('Weather API error:', error);
        return {
          temp: Math.floor(Math.random() * 20 + 5),
          description: 'Облачно',
          icon: '☁️',
          windSpeed: Math.floor(Math.random() * 10 + 3),
        };
      }
    }),

  // Прогноз на N дней
  getForecast: publicProcedure
    .input(z.object({
      lat: z.string(),
      lon: z.string(),
      days: z.number().min(1).max(16).default(7),
    }))
    .query(async ({ input }) => {
      try {
        const response = await axios.get(
          'https://api.open-meteo.com/v1/forecast',
          {
            params: {
              latitude: input.lat,
              longitude: input.lon,
              daily: 'temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max',
              timezone: 'auto',
              forecast_days: input.days,
            },
          }
        );

        const daily = response.data.daily;
        
        if (!daily || !daily.time) {
          throw new Error('Нет данных');
        }
        
        return daily.time.map((date: string, index: number) => {
          const weatherCode = daily.weathercode[index];
          const weatherInfo = weatherCodes[weatherCode] || { ru: 'Облачно', icon: '☁️' };
          
          return {
            date: date,
            tempMax: Math.round(daily.temperature_2m_max[index]),
            tempMin: Math.round(daily.temperature_2m_min[index]),
            temp: Math.round((daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2),
            description: weatherInfo.ru,
            icon: weatherInfo.icon,
            windSpeed: Math.round(daily.windspeed_10m_max?.[index] || 5),
            rain: index < 2 ? 0 : +(Math.random() * 3).toFixed(1),
          };
        });
      } catch (error) {
        console.error('Forecast API error:', error);
        const today = new Date();
        const demoData = [];
        for (let i = 0; i < input.days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          demoData.push({
            date: date.toISOString().split('T')[0],
            tempMax: 18 + Math.floor(Math.random() * 10),
            tempMin: 8 + Math.floor(Math.random() * 8),
            temp: 13 + Math.floor(Math.random() * 10),
            description: ['Ясно', 'Облачно', 'Небольшой дождь'][Math.floor(Math.random() * 3)],
            icon: ['☀️', '☁️', '🌧️'][Math.floor(Math.random() * 3)],
            windSpeed: 5 + Math.floor(Math.random() * 10),
            rain: i < 2 ? 0 : +(Math.random() * 3).toFixed(1),
          });
        }
        return demoData;
      }
    }),

  // Почасовой прогноз
  getHourlyForecast: publicProcedure
    .input(z.object({
      lat: z.string(),
      lon: z.string(),
      date: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const response = await axios.get(
          'https://api.open-meteo.com/v1/forecast',
          {
            params: {
              latitude: input.lat,
              longitude: input.lon,
              hourly: 'temperature_2m,apparent_temperature,weathercode,windspeed_10m',
              timezone: 'auto',
              start_date: input.date,
              end_date: input.date,
            },
          }
        );

        const hourly = response.data.hourly;
        
        if (!hourly || !hourly.time) {
          throw new Error('Нет данных');
        }
        
        const result: HourlyWeather[] = [];
        
        // Группируем по часам и частям дня
        for (let i = 0; i < hourly.time.length; i++) {
          const hour = new Date(hourly.time[i]).getHours();
          let partOfDay: 'night' | 'morning' | 'day' | 'evening';
          
          if (hour >= 0 && hour <= 5) partOfDay = 'night';
          else if (hour >= 6 && hour <= 11) partOfDay = 'morning';
          else if (hour >= 12 && hour <= 17) partOfDay = 'day';
          else partOfDay = 'evening';
          
          const weatherCode = hourly.weathercode[i];
          const weatherInfo = weatherCodes[weatherCode] || { ru: 'Облачно', icon: '☁️' };
          
          result.push({
            time: hourly.time[i],
            hour: hour,
            temp: Math.round(hourly.temperature_2m[i]),
            feelsLike: Math.round(hourly.apparent_temperature[i]),
            windSpeed: Math.round(hourly.windspeed_10m[i]),
            description: weatherInfo.ru,
            icon: weatherInfo.icon,
            partOfDay: partOfDay,
          });
        }
        
        // Группируем по частям дня и берем среднее
        const groupedByPart: Record<string, HourlyWeather[]> = {
          night: [],
          morning: [],
          day: [],
          evening: []
        };
        
        result.forEach(item => {
          groupedByPart[item.partOfDay].push(item);
        });
        
        const finalResult: HourlyWeather[] = [];
        const order = ['night', 'morning', 'day', 'evening'];
        
        for (const part of order) {
          const items = groupedByPart[part];
          if (items.length > 0) {
            const avgTemp = Math.round(items.reduce((a, b) => a + b.temp, 0) / items.length);
            const avgFeelsLike = Math.round(items.reduce((a, b) => a + b.feelsLike, 0) / items.length);
            const avgWind = Math.round(items.reduce((a, b) => a + b.windSpeed, 0) / items.length);
            // Берем наиболее частый icon
            const iconCounts: Record<string, number> = {};
            items.forEach(item => {
              iconCounts[item.icon] = (iconCounts[item.icon] || 0) + 1;
            });
            const mostCommonIcon = Object.entries(iconCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '☁️';
            const mostCommonDesc = items.find(i => i.icon === mostCommonIcon)?.description || 'Облачно';
            
            finalResult.push({
              time: items[0].time,
              hour: part === 'night' ? 2 : part === 'morning' ? 9 : part === 'day' ? 15 : 20,
              temp: avgTemp,
              feelsLike: avgFeelsLike,
              windSpeed: avgWind,
              description: mostCommonDesc,
              icon: mostCommonIcon,
              partOfDay: part as any,
            });
          }
        }
        
        return finalResult;
      } catch (error) {
        console.error('Hourly forecast error:', error);
        return generateDemoHourlyForecast(input.date);
      }
    }),
});