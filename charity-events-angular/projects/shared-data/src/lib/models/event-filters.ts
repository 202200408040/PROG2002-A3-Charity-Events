/**
 * Optional filters used when searching for charity events.
 */
export interface EventFilters {
  /** Exact event date in YYYY-MM-DD format. */
  date?: string;

  /** Partial location search text. */
  location?: string;

  /** Category identifier converted to a string for URL parameters. */
  category?: string;
}
