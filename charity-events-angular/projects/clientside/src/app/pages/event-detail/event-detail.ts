import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

/**
 * Page component for Event Details.
 */
@Component({
  selector: 'app-event-detail',
  styleUrl: './event-detail.css',
  templateUrl: './event-detail.html',
})
export class EventDetail implements OnInit {
  private readonly title = inject(Title);

  /**
   * Sets the document title for this page.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.title.setTitle('Event Details | UnityAid Charity Events');
  }
}
