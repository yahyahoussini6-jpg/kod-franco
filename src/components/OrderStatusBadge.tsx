import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OrderStatus, statusLabels } from '@/theme/tokens';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusVariants: Record<OrderStatus, string> = {
  nouvelle: 'bg-[hsl(var(--status-nouvelle-bg))] text-[hsl(var(--status-nouvelle-foreground))] border-[hsl(var(--status-nouvelle-bg))]',
  confirmee: 'bg-[hsl(var(--status-confirmee-bg))] text-[hsl(var(--status-confirmee-foreground))] border-[hsl(var(--status-confirmee-bg))]',
  en_preparation: 'bg-[hsl(var(--status-en-preparation-bg))] text-[hsl(var(--status-en-preparation-foreground))] border-[hsl(var(--status-en-preparation-bg))]',
  expediee: 'bg-[hsl(var(--status-expediee-bg))] text-[hsl(var(--status-expediee-foreground))] border-[hsl(var(--status-expediee-bg))]',
  livree: 'bg-[hsl(var(--status-livree-bg))] text-[hsl(var(--status-livree-foreground))] border-[hsl(var(--status-livree-bg))]',
  annulee: 'bg-[hsl(var(--status-annulee-bg))] text-[hsl(var(--status-annulee-foreground))] border-[hsl(var(--status-annulee-bg))]',
  retournee: 'bg-[hsl(var(--status-retournee-bg))] text-[hsl(var(--status-retournee-foreground))] border-[hsl(var(--status-retournee-bg))]'
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium',
        statusVariants[status],
        className
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
}