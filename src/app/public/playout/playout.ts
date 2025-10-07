import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-playout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './playout.html',
  styleUrl: './playout.css'
})
export class Playout {
  isCollapsed = false;

  logout() {
    // Add your logout logic here
    console.log('Logging out...');
  }
}
