import { EventRegistration } from './event-registration';

/**
 * Represents a charity event returned by the Express API.
 */
export interface CharityEvent {
  /** Unique event identifier. */
  event_id: number;

  /** Organisation identifier used by admin forms. */
  organisation_id?: number;

  /** Category identifier used by admin forms. */
  category_id?: number;

  /** Public event name. */
  name: string;

  /** Short description used on event cards. */
  short_description: string;

  /** Full description used on the event detail page. */
  full_description?: string;

  /** Event date in YYYY-MM-DD format. */
  event_date: string;

  /** Event start time. */
  event_time: string;

  /** Event location. */
  location: string;

  /** Event latitude used for weather data. */
  latitude?: number | string;

  /** Event longitude used for weather data. */
  longitude?: number | string;

  /** Ticket price returned by MySQL as a decimal string. */
  ticket_price: string;

  /** Fundraising goal returned by MySQL as a decimal string. */
  fundraising_goal: string;

  /** Current fundraising amount returned by MySQL as a decimal string. */
  current_amount: string;

  /** Relative or absolute event image URL. */
  image_url: string;

  /** Active or suspended event status. */
  status?: string;

  /** Category name. */
  category: string;

  /** Hosting organisation name. */
  organisation?: string;

  /** Associated registrations when returned by the detail endpoint. */
  registrations?: EventRegistration[];

  /** Number of registrations for the event. */
  registration_count?: number;

  /** Total tickets sold for the event. */
  tickets_sold?: number;
}
