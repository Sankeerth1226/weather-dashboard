import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { HourlyWeather } from '../types/weather';
import { formatHour, toTemperature, tempUnit } from '../lib/format';
import type { Units } from '../types/weather';

interface Props { data: HourlyWeather[]; timezone: string; units: Units }

export default function WeatherChart({ data, timezone, units }: Props) {
  const chartData = data.map((hour) => ({ ...hour, label: formatHour(hour.time, timezone), temp: Math.round(toTemperature(hour.temperature, units)) }));
  return (
    <div className="chart-wrap" role="img" aria-label="24-hour temperature and precipitation probability chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 14, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#89b7ff" stopOpacity={0.28} /><stop offset="100%" stopColor="#89b7ff" stopOpacity={0} /></linearGradient>
            <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#77d4ec" stopOpacity={0.16} /><stop offset="100%" stopColor="#77d4ec" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#9eabc1', fontSize: 11 }} axisLine={false} tickLine={false} interval={3} dy={9} />
          <YAxis yAxisId="temp" tick={{ fill: '#9eabc1', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value}°`} />
          <YAxis yAxisId="rain" orientation="right" domain={[0, 100]} hide />
          <Tooltip contentStyle={{ background: '#18243a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, color: '#f5f7fb' }} labelStyle={{ color: '#aebbd0' }} formatter={(value: number, name: string) => name === 'temp' ? [`${value}${tempUnit(units)}`, 'Temperature'] : [`${value}%`, 'Precipitation']} />
          <Area yAxisId="rain" type="monotone" dataKey="precipitationProbability" name="Precipitation" stroke="#77d4ec" strokeWidth={1.5} fill="url(#rainFill)" />
          <Area yAxisId="temp" type="monotone" dataKey="temp" name="temp" stroke="#9bc2ff" strokeWidth={2.5} fill="url(#temperatureFill)" activeDot={{ r: 4, fill: '#c4dcff', stroke: '#17233a', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
