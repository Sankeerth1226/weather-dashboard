export type Units = 'metric' | 'imperial';

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string;
  timezone: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  precipitationProbability: number;
}

export interface DailyWeather {
  date: string;
  weatherCode: number;
  max: number;
  min: number;
  uvIndex: number;
}

export interface AirQuality {
  usAqi: number | null;
  europeanAqi: number | null;
  pm25: number | null;
  pm10: number | null;
}

export interface WeatherTelemetry {
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  airQuality: AirQuality | null;
  timezone: string;
}
