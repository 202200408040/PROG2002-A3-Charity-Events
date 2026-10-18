import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNav, NavLink, SiteFooter, SiteHeader } from 'shared-ui';

@Component({
  imports: [RouterOutlet, SiteHeader, MainNav, SiteFooter],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly adminLinks: NavLink[] = [
    { label: 'Dashboard', path: '/' },
    { label: 'Events', path: '/events' },
    { label: 'Create Event', path: '/events/new' },
  ];
}
