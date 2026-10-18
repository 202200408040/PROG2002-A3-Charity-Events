import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharityEvent } from 'shared-data';
import { AdminEventService } from '../../../services/admin-event.service';

/**
 * Displays every charity event for the admin website.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-admin-event-list',
  styleUrl: './event-list.css',
  templateUrl: './event-list.html',
})
export class AdminEventList implements OnInit {
  private readonly adminEventService = inject(AdminEventService);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);

  /** All events shown to administrators. */
  readonly events = signal<CharityEvent[]>([]);

  /** Indicates that events are loading. */
  readonly loading = signal(true);

  /** Page-level error message. */
  readonly error = signal('');

  /** Success message after creating or updating an event. */
  readonly successMessage = signal('');

  /** Event currently being deleted. */
  readonly deletingId = signal<number | null>(null);

  /**
   * Loads the admin event list and reads the optional save confirmation.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.title.setTitle('Admin Events | UnityAid');
    if (this.route.snapshot.queryParamMap.get('saved') === '1') {
      this.successMessage.set('Event saved successfully.');
    }
    this.loadEvents();
  }

  /**
   * Retrieves all events from the API.
   *
   * @returns Nothing.
   */
  private loadEvents(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminEventService.getAllEvents().subscribe({
      next: (events) => {
        this.events.set(events);
      },
      error: () => {
        this.error.set('Unable to load events.');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  /**
   * Deletes an event after administrator confirmation.
   *
   * @param event Event selected for deletion.
   * @returns Nothing.
   */
  deleteEvent(event: CharityEvent): void {
    if (!window.confirm(`Delete "${event.name}"?`)) {
      return;
    }

    this.error.set('');
    this.successMessage.set('');
    this.deletingId.set(event.event_id);

    this.adminEventService.deleteEvent(event.event_id).subscribe({
      next: () => {
        this.events.update((events) =>
          events.filter((item) => item.event_id !== event.event_id)
        );
        this.successMessage.set(`"${event.name}" was deleted.`);
        this.deletingId.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(
          error.status === 409
            ? 'Cannot delete an event that has registrations.'
            : 'Unable to delete the event.'
        );
        this.deletingId.set(null);
      },
    });
  }

  /**
   * Returns the display status for an event.
   *
   * @param event Event being displayed.
   * @returns Active, Past or Suspended.
   */
  displayStatus(event: CharityEvent): 'Active' | 'Past' | 'Suspended' {
    if (event.status === 'suspended') {
      return 'Suspended';
    }

    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    return event.event_date < todayString ? 'Past' : 'Active';
  }

  /**
   * Formats an event date for display.
   *
   * @param dateString Date in YYYY-MM-DD format.
   * @returns A readable date string.
   */
  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Intl.DateTimeFormat('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  }
}
