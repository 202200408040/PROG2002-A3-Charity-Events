import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

/**
 * Page component for About UnityAid.
 */
@Component({
  selector: 'app-about',
  styleUrl: './about.css',
  templateUrl: './about.html',
})
export class About implements OnInit {
  private readonly title = inject(Title);

  /**
   * Sets the document title for this page.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.title.setTitle('About UnityAid | UnityAid Charity Events');
  }
}
