import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutService } from '../services/checkout';

@Component({
  selector: 'app-grid',
  imports: [CommonModule],
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
  totalCheckouts = 15;
  isAlertAcknowledged = false;
  isAlertDismissed = false;
  acknowledgeTimeout?: number;

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
    if (this.acknowledgeTimeout) {
      clearTimeout(this.acknowledgeTimeout);
    }
  }

  acknowledgeAlert() {
    this.isAlertAcknowledged = true;

    // Re-show the alert after 5 minutes (300000 ms)
    this.acknowledgeTimeout = window.setTimeout(() => {
      this.isAlertAcknowledged = false;
    }, 300000);
  }

  dismissAlert() {
    this.isAlertDismissed = true;
  }

  startAlertMonitoring() {
    this.alertInterval = window.setInterval(() => {
      this.checkForCriticalSituations();
    }, 2000);
  }

  checkForCriticalSituations() {
    const openCheckouts = this.checkouts().filter(checkout => checkout.status === 'open').length;

    // Alert if not all checkouts are equipped
    if (openCheckouts < this.totalCheckouts) {
      this.alertActive = true;
    } else {
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
    return this.alertActive ? 'alert-active' : '';
  }

  isAllCheckoutsEquipped(): boolean {
    const openCheckouts = this.checkouts().filter(checkout => checkout.status === 'open').length;
    return openCheckouts >= this.totalCheckouts;
  }

  onCheckoutBadgeClick() {
    const userInput = prompt(`Entrez le nombre total de caisses (actuellement: ${this.totalCheckouts}):`, this.totalCheckouts.toString());
    if (userInput !== null) {
      const newTotal = parseInt(userInput, 10);
      if (!isNaN(newTotal) && newTotal > 0 && newTotal <= 50) {
        this.totalCheckouts = newTotal;
      } else {
        alert('Veuillez entrer un nombre valide entre 1 et 50');
      }
    }
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
    if (checkout.waitingCount >= 5) {
      return 'critical';
    }
    if (checkout.waitingCount === 4) {
      return 'urgent';
    }
    return 'normal';
  }

  getSortedCheckouts() {
    return this.checkouts()
      .filter(checkout => checkout.status === 'open')
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
    if (checkout.waitingCount >= 5) {
      return 3; // Critical
    }
    if (checkout.waitingCount === 4) {
      return 2; // Urgent
    }
    return 1; // Normal
  }
}
