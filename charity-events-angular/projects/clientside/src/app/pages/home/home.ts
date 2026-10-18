import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CharityEvent, EventService } from 'shared-data';
import { EventCard } from 'shared-ui';

/**
 * Displays the UnityAid homepage and current charity events.
 */
@Component({
  imports: [RouterLink, EventCard],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly title = inject(Title);

  /** Active homepage events returned by the API. */
  readonly events = signal<CharityEvent[]>([]);

  /** Indicates whether homepage events are loading. */
  readonly loading = signal(true);

  /** User-facing error message for the event request. */
  readonly error = signal('');

  /** Number of events currently displayed on the homepage. */
  readonly eventCount = computed(() => this.events().length);

  /** Total fundraising amount for the displayed events. */
  readonly totalRaised = computed(() =>
    this.events().reduce(
      (total, event) => total + Number(event.current_amount),
      0
    )
  );

  /** Compact fundraising label used by the impact section. */
  readonly fundsLabel = computed(() => {
    const total = this.totalRaised();
    return total >= 1000
      ? `$${Math.round(total / 1000)}K+`
      : `$${Math.round(total)}`;
  });

  /**
   * Loads homepage events and sets the document title.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.title.setTitle('UnityAid Charity Events');
    this.loadEvents();
  }

  /**
   * Retrieves current and upcoming active events from the API.
   *
   * @returns Nothing.
   */
  private loadEvents(): void {
    this.loading.set(true);
    this.error.set('');

    this.eventService.getHomepageEvents().subscribe({
      next: (events) => {
        this.events.set(events);
      },
      error: () => {
        this.error.set('Unable to load events. Please try again later.');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
}
