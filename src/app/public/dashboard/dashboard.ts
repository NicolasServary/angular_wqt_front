import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('affluenceChart') affluenceChart?: ElementRef<HTMLCanvasElement>;

  checkouts: ReturnType<CheckoutService['getCheckouts']>;
  getStatusClass: (checkout: any) => string;
  getWaitingText: (count: number) => string;
  isCollapsed = false;
  updateInterval?: number;
  chart?: Chart;
  selectedPeriod: 'day' | 'week' | 'month' | 'year' = 'day';

  constructor(private checkoutService: CheckoutService) {
    this.checkouts = this.checkoutService.getCheckouts();
    this.getStatusClass = this.checkoutService.getStatusClass.bind(this.checkoutService);
    this.getWaitingText = this.checkoutService.getWaitingText.bind(this.checkoutService);
  }

  ngOnInit() {
    this.updateInterval = window.setInterval(() => {
      // Force component update every 5 seconds for real-time metrics
    }, 5000);
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  initChart() {
    if (!this.affluenceChart) return;

    const ctx = this.affluenceChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.getChartLabels(),
        datasets: [
          {
            label: 'Customer Entry',
            data: this.getEntryData(),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: 'Average Waiting Queue',
            data: this.getWaitingData(),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: '#6b7280',
              font: {
                size: 12,
                family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              boxWidth: 8,
              boxHeight: 8
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#2563eb',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 12
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  getChartLabels(): string[] {
    switch (this.selectedPeriod) {
      case 'day':
        return ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return [];
    }
  }

  getEntryData(): number[] {
    switch (this.selectedPeriod) {
      case 'day':
        return [45, 89, 135, 167, 142, 158, 189, 145, 98, 76, 54, 43, 38, 25, 18, 12, 8, 15, 22, 35, 48, 62, 78, 95];
      case 'week':
        return [450, 520, 610, 580, 620, 700, 680, 590, 530, 470, 510, 560, 640, 720, 690, 650, 600, 540, 490, 520, 580, 630, 710, 750, 690, 660, 620, 570];
      case 'month':
        return [120, 145, 138, 152, 165, 178, 192, 185, 170, 155, 142, 135, 148, 160, 175, 190, 205, 198, 182, 168, 155, 145, 158, 172, 188, 202, 195, 180, 165, 150];
      case 'year':
        return [2845, 2956, 3125, 3342, 3556, 3778, 3895, 3787, 3565, 3448, 3232, 3015, 2898, 2756, 2645, 2534, 2423, 2312, 2201, 2156, 2234, 2345, 2456, 2567, 2678, 2789, 2845, 2912, 2978, 3045, 3112, 3178, 3245, 3312, 3378, 3445];
      default:
        return [];
    }
  }

  getWaitingData(): number[] {
    switch (this.selectedPeriod) {
      case 'day':
        return [12, 25, 38, 45, 42, 48, 52, 38, 28, 22, 18, 15, 12, 9, 7, 5, 4, 6, 8, 11, 15, 19, 23, 28];
      case 'week':
        return [28, 30, 35, 33, 36, 40, 38, 34, 30, 26, 28, 32, 37, 42, 40, 38, 35, 31, 27, 29, 33, 38, 43, 45, 42, 39, 36, 32];
      case 'month':
        return [30, 35, 32, 38, 42, 46, 50, 48, 44, 40, 36, 33, 37, 41, 45, 49, 53, 51, 47, 43, 39, 36, 40, 44, 48, 52, 50, 46, 42, 38];
      case 'year':
        return [685, 712, 756, 824, 878, 932, 965, 942, 886, 848, 792, 726, 698, 665, 638, 612, 585, 558, 531, 520, 538, 565, 592, 619, 646, 673, 685, 702, 718, 735, 751, 768, 784, 801, 817, 834];
      default:
        return [];
    }
  }

  setPeriod(period: 'day' | 'week' | 'month' | 'year') {
    this.selectedPeriod = period;
    this.updateChart();
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('Selected date:', input.value);
    // You can add custom logic here to fetch data for the selected date
    this.updateChart();
  }

  updateChart() {
    if (!this.chart) return;

    this.chart.data.labels = this.getChartLabels();
    this.chart.data.datasets[0].data = this.getEntryData();
    this.chart.data.datasets[1].data = this.getWaitingData();
    this.chart.update();
  }

  // Queue metrics calculations
  getAverageQueueLength(): number {
    const openCheckouts = this.checkouts().filter(checkout => checkout.status === 'open');
    if (openCheckouts.length === 0) return 0;
    const total = openCheckouts.reduce((sum, checkout) => sum + checkout.waitingCount, 0);
    return Math.round((total / openCheckouts.length) * 10) / 10;
  }

  getAverageQueueLengthAtMaxCapacity(): number {
    const openCheckouts = this.checkouts().filter(checkout => checkout.status === 'open');
    if (openCheckouts.length === 0) return 0;

    // Simulate max capacity scenario (assume each checkout can handle 2x current load)
    const maxCapacityTotal = openCheckouts.reduce((sum, checkout) => {
      const maxCapacity = Math.max(checkout.waitingCount * 2, 15); // Assume max 15 people per checkout
      return sum + Math.min(checkout.waitingCount, maxCapacity);
    }, 0);

    return Math.round((maxCapacityTotal / openCheckouts.length) * 10) / 10;
  }

  getTotalActiveCheckouts(): number {
    return this.checkouts().filter(checkout => checkout.status === 'open').length;
  }

  getTotalWaitingCustomers(): number {
    return this.checkouts().reduce((total, checkout) => total + checkout.waitingCount, 0);
  }

  getAverageWaitTime(): number {
    const openCheckouts = this.checkouts().filter(checkout => checkout.status === 'open' && checkout.waitingCount > 0);
    if (openCheckouts.length === 0) return 0;
    const total = openCheckouts.reduce((sum, checkout) => sum + checkout.estimatedWait, 0);
    return Math.round(total / openCheckouts.length * 10) / 10;
  }

  getPeakHoursIndicator(): string {
    const totalWaiting = this.getTotalWaitingCustomers();
    if (totalWaiting > 50) return 'Très forte affluence';
    if (totalWaiting > 30) return 'Forte affluence';
    if (totalWaiting > 15) return 'Affluence modérée';
    return 'Faible affluence';
  }

  getAffluenceLevel(): 'low' | 'medium' | 'high' | 'very-high' {
    const totalWaiting = this.getTotalWaitingCustomers();
    if (totalWaiting > 50) return 'very-high';
    if (totalWaiting > 30) return 'high';
    if (totalWaiting > 15) return 'medium';
    return 'low';
  }
}