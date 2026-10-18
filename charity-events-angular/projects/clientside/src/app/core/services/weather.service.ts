import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { WeatherSummary } from '../models/weather-summary';

interface OpenMeteoResponse {
  current?: {
    temperature_2m: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

/**
 * Retrieves weather information from the Open-Meteo API.
 */
@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Retrieves a forecast for the event date when available, otherwise
   * returns the current weather at the event location.
   *
   * @param latitude Event latitude.
   * @param longitude Event longitude.
   * @param eventDate Event date in YYYY-MM-DD format.
   * @returns An observable containing the weather summary.
   */
  getEventWeather(
    latitude: number,
    longitude: number,
    eventDate: string
  ): Observable<WeatherSummary> {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const eventDay = new Date(`${eventDate}T00:00:00`);
    const daysUntilEvent = Math.floor(
      (eventDay.getTime() - startOfToday.getTime()) / 86400000
    );

    if (daysUntilEvent >= 0 && daysUntilEvent <= 15) {
      const params = new HttpParams()
        .set('latitude', latitude)
        .set('longitude', longitude)
        .set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
        .set('start_date', eventDate)
        .set('end_date', eventDate)
        .set('timezone', 'Australia/Sydney');

      return this.http
        .get<OpenMeteoResponse>(this.apiUrl, { params })
        .pipe(
          map((response) => {
            const index = response.daily?.time.indexOf(eventDate) ?? -1;
            if (
              !response.daily ||
              index < 0 ||
              response.daily.temperature_2m_max[index] === undefined
            ) {
              throw new Error('Forecast unavailable');
            }

            return {
              temperature: response.daily.temperature_2m_max[index],
              temperatureMax: response.daily.temperature_2m_max[index],
              temperatureMin: response.daily.temperature_2m_min[index],
              condition: this.describeWeatherCode(
                response.daily.weather_code[index]
              ),
              dateLabel: `Forecast for ${eventDate}`,
              forecastAvailable: true,
            };
          })
        );
    }

    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set('current', 'temperature_2m,weather_code')
      .set('timezone', 'Australia/Sydney');

    return this.http.get<OpenMeteoResponse>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response.current) {
          throw new Error('Current weather unavailable');
        }

        return {
          temperature: response.current.temperature_2m,
          condition: this.describeWeatherCode(response.current.weather_code),
          dateLabel: 'Current weather at the event location',
          forecastAvailable: false,
        };
      })
    );
  }

  /**
   * Converts a WMO weather code into a readable condition.
   *
   * @param code Weather code returned by Open-Meteo.
   * @returns A short human-readable condition.
   */
  private describeWeatherCode(code: number): string {
    if (code === 0) {
      return 'Clear sky';
    }

    if (code >= 1 && code <= 3) {
      return 'Mainly clear to overcast';
    }

    if (code === 45 || code === 48) {
      return 'Fog';
    }

    if (code >= 51 && code <= 55) {
      return 'Drizzle';
    }

    if (code >= 61 && code <= 67) {
      return 'Rain';
    }

    if (code >= 71 && code <= 77) {
      return 'Snow';
    }

    if (code >= 80 && code <= 82) {
      return 'Rain showers';
    }

    if (code >= 95) {
      return 'Thunderstorm';
    }

    return 'Mixed conditions';
  }
}
