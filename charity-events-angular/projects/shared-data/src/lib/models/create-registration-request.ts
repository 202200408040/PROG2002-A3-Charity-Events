/**
 * Request body used to create a new event registration.
 */
export interface CreateRegistrationRequest {
  /** Event being registered for. */
  event_id: number;

  /** Registrant's display name. */
  user_name: string;

  /** Registrant's email address. */
  email: string;

  /** Registrant's contact number. */
  phone: string;

  /** Number of tickets purchased. */
  number_of_tickets: number;
}
