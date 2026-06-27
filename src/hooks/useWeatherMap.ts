import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetchWeatherByCoords } from '@/services/weatherService';

export function useWeatherMap() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(true);

  // 1. Get User Coordinates
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      setIsGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsGeoLoading(false);
      },
      (err) => {
        setGeoError(err.message);
        setIsGeoLoading(false);
      }
    );
  }, []);

  // 2. Fetch Weather Data via SWR (only runs if coords exist)
  const { data, error, isLoading: isSWRILoading } = useSWR(
    coords ? ['weather', coords.lat, coords.lon] : null,
    () => fetchWeatherByCoords(coords!.lat, coords!.lon),
    { refreshInterval: 600000 }
  );

  // Map OpenWeather codes (2xx Thunderstorm, 3xx Drizzle, 5xx Rain) to our boolean
  const weatherId = data?.weather?.[0]?.id;
  const isRaining = weatherId !== undefined && weatherId >= 200 && weatherId < 600;

  // Convert whatever error happens into a clean string text
  const errorMessage = geoError 
    ? geoError 
    : error 
      ? (error instanceof Error ? error.message : String(error)) 
      : null;

  // Hook is loading if either geolocation or SWR is loading
  const isLoading = isGeoLoading || (isSWRILoading && !geoError);

  return { isRaining, data, isLoading, error: errorMessage };
}