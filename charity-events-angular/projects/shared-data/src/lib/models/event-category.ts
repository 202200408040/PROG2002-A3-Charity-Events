/**
 * Represents an event category used by the search filter.
 */
export interface EventCategory {
  /** Unique category identifier. */
  category_id: number;

  /** Category display name. */
  name: string;

  /** Category description. */
  description: string;
}
