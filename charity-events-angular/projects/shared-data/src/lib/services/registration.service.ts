import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateRegistrationRequest } from '../models/create-registration-request';
import { EventRegistration } from '../models/event-registration';

/**
 * Provides operations for event registrations.
 */
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/registrations';

  /**
   * Creates a new registration for an active charity event.
   *
   * @param registration Registration details submitted by the user.
   * @returns An observable containing the created registration.
   */
  createRegistration(
    registration: CreateRegistrationRequest
  ): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(this.apiUrl, registration);
  }
}
