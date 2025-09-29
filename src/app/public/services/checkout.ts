import { Injectable, signal } from '@angular/core';

export interface CheckoutItem {
  id: number;
  name: string;
  waitingCount: number;
  status: 'open' | 'closed';
  estimatedWait: number;
  lastUpdated: number;
  stuckTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private checkouts = signal<CheckoutItem[]>([]);

  constructor() {
    this.generateMockData();
    setInterval(() => this.updateData(), 3000);
  }

  getCheckouts() {
    return this.checkouts.asReadonly();
  }

  private generateMockData() {
    const now = Date.now();
    const checkouts: CheckoutItem[] = [];
    for (let i = 1; i <= 12; i++) {
      checkouts.push({
        id: i,
        name: `Checkout ${i}`,
        waitingCount: Math.floor(Math.random() * 15),
        status: Math.random() > 0.1 ? 'open' : 'closed',
        estimatedWait: Math.floor(Math.random() * 20) + 1,
        lastUpdated: now,
        stuckTime: 0
      });
    }
    this.checkouts.set(checkouts);
  }

  private updateData() {
    const now = Date.now();
    const current = this.checkouts();
    const updated = current.map(checkout => {
      const previousCount = checkout.waitingCount;
      const newCount = Math.max(0, checkout.waitingCount + Math.floor(Math.random() * 3) - 1);

      // If count hasn't decreased and is >= 10, increase stuck time
      let stuckTime = checkout.stuckTime;
      if (newCount >= 10 && newCount >= previousCount) {
        stuckTime += 3000; // Add 3 seconds (update interval)
      } else if (newCount < previousCount) {
        stuckTime = 0; // Reset if count decreased
      }

      return {
        ...checkout,
        waitingCount: newCount,
        estimatedWait: Math.floor(Math.random() * 20) + 1,
        lastUpdated: now,
        stuckTime
      };
    });
    this.checkouts.set(updated);
  }

  getStatusClass(checkout: CheckoutItem): string {
    if (checkout.status === 'closed') return 'closed';
    if (checkout.waitingCount >= 10) return 'high';
    if (checkout.waitingCount >= 5) return 'medium';
    return 'low';
  }

  getWaitingText(count: number): string {
    if (count === 0) return 'No queue';
    if (count === 1) return '1 person';
    return `${count} people`;
  }
}
