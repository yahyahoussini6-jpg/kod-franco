export function formatMAD(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatDuration(hours: number): string {
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }
  const days = hours / 24;
  return `${days.toFixed(1)}j`;
}

export function formatDays(days: number): string {
  return `${days.toFixed(1)}j`;
}

export function deltaPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function periodCompareDates(from: Date, to: Date): { from: Date; to: Date } {
  const diffMs = to.getTime() - from.getTime();
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - diffMs);
  
  return { from: previousFrom, to: previousTo };
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function getDateRangeOptions() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    {
      label: '7 derniers jours',
      value: '7d',
      from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      to: today
    },
    {
      label: '14 derniers jours', 
      value: '14d',
      from: new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000),
      to: today
    },
    {
      label: '30 derniers jours',
      value: '30d', 
      from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
      to: today
    },
    {
      label: '90 derniers jours',
      value: '90d',
      from: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
      to: today
    }
  ];
}