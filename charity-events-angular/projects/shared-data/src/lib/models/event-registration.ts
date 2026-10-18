/**
 * Represents one ticket purchase for a charity event.
 */
export interface EventRegistration {
  /** Unique registration identifier. */
  registration_id: number;

  /** Event associated with the registration. */
  event_id: number;

  /** Registrant's display name. */
  user_name: string;

  /** Registrant's email address. */
  email: string;

  /** Registrant's contact number. */
  phone: string;

  /** Date the registration was created in YYYY-MM-DD format. */
  registration_date: string;

  /** Number of tickets purchased. */
  number_of_tickets: number;

  /** Event name returned after creating a registration. */
  event_name?: string;
}
