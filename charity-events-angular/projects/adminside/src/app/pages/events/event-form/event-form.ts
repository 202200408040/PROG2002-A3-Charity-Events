import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharityEvent, EventCategory, EventService } from 'shared-data';
import {
  AdminEventService,
  EventPayload,
} from '../../../services/admin-event.service';

/**
 * Creates or updates a charity event for the admin website.
 */
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-admin-event-form',
  styleUrl: './event-form.css',
  templateUrl: './event-form.html',
})
export class AdminEventForm implements OnInit {
  private readonly adminEventService = inject(AdminEventService);
  private readonly eventService = inject(EventService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  /** Whether the form is editing an existing event. */
  readonly isEdit = signal(false);

  /** Selected event ID when editing. */
  readonly eventId = signal<number | null>(null);

  /** Event currently being edited, including registrations. */
  readonly editingEvent = signal<CharityEvent | null>(null);

  /** Categories available in the form. */
  readonly categories = signal<EventCategory[]>([]);

  /** Indicates that existing event data is loading. */
  readonly loading = signal(false);

  /** Indicates that the form is being submitted. */
  readonly saving = signal(false);

  /** Page-level error message. */
  readonly error = signal('');

  /** Event form controls. */
  readonly eventForm = this.formBuilder.nonNullable.group({
    organisation_id: [1, [Validators.required, Validators.min(1)]],
    category_id: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    short_description: [
      '',
      [Validators.required, Validators.maxLength(255)],
    ],
    full_description: ['', [Validators.required]],
    event_date: ['', [Validators.required]],
    event_time: ['', [Validators.required]],
    location: ['', [Validators.required, Validators.maxLength(150)]],
    latitude: [
      0,
      [Validators.required, Validators.min(-90), Validators.max(90)],
    ],
    longitude: [
      0,
      [Validators.required, Validators.min(-180), Validators.max(180)],
    ],
    ticket_price: [0, [Validators.required, Validators.min(0)]],
    fundraising_goal: [0, [Validators.required, Validators.min(0)]],
    current_amount: [0, [Validators.required, Validators.min(0)]],
    image_url: ['images/charity-gala.svg', [Validators.required]],
    status: ['active', [Validators.required]],
  });

  /**
   * Determines create or edit mode and loads required data.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    const idValue = this.route.snapshot.paramMap.get('id');
    const id = idValue ? Number(idValue) : null;
    const editing = Boolean(idValue);

    this.isEdit.set(editing);
    this.eventId.set(id);
    this.title.setTitle(
      editing ? 'Edit Event | UnityAid Admin' : 'Create Event | UnityAid Admin'
    );

    this.loadCategories();

    if (editing) {
      this.loadEvent(id as number);
    }
  }

  /**
   * Submits the event form to create or update the event.
   *
   * @returns Nothing.
   */
  submit(): void {
    this.error.set('');

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.error.set('Please correct the highlighted fields.');
      return;
    }

    const payload = this.buildPayload();
    const id = this.eventId();
    this.saving.set(true);

    const request$ =
      this.isEdit() && id
        ? this.adminEventService.updateEvent(id, payload)
        : this.adminEventService.createEvent(payload);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/events'], {
          queryParams: { saved: '1' },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(
          error.error?.message ?? 'Unable to save the event.'
        );
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  /**
   * Loads categories for the category dropdown.
   *
   * @returns Nothing.
   */
  private loadCategories(): void {
    this.eventService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        if (!this.isEdit() && this.eventForm.controls.category_id.value === 0) {
          this.eventForm.controls.category_id.setValue(
            categories[0]?.category_id ?? 0
          );
        }
      },
      error: () => {
        this.error.set('Unable to load event categories.');
      },
    });
  }

  /**
   * Loads an existing event and patches the form.
   *
   * @param id Event identifier.
   * @returns Nothing.
   */
  private loadEvent(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.error.set('Invalid event ID.');
      return;
    }

    this.loading.set(true);

    this.adminEventService.getEventById(id).subscribe({
      next: (event) => {
        this.editingEvent.set(event);
        this.eventForm.patchValue({
          organisation_id: event.organisation_id ?? 1,
          category_id: event.category_id ?? 0,
          name: event.name,
          short_description: event.short_description,
          full_description: event.full_description ?? '',
          event_date: event.event_date,
          event_time: event.event_time.slice(0, 5),
          location: event.location,
          latitude: Number(event.latitude ?? 0),
          longitude: Number(event.longitude ?? 0),
          ticket_price: Number(event.ticket_price),
          fundraising_goal: Number(event.fundraising_goal),
          current_amount: Number(event.current_amount),
          image_url: event.image_url,
          status: event.status === 'suspended' ? 'suspended' : 'active',
        });
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(
          error.status === 404
            ? 'Event not found.'
            : 'Unable to load event details.'
        );
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  /**
   * Builds the API payload from the current form values.
   *
   * @returns Event data for the API.
   */
  private buildPayload(): EventPayload {
    const value = this.eventForm.getRawValue();

    return {
      organisation_id: Number(value.organisation_id),
      category_id: Number(value.category_id),
      name: value.name.trim(),
      short_description: value.short_description.trim(),
      full_description: value.full_description.trim(),
      event_date: value.event_date,
      event_time:
        value.event_time.length === 5
          ? `${value.event_time}:00`
          : value.event_time,
      location: value.location.trim(),
      latitude: Number(value.latitude),
      longitude: Number(value.longitude),
      ticket_price: Number(value.ticket_price),
      fundraising_goal: Number(value.fundraising_goal),
      current_amount: Number(value.current_amount),
      image_url: value.image_url.trim(),
      status: value.status as 'active' | 'suspended',
    };
  }

  /**
   * Formats a registration date for display.
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

  /**
   * Indicates whether a form control should display an error.
   *
   * @param controlName Form control name.
   * @returns Whether the control is invalid and touched.
   */
  hasError(controlName: keyof typeof this.eventForm.controls): boolean {
    const control = this.eventForm.controls[controlName];
    return control.invalid && control.touched;
  }
}
