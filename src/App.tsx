import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowDown, ArrowUp, CloudSun, Droplets, Gauge, LocateFixed, MapPin, Search, Sun, Wind, X } from 'lucide-react';
import type { City, Units } from './types/weather';
import { useCitySearch, useTelemetry } from './hooks/useWeather';
import WeatherChart from './components/WeatherChart';
import WeatherIcon from './components/WeatherIcon';
import { aqiLabel, aqiTone, formatDay, pressureUnit, round, tempUnit, toPressure, toTemperature, toWind, weatherDescription, windUnit } from './lib/format';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(value), delay); return () => window.clearTimeout(timer); }, [value, delay]);
  return debounced;
}

function SearchBox({ onSelect }: { onSelect: (city: City) => void }) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const debounced = useDebouncedValue(input, 300);
  const search = useCitySearch(debounced);
  const visible = focused && input.trim().length >= 2;
  const results = search.data ?? [];
  return (
    <div className="search-box">
      <Search size={17} className="search-icon" aria-hidden="true" />
      <input value={input} onChange={(event) => setInput(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 150)} onKeyDown={(event) => { if (event.key === 'Escape') setFocused(false); if (event.key === 'Enter' && results[0]) { onSelect(results[0]); setInput(''); setFocused(false); } }} placeholder="Search any city…" aria-label="Search for a city" aria-autocomplete="list" aria-expanded={visible} />
      {input && <button className="clear-search" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={() => setInput('')}><X size={15} /></button>}
      {visible && <div className="search-menu" role="listbox" aria-label="City search results">
        {debounced.trim().length < 2 ? <div className="search-hint">Type at least 2 characters</div> : search.isFetching ? <div className="search-hint"><span className="mini-spinner" /> Finding cities…</div> : search.isError ? <div className="search-hint">Search unavailable. Check your connection.</div> : results.length === 0 ? <div className="search-hint">No cities found. Try a different spelling.</div> : results.map((city) => <button key={`${city.id}-${city.latitude}`} role="option" aria-selected="false" className="city-option" onMouseDown={(event) => event.preventDefault()} onClick={() => { onSelect(city); setInput(''); setFocused(false); }}><span className="pin-wrap"><MapPin size={16} /></span><span className="city-option-text"><strong>{city.name}</strong><small>{[city.admin1, city.country].filter(Boolean).join(', ')}</small></span><span className="country-code">{city.countryCode}</span></button>)}
      </div>}
    </div>
  );
}

function SkeletonDashboard() {
  return <div className="dashboard-grid" aria-label="Loading weather data" aria-busy="true"><div className="panel hero skeleton-panel"><div className="shimmer line w-40" /><div className="shimmer line w-70" /><div className="shimmer block" /></div>{Array.from({ length: 5 }, (_, i) => <div className={`panel skeleton-panel skeleton-${i}`} key={i}><div className="shimmer line w-40" /><div className="shimmer block" /></div>)}</div>;
}

function EmptyState() {
  return <section className="empty-state"><div className="empty-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="empty-sun"><Sun size={50} strokeWidth={1.2} /></div><div className="empty-cloud"><CloudSun size={35} strokeWidth={1.3} /></div></div><p className="eyebrow">YOUR WEATHER, IN FOCUS</p><h2>Start with a place.</h2><p className="empty-copy">Search for any city around the world to explore its live weather, air quality, and the hours ahead.</p><div className="empty-note"><LocateFixed size={15} /> Global coverage · No API key required</div></section>;
}

