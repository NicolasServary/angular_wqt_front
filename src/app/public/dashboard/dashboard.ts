import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  checkouts: ReturnType<CheckoutService['getCheckouts']>;
  getStatusClass: (checkout: any) => string;
  getWaitingText: (count: number) => string;
  Math = Math;

  constructor(private checkoutService: CheckoutService) {
    this.checkouts = this.checkoutService.getCheckouts();
    this.getStatusClass = this.checkoutService.getStatusClass.bind(this.checkoutService);
    this.getWaitingText = this.checkoutService.getWaitingText.bind(this.checkoutService);
  }

  getTotalWaiting(): number {
    return this.checkouts().reduce((total, checkout) => total + checkout.waitingCount, 0);
  }

  getOpenCheckouts(): number {
    return this.checkouts().filter(checkout => checkout.status === 'open').length;
  }

  getAverageWaitTime(): number {
    const openCheckouts = this.checkouts().filter(checkout => checkout.status === 'open' && checkout.waitingCount > 0);
    if (openCheckouts.length === 0) return 0;
    const total = openCheckouts.reduce((sum, checkout) => sum + checkout.estimatedWait, 0);
    return Math.round(total / openCheckouts.length * 10) / 10;
  }

  getSuccessRate(): number {
    return 95; // Mock data for success rate
  }

  getPriorityClass(checkout: any): string {
    if (checkout.waitingCount >= 10) {
      if (checkout.stuckTime > 9000) return 'critical';
      return 'urgent';
    }
    return 'normal';
  }

  getSortedCheckouts() {
    return this.checkouts()
      .filter(checkout => checkout.status === 'open' && checkout.waitingCount > 0)
      .sort((a, b) => {
        const aPriority = this.getPriorityLevel(a);
        const bPriority = this.getPriorityLevel(b);

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        return b.waitingCount - a.waitingCount;
      });
  }

  getCriticalCheckouts() {
    return this.getSortedCheckouts().filter(checkout => this.getPriorityClass(checkout) === 'critical');
  }

  getUrgentCheckouts() {
    return this.getSortedCheckouts().filter(checkout => this.getPriorityClass(checkout) === 'urgent');
  }

  getNormalCheckouts() {
    return this.getSortedCheckouts().filter(checkout => this.getPriorityClass(checkout) === 'normal');
  }

  getPeakHours(): string {
    return '14h-16h'; // Mock data
  }

  getEfficiencyScore(): number {
    return 87; // Mock data
  }

  private getPriorityLevel(checkout: any): number {
    if (checkout.waitingCount >= 10) {
      if (checkout.stuckTime > 9000) return 3;
      return 2;
    }
    return 1;
  }
}