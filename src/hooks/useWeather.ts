import { useQuery } from '@tanstack/react-query';
import { fetchTelemetry, searchCities } from '../lib/api';
import type { City } from '../types/weather';

export function useCitySearch(term: string) {
  return useQuery({
    queryKey: ['cities', term.trim().toLowerCase()],
    queryFn: ({ signal }) => searchCities(term.trim(), signal),
    enabled: term.trim().length >= 2,
    staleTime: 10 * 60 * 1000,
    placeholderData: (previous) => previous
  });
}

export function useTelemetry(city: City | null) {
  return useQuery({
    queryKey: ['telemetry', city?.id, city?.latitude, city?.longitude],
    queryFn: ({ signal }) => city ? fetchTelemetry(city, signal) : Promise.reject(new Error('Choose a city first.')),
    enabled: city !== null,
    staleTime: 10 * 60 * 1000
  });
}
