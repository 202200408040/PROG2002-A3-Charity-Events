import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Displays the common UnityAid footer.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-site-footer',
  styleUrl: './site-footer.css',
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  /** Current year displayed in the copyright notice. */
  readonly currentYear = new Date().getFullYear();
}
