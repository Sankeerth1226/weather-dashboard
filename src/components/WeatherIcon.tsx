import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props { code: number; isDay?: boolean; size?: number; className?: string }

function iconFor(code: number, isDay: boolean): LucideIcon {
  if (code === 0 || code === 1) return Sun;
  if (code === 2) return isDay ? Cloud : Cloud;
  if (code === 3) return Cloud;
  if ([45, 48].includes(code)) return CloudFog;
  if ([51, 53, 55, 56, 57].includes(code)) return CloudDrizzle;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return CloudRain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  if ([95, 96, 99].includes(code)) return CloudLightning;
  return Cloud;
}

export default function WeatherIcon({ code, isDay = true, size = 40, className = '' }: Props) {
  const Icon = iconFor(code, isDay);
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" className={`weather-icon ${code === 0 || code === 1 ? 'sun-icon' : 'cloud-icon'} ${className}`} />;
}
