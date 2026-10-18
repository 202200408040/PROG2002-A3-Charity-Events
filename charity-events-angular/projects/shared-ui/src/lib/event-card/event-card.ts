import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CharityEvent } from 'shared-data';

/**
 * Displays a reusable summary card for a charity event.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-event-card',
  styleUrl: './event-card.css',
  templateUrl: './event-card.html',
})
export class EventCard {
  /** Event data rendered by the card. */
  readonly event = input.required<CharityEvent>();

  /** Formatted event date for display. */
  readonly formattedDate = computed(() => {
    const [year, month, day] = this.event().event_date.split('-').map(Number);
    return new Intl.DateTimeFormat('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  });

  /** Formatted ticket price, or Free when the price is zero. */
  readonly formattedPrice = computed(() => {
    const price = Number(this.event().ticket_price);
    if (price === 0) {
      return 'Free';
    }

    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(price);
  });

  /** Ensures API image paths resolve from the Angular application root. */
  readonly imageUrl = computed(() => {
    const image = this.event().image_url;
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `/${image.replace(/^\/+/, '')}`;
  });
}
