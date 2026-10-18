import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Displays the common UnityAid brand header.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-site-header',
  styleUrl: './site-header.css',
  templateUrl: './site-header.html',
})
export class SiteHeader {}
