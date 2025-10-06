import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout';

@Component({
  selector: 'app-grid',
  imports: [CommonModule, RouterLink],
  templateUrl: './grid.html',
  styleUrl: './grid.css'
})
export class Grid implements OnInit, OnDestroy {
  checkouts: ReturnType<CheckoutService['getCheckouts']>;
  getStatusClass: (checkout: any) => string;
  getWaitingText: (count: number) => string;
  sidebarCollapsed = false;
  isCollapsed = false;
  alertInterval?: number;
  alertActive = false;
  criticalCheckouts: any[] = [];
  constructor(private checkoutService: CheckoutService) {
    this.checkouts = this.checkoutService.getCheckouts();
    this.getStatusClass = this.checkoutService.getStatusClass.bind(this.checkoutService);
    this.getWaitingText = this.checkoutService.getWaitingText.bind(this.checkoutService);
  }

  ngOnInit() {
    this.startAlertMonitoring();
  }

  ngOnDestroy() {
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
    }
  }

  startAlertMonitoring() {
    this.alertInterval = window.setInterval(() => {
      this.checkForCriticalSituations();
    }, 2000);
  }

  checkForCriticalSituations() {
    const critical = this.checkouts().filter(checkout =>
      checkout.waitingCount >= 8 && checkout.status === 'open'
    );

    this.criticalCheckouts = critical;

    if (critical.length > 0 && !this.alertActive) {
      this.triggerAlert();
    } else if (critical.length === 0) {
      this.alertActive = false;
    }
  }

  triggerAlert() {
    this.alertActive = true;

    // Visual alert animation will be handled by CSS

    // Optional audio alert (commented out for now)
    // try {
    //   const audio = new Audio();
    //   audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQcGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2';
    //   audio.play();
    // } catch (error) {
    //   console.log('Audio alert not available');
    // }
  }

  getAlertClass(): string {
    return this.alertActive && this.criticalCheckouts.length > 0 ? 'alert-active' : '';
  }

  getTotalWaiting(): number {
    return this.checkouts().reduce((total, checkout) => total + checkout.waitingCount, 0);
  }

  getOpenCheckouts(): number {
    return this.checkouts().filter(checkout => checkout.status === 'open').length;
  }

  getActiveCheckouts(): number {
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
      // If stuck for more than 9 seconds, make it critical
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

        // Sort by priority level first (critical = 3, urgent = 2, normal = 1)
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        // If same priority, sort by waiting count descending
        return b.waitingCount - a.waitingCount;
      });
  }

  private getPriorityLevel(checkout: any): number {
    if (checkout.waitingCount >= 10) {
      if (checkout.stuckTime > 9000) return 3; // Critical
      return 2; // Urgent
    }
    return 1; // Normal
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
