import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-playout',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './playout.html',
  styleUrl: './playout.css'
})
export class Playout {
  isCollapsed = false;
}
