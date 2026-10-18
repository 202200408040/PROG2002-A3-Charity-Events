import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

/**
 * Placeholder page for the event registration form.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-registration',
  styleUrl: './registration.css',
  templateUrl: './registration.html',
})
export class Registration implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);

  /** Event ID selected for registration. */
  eventId = '';

  /**
   * Reads the selected event ID and sets the page title.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id') ?? '';
    this.title.setTitle('Event Registration | UnityAid Charity Events');
  }
}
