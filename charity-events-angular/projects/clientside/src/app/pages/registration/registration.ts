import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  CharityEvent,
  EventRegistration,
  EventService,
  RegistrationService,
} from 'shared-data';

/**
 * Handles ticket registration for a selected charity event.
 */
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-registration',
  styleUrl: './registration.css',
  templateUrl: './registration.html',
})
export class Registration implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly registrationService = inject(RegistrationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly title = inject(Title);

  /** Selected event displayed alongside the form. */
  readonly event = signal<CharityEvent | null>(null);

  /** Created registration shown after a successful submission. */
  readonly success = signal<EventRegistration | null>(null);

  /** Indicates that event data is loading. */
  readonly loading = signal(true);

  /** Indicates that the registration request is running. */
  readonly submitting = signal(false);

  /** Page-level error message. */
  readonly error = signal('');

  /** Form-level submission error. */
  readonly formError = signal('');

  /** Registration form controls. */
  readonly registrationForm = this.formBuilder.nonNullable.group({
    user_name: ['', [Validators.required, Validators.maxLength(100)]],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(150)],
    ],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    number_of_tickets: [1, [Validators.required, Validators.min(1)]],
  });

  /**
   * Loads the event selected by the route and sets the page title.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.title.setTitle('Event Registration | UnityAid Charity Events');
    this.loadEvent(this.route.snapshot.paramMap.get('id'));
  }

  /**
   * Submits the registration form to the API.
   *
   * @returns Nothing.
   */
  submit(): void {
    this.formError.set('');

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      this.formError.set('Please complete all required fields.');
      return;
    }

    const selectedEvent = this.event();
    if (!selectedEvent) {
      this.formError.set('The selected event could not be loaded.');
      return;
    }

    const formValue = this.registrationForm.getRawValue();
    this.submitting.set(true);

    this.registrationService
      .createRegistration({
        event_id: selectedEvent.event_id,
        user_name: formValue.user_name.trim(),
        email: formValue.email.trim(),
        phone: formValue.phone.trim(),
        number_of_tickets: formValue.number_of_tickets,
      })
      .subscribe({
        next: (registration) => {
          this.success.set(registration);
          this.submitting.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.formError.set(
            error.status === 409
              ? 'This email is already registered for this event.'
              : 'Unable to complete the registration. Please try again later.'
          );
          this.submitting.set(false);
        },
      });
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
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  }

  /**
   * Formats a ticket price, or Free when the price is zero.
   *
   * @param value Ticket price from the API.
   * @returns Display price.
   */
  formatPrice(value: string): string {
    const price = Number(value);
    return price === 0
      ? 'Free'
      : new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
        }).format(price);
  }

  /**
   * Returns the event image URL relative to the Angular application root.
   *
   * @param imageUrl API image URL.
   * @returns Display-safe image URL.
   */
  imageUrl(imageUrl: string): string {
    return /^https?:\/\//i.test(imageUrl)
      ? imageUrl
      : `/${imageUrl.replace(/^\/+/, '')}`;
  }

  /**
   * Retrieves the event selected for registration.
   *
   * @param idValue Route parameter value.
   * @returns Nothing.
   */
  private loadEvent(idValue: string | null): void {
    if (!idValue || !/^[1-9]\d*$/.test(idValue)) {
      this.error.set('Invalid event ID.');
      this.loading.set(false);
      return;
    }

    this.eventService.getEventById(Number(idValue)).subscribe({
      next: (event) => {
        this.event.set(event);
        this.title.setTitle(`Register for ${event.name} | UnityAid`);
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
}
