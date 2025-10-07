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
      // More realistic initial waiting count: 0-7 people
      const waitingCount = Math.floor(Math.random() * 8);
      checkouts.push({
        id: i,
        name: `Checkout ${i}`,
        waitingCount: waitingCount,
        status: Math.random() > 0.15 ? 'open' : 'closed',
        estimatedWait: waitingCount > 0 ? Math.floor(waitingCount * 2.5) + 2 : 0,
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
      if (checkout.status === 'closed') return checkout;

      const previousCount = checkout.waitingCount;

      // More realistic linear updates: +1, 0, or -1 person
      const change = Math.random();
      let newCount;

      if (change < 0.35) {
        // 35% chance: someone joins the queue
        newCount = Math.min(previousCount + 1, 8); // Max 8 people
      } else if (change < 0.70) {
        // 35% chance: someone leaves (served)
        newCount = Math.max(previousCount - 1, 0);
      } else {
        // 30% chance: no change
        newCount = previousCount;
      }

      // If count is high (5+) and hasn't decreased, increase stuck time
      let stuckTime = checkout.stuckTime;
      if (newCount >= 5 && newCount >= previousCount) {
        stuckTime += 3000; // Add 3 seconds (update interval)
      } else if (newCount < previousCount) {
        stuckTime = 0; // Reset if count decreased
      }

      // Calculate realistic wait time based on queue length
      const estimatedWait = newCount > 0 ? Math.floor(newCount * 2.5) + 2 : 0;

      return {
        ...checkout,
        waitingCount: newCount,
        estimatedWait: estimatedWait,
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
