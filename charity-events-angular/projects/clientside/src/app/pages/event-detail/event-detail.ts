import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharityEvent, EventService } from 'shared-data';
import { WeatherSummary } from '../../core/models/weather-summary';
import { WeatherService } from '../../core/services/weather.service';

/**
 * Displays full details and registrations for one charity event.
 */
@Component({
  imports: [RouterLink, DecimalPipe],
  selector: 'app-event-detail',
  styleUrl: './event-detail.css',
  templateUrl: './event-detail.html',
})
export class EventDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly weatherService = inject(WeatherService);
  private readonly title = inject(Title);

  /** Selected event returned by the API. */
  readonly event = signal<CharityEvent | null>(null);

  /** Indicates that the event is loading. */
  readonly loading = signal(true);

  /** User-facing error message. */
  readonly error = signal('');

  /** Weather information for the event location. */
  readonly weather = signal<WeatherSummary | null>(null);

  /** Indicates that weather information is loading. */
  readonly weatherLoading = signal(false);

  /** Weather request error message. */
  readonly weatherError = signal('');

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
  readonly formattedTime = computed(
    () => this.event()?.event_time.slice(0, 5) ?? ''
  );

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

    return Math.min(
      100,
      Math.round((Number(event.current_amount) / goal) * 100)
    );
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
    () =>
      this.event()?.registration_count ??
      this.event()?.registrations?.length ??
      0
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
   * Loads the event represented by the route ID.
   *
   * @param idValue Route parameter value.
   * @returns Nothing.
   */
  private loadEvent(idValue: string | null): void {
    this.event.set(null);
    this.weather.set(null);
    this.weatherError.set('');
    this.weatherLoading.set(false);
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
        this.loadWeather(event);
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
   * Loads current or forecast weather for the selected event location.
   *
   * @param event Selected charity event.
   * @returns Nothing.
   */
  private loadWeather(event: CharityEvent): void {
    const latitude = Number(event.latitude);
    const longitude = Number(event.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      this.weatherError.set('Weather data is unavailable for this event.');
      return;
    }

    this.weatherLoading.set(true);
    this.weatherError.set('');

    this.weatherService
      .getEventWeather(latitude, longitude, event.event_date)
      .subscribe({
        next: (weather) => {
          this.weather.set(weather);
        },
        error: () => {
          this.weatherError.set('Unable to load weather information.');
          this.weatherLoading.set(false);
        },
        complete: () => {
          this.weatherLoading.set(false);
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
