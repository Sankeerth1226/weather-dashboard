import type { Units } from '../types/weather';

export const toTemperature = (celsius: number, units: Units) => units === 'metric' ? celsius : (celsius * 9) / 5 + 32;
export const toWind = (kmh: number, units: Units) => units === 'metric' ? kmh : kmh * 0.621371;
export const toPressure = (hpa: number, units: Units) => units === 'metric' ? hpa : hpa * 0.029529983;
export const tempUnit = (units: Units) => units === 'metric' ? '°C' : '°F';
export const windUnit = (units: Units) => units === 'metric' ? 'km/h' : 'mph';
export const pressureUnit = (units: Units) => units === 'metric' ? 'hPa' : 'inHg';
export const round = (value: number) => Math.round(value);

export function weatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if ([45, 48].includes(code)) return 'Foggy';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain showers';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowfall';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Variable conditions';
}

export function aqiLabel(value: number | null): string {
  if (value === null) return 'Unavailable';
  if (value <= 50) return 'Good';
  if (value <= 100) return 'Moderate';
  if (value <= 150) return 'Sensitive groups';
  if (value <= 200) return 'Unhealthy';
  if (value <= 300) return 'Very unhealthy';
  return 'Hazardous';
}

export function aqiTone(value: number | null): string {
  if (value === null) return 'neutral';
  if (value <= 50) return 'good';
  if (value <= 100) return 'moderate';
  if (value <= 150) return 'sensitive';
  if (value <= 200) return 'unhealthy';
  return 'hazardous';
}

export function formatHour(time: string, timezone: string): string {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', timeZone: timezone }).format(new Date(time));
}

export function formatDay(date: string, timezone: string, index: number): string {
  if (index === 0) return 'Today';
  return new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: timezone }).format(new Date(`${date}T12:00:00`));
}
