import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CharityEvent } from 'shared-data';

/**
 * Event data required when creating or updating an event.
 */
export interface EventPayload {
  organisation_id: number;
  category_id: number;
  name: string;
  short_description: string;
  full_description: string;
  event_date: string;
  event_time: string;
  location: string;
  latitude: number;
  longitude: number;
  ticket_price: number;
  fundraising_goal: number;
  current_amount: number;
  image_url: string;
  status: 'active' | 'suspended';
}

/**
 * Provides administrative event operations through the Express API.
 */
@Injectable({ providedIn: 'root' })
export class AdminEventService {
  private readonly http = inject(HttpClient);
  private readonly adminUrl = '/api/admin/events';
  private readonly eventsUrl = '/api/events';

  /**
   * Retrieves every event regardless of status.
   *
   * @returns An observable containing the admin event list.
   */
  getAllEvents(): Observable<CharityEvent[]> {
    return this.http.get<CharityEvent[]>(this.adminUrl);
  }

  /**
   * Retrieves one event and its registrations for editing.
   *
   * @param id Event identifier.
   * @returns An observable containing the event.
   */
  getEventById(id: number): Observable<CharityEvent> {
    return this.http.get<CharityEvent>(`${this.adminUrl}/${id}`);
  }

  /**
   * Creates a new event.
   *
   * @param payload Event data to create.
   * @returns An observable containing the created event.
   */
  createEvent(payload: EventPayload): Observable<CharityEvent> {
    return this.http.post<CharityEvent>(this.eventsUrl, payload);
  }

  /**
   * Updates an existing event.
   *
   * @param id Event identifier.
   * @param payload Updated event data.
   * @returns An observable containing the updated event.
   */
  updateEvent(id: number, payload: EventPayload): Observable<CharityEvent> {
    return this.http.put<CharityEvent>(`${this.eventsUrl}/${id}`, payload);
  }

  /**
   * Deletes an event when it has no registrations.
   *
   * @param id Event identifier.
   * @returns An observable containing the API result.
   */
  deleteEvent(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.eventsUrl}/${id}`);
  }
}