export default function App() {
  const [city, setCity] = useState<City | null>(null);
  const [units, setUnits] = useState<Units>('metric');
  const weather = useTelemetry(city);
  const data = weather.data;
  const isDay = data?.current.isDay ?? true;
  const theme = isDay ? 'day-theme' : 'night-theme';
  const hourSummary = useMemo(() => data?.hourly.length ? `${data.hourly.length} hour outlook` : 'Hourly outlook', [data?.hourly.length]);

  return (
    <main className={`app-shell ${theme}`}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="app-content">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="Atmos home"><span className="brand-mark"><span /></span><span>atmos<span className="brand-period">.</span></span></a>
          <div className="topbar-right"><div className="live-indicator"><span className="live-dot" /> LIVE TELEMETRY</div><div className="unit-switch" role="group" aria-label="Temperature and measurement units"><button className={units === 'metric' ? 'active' : ''} onClick={() => setUnits('metric')} aria-pressed={units === 'metric'}>°C</button><span>/</span><button className={units === 'imperial' ? 'active' : ''} onClick={() => setUnits('imperial')} aria-pressed={units === 'imperial'}>°F</button></div></div>
        </header>

        <section className="page-heading" id="top"><div><p className="eyebrow">WEATHER, WITH MORE CONTEXT</p><h1>Atmospheric <span>conditions.</span></h1></div><SearchBox onSelect={(selected) => setCity(selected)} /></section>

        {weather.isError && !data ? <section className="error-state" role="alert"><div className="error-icon"><Activity size={21} /></div><div><h2>Couldn’t load weather data</h2><p>{weather.error instanceof Error ? weather.error.message : 'Please check your connection and try again.'}</p></div><button className="retry-button" onClick={() => void weather.refetch()}>Try again</button></section> : !city ? <EmptyState /> : weather.isLoading ? <SkeletonDashboard /> : data ? <>
          <div className="location-bar"><div className="location-name"><MapPin size={16} /><span>{city.name}</span><span className="location-divider">/</span><span className="location-country">{city.country}</span><span className="timezone-tag">{city.timezone}</span></div><span className="updated-label">LOCAL TIME · {new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone: data.timezone }).format(new Date(data.current.time))}</span></div>
          {weather.isError && <div className="stale-banner" role="status">Showing cached readings. Refresh failed—check your connection.</div>}
          <div className="dashboard-grid">
            <section className="panel hero-panel"><div className="hero-top"><div><p className="panel-kicker">RIGHT NOW <span className="live-dot" /></p><h2>{weatherDescription(data.current.weatherCode)}</h2><p className="hero-location">{city.name}{city.admin1 ? `, ${city.admin1}` : ''}</p></div><div className="hero-icon"><WeatherIcon code={data.current.weatherCode} isDay={isDay} size={75} /></div></div><div className="hero-reading"><span className="hero-temp">{round(toTemperature(data.current.temperature, units))}</span><span className="hero-unit">{tempUnit(units)}</span><div className="feels-like">Feels like <strong>{round(toTemperature(data.current.feelsLike, units))}{tempUnit(units)}</strong></div></div><div className="hero-footer"><span>{isDay ? '☀' : '☾'} {isDay ? 'Daylight' : 'Night'} in {city.name}</span><span className="footer-separator" /><span>Updated just now</span></div></section>

            <section className="panel metric-panel humidity-panel"><div className="metric-head"><span className="metric-icon blue"><Droplets size={17} /></span><span>Humidity</span><span className="metric-caption">RELATIVE</span></div><div className="metric-value">{round(data.current.humidity)}<small>%</small></div><div className="meter"><span style={{ width: `${Math.min(data.current.humidity, 100)}%` }} /></div><p className="metric-foot">{data.current.humidity >= 70 ? 'High moisture in the air' : data.current.humidity <= 30 ? 'Air is feeling dry' : 'Comfortable moisture level'}</p></section>

            <section className="panel metric-panel wind-panel"><div className="metric-head"><span className="metric-icon purple"><Wind size={17} /></span><span>Wind</span><span className="metric-caption">AT 10 M</span></div><div className="metric-value">{round(toWind(data.current.windSpeed, units))}<small> {windUnit(units)}</small></div><div className="wind-direction"><span className="compass"><span style={{ transform: `rotate(${data.current.windDirection}deg)` }}>↑</span></span><span>{round(data.current.windDirection)}° <strong>{windDirection(data.current.windDirection)}</strong></span></div><p className="metric-foot">Wind speed & direction</p></section>

            <section className="panel metric-panel pressure-panel"><div className="metric-head"><span className="metric-icon gold"><Gauge size={17} /></span><span>Pressure</span><span className="metric-caption">SURFACE</span></div><div className="metric-value">{round(toPressure(data.current.pressure, units))}<small> {pressureUnit(units)}</small></div><div className="pressure-scale"><span>LOW</span><div className="scale-track"><i style={{ left: `${Math.max(3, Math.min(97, (data.current.pressure - 960) / 0.9))}%` }} /></div><span>HIGH</span></div><p className="metric-foot">Atmospheric surface pressure</p></section>

            <section className="panel air-panel"><div className="section-heading"><div><p className="panel-kicker">BREATHING SPACE</p><h2>Air quality</h2></div><span className="air-status">{data.airQuality ? 'LIVE' : 'NO SIGNAL'}</span></div>{data.airQuality ? <div className="air-content"><div className={`aqi-score ${aqiTone(data.airQuality.usAqi)}`}><strong>{data.airQuality.usAqi ?? '—'}</strong><span>US AQI</span></div><div className="aqi-details"><span className={`aqi-badge ${aqiTone(data.airQuality.usAqi)}`}>{aqiLabel(data.airQuality.usAqi)}</span><div className="air-stat-row"><span>European AQI</span><strong>{data.airQuality.europeanAqi ?? '—'}</strong></div><div className="air-stat-row"><span>PM2.5</span><strong>{data.airQuality.pm25 === null ? '—' : `${data.airQuality.pm25.toFixed(1)} µg/m³`}</strong></div><div className="air-stat-row"><span>PM10</span><strong>{data.airQuality.pm10 === null ? '—' : `${data.airQuality.pm10.toFixed(1)} µg/m³`}</strong></div></div></div> : <div className="air-unavailable"><Activity size={20} /><p>Air quality readings are currently unavailable for this location.</p></div>}<div className="air-scale" aria-label="Air quality scale"><span className="scale-good" /><span className="scale-moderate" /><span className="scale-sensitive" /><span className="scale-unhealthy" /><span className="scale-hazardous" /></div><div className="scale-labels"><span>Good</span><span>Moderate</span><span>Unhealthy</span></div></section>

            <section className="panel sun-panel"><div className="section-heading"><div><p className="panel-kicker">SOLAR EXPOSURE</p><h2>UV index</h2></div><span className="metric-icon gold"><Sun size={17} /></span></div><div className="uv-row"><strong>{round(data.current.uvIndex)}</strong><span className={`uv-label ${data.current.uvIndex >= 6 ? 'uv-high' : ''}`}>{uvLabel(data.current.uvIndex)}</span></div><div className="uv-track"><span style={{ width: `${Math.min((data.current.uvIndex / 11) * 100, 100)}%` }} /></div><p className="metric-foot">{data.current.uvIndex >= 3 ? 'Sun protection is recommended' : 'Low exposure right now'}</p></section>

            <section className="panel chart-panel"><div className="section-heading chart-heading"><div><p className="panel-kicker">THE NEXT 24 HOURS</p><h2>Temperature & precipitation</h2></div><span className="chart-legend"><i className="legend-temp" />Temp <i className="legend-rain" />Rain chance</span></div><WeatherChart data={data.hourly} timezone={data.timezone} units={units} /><div className="hourly-strip">{data.hourly.filter((_, index) => index % 4 === 0).slice(0, 6).map((hour) => <div className="hour-point" key={hour.time}><span>{new Intl.DateTimeFormat('en', { hour: 'numeric', timeZone: data.timezone }).format(new Date(hour.time))}</span><strong>{round(toTemperature(hour.temperature, units))}°</strong><small><Droplets size={11} /> {hour.precipitationProbability}%</small></div>)}</div></section>

            <section className="panel forecast-panel"><div className="section-heading"><div><p className="panel-kicker">PLAN AHEAD</p><h2>5-day forecast</h2></div><span className="forecast-caption">DAILY OUTLOOK</span></div><div className="forecast-list">{data.daily.map((day, index) => <div className="forecast-row" key={day.date}><span className="forecast-day">{formatDay(day.date, data.timezone, index)}</span><WeatherIcon code={day.weatherCode} isDay size={22} /><span className="forecast-condition">{weatherDescription(day.weatherCode)}</span><span className="forecast-range"><span><ArrowDown size={12} />{round(toTemperature(day.min, units))}°</span><span><ArrowUp size={12} />{round(toTemperature(day.max, units))}°</span></span></div>)}</div></section>

            <section className="panel detail-panel"><div className="section-heading"><div><p className="panel-kicker">ATMOSPHERIC DETAILS</p><h2>More conditions</h2></div></div><div className="detail-grid"><div className="detail-item"><span>Feels like</span><strong>{round(toTemperature(data.current.feelsLike, units))}{tempUnit(units)}</strong></div><div className="detail-item"><span>Precipitation</span><strong>{data.current.precipitation.toFixed(1)} mm</strong></div><div className="detail-item"><span>UV max today</span><strong>{round(data.daily[0]?.uvIndex ?? data.current.uvIndex)}</strong></div><div className="detail-item"><span>Timezone</span><strong>{data.timezone.replaceAll('_', ' ')}</strong></div></div></section>
          </div>
          <footer className="page-footer"><span>Atmospheric data powered by Open-Meteo</span><span>Built for a clearer view of your world <span className="footer-heart">✳</span></span></footer>
        </> : null}
      </div>
    </main>
  );
}

function windDirection(degrees: number): string {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(degrees / 45) % 8];
}
function uvLabel(value: number): string {
  if (value < 3) return 'Low';
  if (value < 6) return 'Moderate';
  if (value < 8) return 'High';
  if (value < 11) return 'Very high';
  return 'Extreme';
}
