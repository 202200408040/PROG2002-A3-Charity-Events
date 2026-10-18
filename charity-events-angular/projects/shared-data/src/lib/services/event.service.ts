import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CharityEvent } from '../models/charity-event';
import { EventCategory } from '../models/event-category';
import { EventFilters } from '../models/event-filters';

/**
 * Provides read access to charity event and category API resources.
 */
@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  /**
   * Retrieves current and upcoming active events for the homepage.
   *
   * @returns An observable containing homepage event cards.
   */
  getHomepageEvents(): Observable<CharityEvent[]> {
    return this.http.get<CharityEvent[]>(`${this.apiUrl}/events/home`);
  }

  /**
   * Retrieves all event categories for the search dropdown.
   *
   * @returns An observable containing event categories.
   */
  getCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Searches active events using optional filters.
   *
   * @param filters Optional date, location and category filters.
   * @returns An observable containing matching events.
   */
  searchEvents(filters: EventFilters): Observable<CharityEvent[]> {
    let params = new HttpParams();

    if (filters.date) {
      params = params.set('date', filters.date);
    }

    if (filters.location) {
      params = params.set('location', filters.location);
    }

    if (filters.category) {
      params = params.set('category', filters.category);
    }

    return this.http.get<CharityEvent[]>(`${this.apiUrl}/events`, { params });
  }

  /**
   * Retrieves one active event and its registrations.
   *
   * @param id Event identifier.
   * @returns An observable containing the selected event.
   */
  getEventById(id: number): Observable<CharityEvent> {
    return this.http.get<CharityEvent>(`${this.apiUrl}/events/${id}`);
  }
}
