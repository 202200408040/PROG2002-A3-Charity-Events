import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavLink } from '../models/nav-link';

/**
 * Displays the common navigation links for an Angular application.
 */
@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-main-nav',
  styleUrl: './main-nav.css',
  templateUrl: './main-nav.html',
})
export class MainNav {
  /** Links rendered by the navigation component. */
  readonly links = input<NavLink[]>([]);
}
