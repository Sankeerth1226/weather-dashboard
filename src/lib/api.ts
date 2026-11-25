import type { AirQuality, City, DailyWeather, HourlyWeather, WeatherTelemetry } from '../types/weather';

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

interface GeoResponse { results?: Array<{ id: number; name: string; latitude: number; longitude: number; country?: string; country_code?: string; admin1?: string; timezone?: string }> }
interface ForecastResponse {
  timezone: string;
  current: { time: string; temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; is_day: number; precipitation: number; weather_code: number; wind_speed_10m: number; wind_direction_10m: number; surface_pressure: number; uv_index: number };
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[] };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; uv_index_max: number[] };
}
interface AirResponse { current?: { us_aqi?: number; european_aqi?: number; pm2_5?: number; pm10?: number } }

export async function searchCities(term: string, signal: AbortSignal): Promise<City[]> {
  const params = new URLSearchParams({ name: term, count: '5', language: 'en', format: 'json' });
  const response = await fetch(`${GEO_URL}?${params}`, { signal });
  if (!response.ok) throw new Error('City search is temporarily unavailable. Please try again.');
  const payload = await response.json() as GeoResponse;
  return (payload.results ?? []).map((city) => ({
    id: city.id, name: city.name, latitude: city.latitude, longitude: city.longitude,
    country: city.country ?? '', countryCode: city.country_code ?? '', admin1: city.admin1,
    timezone: city.timezone ?? 'auto'
  }));
}

function normalizeAir(data: AirResponse): AirQuality {
  const value = (input: number | undefined) => typeof input === 'number' && Number.isFinite(input) ? input : null;
  return { usAqi: value(data.current?.us_aqi), europeanAqi: value(data.current?.european_aqi), pm25: value(data.current?.pm2_5), pm10: value(data.current?.pm10) };
}

// Pure adapter: convert Open-Meteo's parallel arrays into UI-ready domain records.
export function normalizeTelemetry(forecast: ForecastResponse, air: AirQuality | null): WeatherTelemetry {
  const current = forecast.current;
  const start = forecast.hourly.time.findIndex((time) => time >= current.time);
  const offset = start < 0 ? 0 : start;
  const hourly: HourlyWeather[] = forecast.hourly.time.slice(offset, offset + 24).map((time, index) => ({
    time,
    temperature: forecast.hourly.temperature_2m[offset + index] ?? current.temperature_2m,
    precipitationProbability: forecast.hourly.precipitation_probability[offset + index] ?? 0
  }));
  const daily: DailyWeather[] = forecast.daily.time.map((date, index) => ({
    date,
    weatherCode: forecast.daily.weather_code[index] ?? 0,
    max: forecast.daily.temperature_2m_max[index] ?? 0,
    min: forecast.daily.temperature_2m_min[index] ?? 0,
    uvIndex: forecast.daily.uv_index_max[index] ?? 0
  }));
  return {
    current: {
      time: current.time, temperature: current.temperature_2m, feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m, isDay: current.is_day === 1, precipitation: current.precipitation,
      weatherCode: current.weather_code, windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m, pressure: current.surface_pressure, uvIndex: current.uv_index
    }, hourly, daily, airQuality: air, timezone: forecast.timezone
  };
}

export async function fetchTelemetry(city: City, signal: AbortSignal): Promise<WeatherTelemetry> {
  const forecastParams = new URLSearchParams({
    latitude: String(city.latitude), longitude: String(city.longitude), timezone: 'auto',
    forecast_days: '5', forecast_hours: '24',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index',
    hourly: 'temperature_2m,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max'
  });
  const airParams = new URLSearchParams({ latitude: String(city.latitude), longitude: String(city.longitude), timezone: 'auto', current: 'us_aqi,european_aqi,pm2_5,pm10' });
  const [forecastResponse, airResponse] = await Promise.all([
    fetch(`${FORECAST_URL}?${forecastParams}`, { signal }),
    fetch(`${AIR_URL}?${airParams}`, { signal }).catch(() => null)
  ]);
  if (!forecastResponse.ok) throw new Error('Weather data could not be loaded. Check your connection and try again.');
  const forecast = await forecastResponse.json() as ForecastResponse;
  let air: AirQuality | null = null;
  if (airResponse?.ok) {
    try { air = normalizeAir(await airResponse.json() as AirResponse); } catch { air = null; }
  }
  return normalizeTelemetry(forecast, air);
}
