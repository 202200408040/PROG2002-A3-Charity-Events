import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CharityEvent, EventCategory, EventFilters, EventService } from 'shared-data';
import { EventCard } from 'shared-ui';

/**
 * Allows users to search active charity events by date, location and category.
 */
@Component({
  imports: [ReactiveFormsModule, EventCard],
  selector: 'app-search',
  styleUrl: './search.css',
  templateUrl: './search.html',
})
export class Search implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly title = inject(Title);

  /** Search form controls. */
  readonly searchForm = this.formBuilder.nonNullable.group({
    date: '',
    location: '',
    category: '',
  });

  /** Categories loaded from the API. */
  readonly categories = signal<EventCategory[]>([]);

  /** Events matching the current search. */
  readonly results = signal<CharityEvent[]>([]);

  /** Indicates that categories are loading. */
  readonly categoriesLoading = signal(true);

  /** Indicates that a search request is running. */
  readonly loading = signal(false);

  /** User-facing search or validation message. */
  readonly error = signal('');

  /** Whether a search has been completed successfully. */
  readonly searched = signal(false);

  /** Summary of filters used for the current search. */
  readonly filterSummary = signal('');

  /**
   * Loads categories and sets the page title.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.title.setTitle('Find Events | UnityAid Charity Events');
    this.loadCategories();
  }

  /**
   * Loads event categories for the dropdown.
   *
   * @returns Nothing.
   */
  private loadCategories(): void {
    this.categoriesLoading.set(true);

    this.eventService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => {
        this.error.set('Unable to load event categories.');
        this.categoriesLoading.set(false);
      },
      complete: () => {
        this.categoriesLoading.set(false);
      },
    });
  }

  /**
   * Validates the selected filters and sends a search request.
   *
   * @returns Nothing.
   */
  search(): void {
    const filters = this.searchForm.getRawValue();
    const hasFilter = Boolean(filters.date || filters.location.trim() || filters.category);

    this.error.set('');
    this.results.set([]);
    this.filterSummary.set('');

    if (!hasFilter) {
      this.searched.set(false);
      this.error.set('Please select at least one filter.');
      return;
    }

    const categoryName = this.categories().find(
      (category) => String(category.category_id) === filters.category
    )?.name;

    this.filterSummary.set(this.buildFilterSummary(filters, categoryName));
    this.loading.set(true);

    this.eventService
      .searchEvents({
        date: filters.date || undefined,
        location: filters.location.trim() || undefined,
        category: filters.category || undefined,
      })
      .subscribe({
        next: (events) => {
          this.results.set(events);
          this.searched.set(true);
        },
        error: () => {
          this.error.set('Unable to search events. Please try again later.');
          this.searched.set(false);
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  /**
   * Clears the form, validation state and previous results.
   *
   * @returns Nothing.
   */
  clearFilters(): void {
    this.searchForm.reset({
      date: '',
      location: '',
      category: '',
    });
    this.results.set([]);
    this.error.set('');
    this.searched.set(false);
    this.filterSummary.set('');
  }

  /**
   * Builds a readable summary of the active filters.
   *
   * @param filters Submitted filter values.
   * @param categoryName Selected category display name.
   * @returns A summary string for the page.
   */
  private buildFilterSummary(
    filters: { date: string; location: string; category: string },
    categoryName?: string
  ): string {
    const parts: string[] = [];

    if (filters.date) {
      parts.push(`Date: ${filters.date}`);
    }

    if (filters.location.trim()) {
      parts.push(`Location: ${filters.location.trim()}`);
    }

    if (categoryName) {
      parts.push(`Category: ${categoryName}`);
    }

    return `Filters applied: ${parts.join(' | ')}`;
  }
}
