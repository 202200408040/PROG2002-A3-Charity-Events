import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharityEvent, EventRegistration, EventService } from 'shared-data';

/**
 * Displays full details and registrations for one charity event.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-event-detail',
  styleUrl: './event-detail.css',
  templateUrl: './event-detail.html',
})
export class EventDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly title = inject(Title);

  /** Selected event returned by the API. */
  readonly event = signal<CharityEvent | null>(null);

  /** Indicates that the event is loading. */
  readonly loading = signal(true);

  /** User-facing error message. */
  readonly error = signal('');

  /** Formatted event date. */
  readonly formattedDate = computed(() => {
    const event = this.event();
    if (!event) {
      return '';
    }

    const [year, month, day] = event.event_date.split('-').map(Number);
    return new Intl.DateTimeFormat('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  });

  /** Formatted event start time. */
  readonly formattedTime = computed(() => this.event()?.event_time.slice(0, 5) ?? '');

  /** Formatted ticket price. */
  readonly formattedPrice = computed(() => {
    const event = this.event();
    if (!event) {
      return '';
    }

    const price = Number(event.ticket_price);
    return price === 0
      ? 'Free'
      : new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
        }).format(price);
  });

  /** Fundraising progress capped at 100 percent. */
  readonly progress = computed(() => {
    const event = this.event();
    if (!event) {
      return 0;
    }

    const goal = Number(event.fundraising_goal);
    if (goal <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((Number(event.current_amount) / goal) * 100));
  });

  /** Formatted current fundraising amount. */
  readonly currentAmount = computed(() =>
    this.formatCurrency(Number(this.event()?.current_amount ?? 0))
  );

  /** Formatted fundraising goal. */
  readonly fundraisingGoal = computed(() =>
    this.formatCurrency(Number(this.event()?.fundraising_goal ?? 0))
  );

  /** Display-safe event image URL. */
  readonly imageUrl = computed(() => {
    const image = this.event()?.image_url ?? '';
    return /^https?:\/\//i.test(image)
      ? image
      : `/${image.replace(/^\/+/, '')}`;
  });

  /** Number of registrations for the selected event. */
  readonly registrationCount = computed(
    () => this.event()?.registration_count ?? this.event()?.registrations?.length ?? 0
  );

  /** Total tickets sold for the selected event. */
  readonly ticketsSold = computed(() => this.event()?.tickets_sold ?? 0);

  /**
   * Reads the route ID and loads the selected event.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.loadEvent(params.get('id'));
    });
  }

  /**
   * Formats a registration date for display.
   *
   * @param dateString Date in YYYY-MM-DD format.
   * @returns A readable date string.
   */
  formatRegistrationDate(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Intl.DateTimeFormat('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  }

  /**
   * Returns the router command for the registration page.
   *
   * @param eventId Selected event ID.
   * @returns Router link commands.
   */
  registrationLink(eventId: number): (string | number)[] {
    return ['/events', eventId, 'register'];
  }

  /**
   * Tracks registration rows by their identifier.
   *
   * @param _index Row index.
   * @param registration Registration data.
   * @returns The registration ID.
   */
  trackRegistration(_index: number, registration: EventRegistration): number {
    return registration.registration_id;
  }

  /**
   * Loads the event represented by the route ID.
   *
   * @param idValue Route parameter value.
   * @returns Nothing.
   */
  private loadEvent(idValue: string | null): void {
    this.event.set(null);
    this.loading.set(true);
    this.error.set('');

    if (!idValue || !/^[1-9]\d*$/.test(idValue)) {
      this.error.set('Invalid event ID.');
      this.loading.set(false);
      return;
    }

    this.eventService.getEventById(Number(idValue)).subscribe({
      next: (event) => {
        this.event.set(event);
        this.title.setTitle(`${event.name} | UnityAid Charity Events`);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(
          error.status === 404
            ? 'Event not found.'
            : 'Unable to load event details. Please try again later.'
        );
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  /**
   * Formats a numeric amount as Australian dollars.
   *
   * @param value Numeric amount.
   * @returns Currency text.
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
