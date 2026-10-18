/**
 * Weather information displayed on the event detail page.
 */
export interface WeatherSummary {
  /** Current or forecast temperature. */
  temperature: number;

  /** Forecast maximum temperature, when available. */
  temperatureMax?: number;

  /** Forecast minimum temperature, when available. */
  temperatureMin?: number;

  /** Readable weather condition. */
  condition: string;

  /** Description of the weather period. */
  dateLabel: string;

  /** Whether the value is a forecast for the event date. */
  forecastAvailable: boolean;
}
