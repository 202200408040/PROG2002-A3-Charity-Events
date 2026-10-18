import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

/**
 * Page component for Find Events.
 */
@Component({
  selector: 'app-search',
  styleUrl: './search.css',
  templateUrl: './search.html',
})
export class Search implements OnInit {
  private readonly title = inject(Title);

  /**
   * Sets the document title for this page.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.title.setTitle('Find Events | UnityAid Charity Events');
  }
}
