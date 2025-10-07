import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutService } from '../services/checkout';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import html2canvas from 'html2canvas';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  selectedDate?: string;
  metrics = {
    avgQueueLength: 0,
    avgQueueLengthDetail: '',
    avgQueueLengthTrend: 0,
    avgQueueLengthTrendText: '',
    peakCrowd: 0,
    peakCrowdDetail: '',
    peakCrowdTrend: 0,
    peakCrowdTrendText: '',
    avgCrowd: 0,
    avgCrowdDetail: '',
    avgCrowdTrend: 0,
    avgCrowdTrendText: '',
    topCheckouts: '',
    topCheckoutsDetail: '',
    topCheckoutsTrend: 0,
    topCheckoutsTrendText: ''
  };

  constructor(
    private checkoutService: CheckoutService,
    private cdr: ChangeDetectorRef
  ) {
    this.checkouts = this.checkoutService.getCheckouts();
    this.getStatusClass = this.checkoutService.getStatusClass.bind(this.checkoutService);
    this.getWaitingText = this.checkoutService.getWaitingText.bind(this.checkoutService);
  }

  ngOnInit() {
    this.updateMetrics();
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
    if (this.chart) {
      this.chart.destroy();
    }

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
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHitRadius: 10
          },
          {
            label: 'Average Waiting Queue',
            data: this.getWaitingData(),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHitRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: 'easeInOutQuart',
          onComplete: () => {},
          delay: 0
        },
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: false
        },
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
    this.updateMetrics();
    this.updateChart();
    this.cdr.markForCheck();
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    console.log('Selected date:', input.value);
    this.updateMetrics();
    this.updateChart();
    this.cdr.markForCheck();
  }

  async downloadData() {
    const timestamp = new Date().toISOString().split('T')[0];

    // Download CSV data
    const csvData = this.generateCSVData();
    const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const csvLink = document.createElement('a');
    const csvUrl = URL.createObjectURL(csvBlob);

    csvLink.setAttribute('href', csvUrl);
    csvLink.setAttribute('download', `dashboard_data_${this.selectedPeriod}_${timestamp}.csv`);
    csvLink.style.visibility = 'hidden';
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);

    // Capture screenshot using html2canvas
    try {
      const element = document.querySelector('.dashboard-interface') as HTMLElement;

      if (element) {
        console.log('Capturing screenshot...');
        const canvas = await html2canvas(element, {
          backgroundColor: '#fafafa',
          scale: 2,
          logging: true,
          useCORS: true,
          allowTaint: true,
          removeContainer: true
        });

        console.log('Canvas created:', canvas);

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Blob created:', blob);
            const imgUrl = URL.createObjectURL(blob);
            const imgLink = document.createElement('a');
            imgLink.href = imgUrl;
            imgLink.download = `dashboard_screenshot_${this.selectedPeriod}_${timestamp}.png`;
            document.body.appendChild(imgLink);
            imgLink.click();
            document.body.removeChild(imgLink);
            URL.revokeObjectURL(imgUrl);
            console.log('Screenshot downloaded');
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/png');
      } else {
        console.error('Dashboard interface element not found');
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  }

  private generateCSVData(): string {
    const labels = this.getChartLabels();
    const entryData = this.getEntryData();
    const waitingData = this.getWaitingData();
    const timestamp = new Date().toLocaleString('fr-FR');

    let csv = `Dashboard Export - ${this.selectedPeriod.toUpperCase()}\n`;
    csv += `Generated on: ${timestamp}\n`;
    if (this.selectedDate) {
      csv += `Selected Date: ${this.selectedDate}\n`;
    }
    csv += '\n';

    // Add Key Metrics
    csv += 'KEY METRICS\n';
    csv += `Average Queue Length,${this.metrics.avgQueueLength},${this.metrics.avgQueueLengthDetail}\n`;
    csv += `Peak Crowd,${this.metrics.peakCrowd},${this.metrics.peakCrowdDetail}\n`;
    csv += `Average Crowd,${this.metrics.avgCrowd},${this.metrics.avgCrowdDetail}\n`;
    csv += `Top Checkouts,${this.metrics.topCheckouts},${this.metrics.topCheckoutsDetail}\n`;
    csv += '\n';

    // Add Trends
    csv += 'TRENDS\n';
    csv += `Average Queue Length Trend,${this.metrics.avgQueueLengthTrend}%,${this.metrics.avgQueueLengthTrendText}\n`;
    csv += `Peak Crowd Trend,${this.metrics.peakCrowdTrend}%,${this.metrics.peakCrowdTrendText}\n`;
    csv += `Average Crowd Trend,${this.metrics.avgCrowdTrend}%,${this.metrics.avgCrowdTrendText}\n`;
    csv += `Top Checkouts Trend,${this.metrics.topCheckoutsTrend},${this.metrics.topCheckoutsTrendText}\n`;
    csv += '\n';

    // Add Chart Data
    csv += 'CHART DATA\n';
    csv += 'Period,Customer Entry,Average Waiting Queue\n';

    for (let i = 0; i < labels.length; i++) {
      csv += `${labels[i]},${entryData[i]},${waitingData[i]}\n`;
    }

    return csv;
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

  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomTrend(min: number = -20, max: number = 20): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private formatTrendText(trend: number, unit: string = '%'): string {
    if (trend === 0) return 'Aucun changement depuis la période précédente';
    const direction = trend > 0 ? '↑' : '↓';
    return `${direction}${Math.abs(trend)}${unit} depuis la période précédente`;
  }

  private getPeriodTimeRange(): string {
    const hours = ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h'];
    const randomHour = hours[Math.floor(Math.random() * hours.length)];
    const randomMinute = this.randomInRange(0, 59).toString().padStart(2, '0');
    return `${randomHour}${randomMinute}`;
  }

  updateMetrics() {
    // Generate random metrics based on period
    const periodMultiplier = {
      day: 1,
      week: 7,
      month: 30,
      year: 365
    }[this.selectedPeriod];

    // Average Queue Length
    this.metrics.avgQueueLength = this.randomInRange(3, 12);
    this.metrics.avgQueueLengthDetail = `personnes en moyenne par caisse active`;
    this.metrics.avgQueueLengthTrend = this.randomTrend(-15, 5);
    this.metrics.avgQueueLengthTrendText = this.formatTrendText(this.metrics.avgQueueLengthTrend);

    // Peak Crowd
    this.metrics.peakCrowd = this.randomInRange(8, 25);
    const checkoutNum = this.randomInRange(1, 12);
    const timeDetail = this.selectedPeriod === 'day'
      ? `à ${this.getPeriodTimeRange()}`
      : this.selectedPeriod === 'week'
      ? `le ${['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][this.randomInRange(0, 6)]}`
      : this.selectedPeriod === 'month'
      ? `en semaine ${this.randomInRange(1, 4)}`
      : `en ${['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'][this.randomInRange(0, 11)]}`;
    this.metrics.peakCrowdDetail = `personnes • Caisse ${checkoutNum} ${timeDetail}`;
    this.metrics.peakCrowdTrend = this.randomTrend(-10, 15);
    this.metrics.peakCrowdTrendText = this.formatTrendText(this.metrics.peakCrowdTrend);

    // Average Crowd
    this.metrics.avgCrowd = this.randomInRange(85, 220);
    this.metrics.avgCrowdDetail = `clients en moyenne dans le magasin`;
    this.metrics.avgCrowdTrend = this.randomTrend(-12, 18);
    this.metrics.avgCrowdTrendText = this.formatTrendText(this.metrics.avgCrowdTrend);

    // Top Checkouts
    const top1 = this.randomInRange(1, 12);
    let top2 = this.randomInRange(1, 12);
    while (top2 === top1) top2 = this.randomInRange(1, 12);
    let top3 = this.randomInRange(1, 12);
    while (top3 === top1 || top3 === top2) top3 = this.randomInRange(1, 12);
    this.metrics.topCheckouts = `${top1} • ${top2} • ${top3}`;
    this.metrics.topCheckoutsDetail = `Caisses avec le plus grand nombre de clients`;
    this.metrics.topCheckoutsTrend = this.randomTrend(-5, 5);
    this.metrics.topCheckoutsTrendText = this.metrics.topCheckoutsTrend === 0
      ? 'Aucun changement dans le classement'
      : 'Changement dans la positions des caisses';
  }
} 