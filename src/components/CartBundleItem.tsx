import React from 'react';
import { Minus, Plus, Trash2, Gift, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CartBundle } from '@/types/bundle';
import { formatPrice } from '@/lib/format';

interface CartBundleItemProps {
  bundle: CartBundle;
  onUpdateQuantity: (bundleId: string, quantity: number) => void;
  onRemove: (bundleId: string) => void;
}

export function CartBundleItem({ bundle, onUpdateQuantity, onRemove }: CartBundleItemProps) {
  const quantity = bundle.primary_item.quantite;
  const totalSavings = bundle.total_savings * quantity;
  const totalBundle = bundle.bundle_total * quantity;
  const totalOriginal = bundle.original_total * quantity;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        {/* Bundle Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{bundle.bundle_name}</span>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Pack
          </Badge>
        </div>

        {/* Primary Product */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            {bundle.primary_item.media?.[0] && (
              <img 
                src={bundle.primary_item.media[0]}
                alt={bundle.primary_item.product_nom}
                className="w-12 h-12 object-cover rounded border"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{bundle.primary_item.product_nom}</h4>
              {bundle.primary_item.variables && (bundle.primary_item.variables.color || bundle.primary_item.variables.size) && (
                <div className="flex gap-1 mt-1">
                  {bundle.primary_item.variables.color && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {bundle.primary_item.variables.color}
                    </Badge>
                  )}
                  {bundle.primary_item.variables.size && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {bundle.primary_item.variables.size}
                    </Badge>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {formatPrice(bundle.primary_item.product_prix)}
              </p>
            </div>
          </div>

          {/* Secondary Product */}
          <div className="flex items-center gap-3 pl-6 border-l-2 border-primary/20">
            {bundle.secondary_item.media?.[0] && (
              <img 
                src={bundle.secondary_item.media[0]}
                alt={bundle.secondary_item.product_nom}
                className="w-12 h-12 object-cover rounded border"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{bundle.secondary_item.product_nom}</h4>
              {bundle.secondary_item.variables && (bundle.secondary_item.variables.color || bundle.secondary_item.variables.size) && (
                <div className="flex gap-1 mt-1">
                  {bundle.secondary_item.variables.color && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {bundle.secondary_item.variables.color}
                    </Badge>
                  )}
                  {bundle.secondary_item.variables.size && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {bundle.secondary_item.variables.size}
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(bundle.secondary_item.original_prix)}
                </span>
                <span className="text-xs text-primary font-semibold">
                  {formatPrice(bundle.secondary_item.bundle_prix)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls and Pricing */}
        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(bundle.bundle_id, quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="min-w-[2rem] text-center font-semibold text-sm">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(bundle.bundle_id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Pricing */}
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(totalOriginal)}
              </span>
              <span className="font-semibold text-sm text-primary">
                {formatPrice(totalBundle)}
              </span>
            </div>
            <p className="text-xs text-destructive">
              Économie: {formatPrice(totalSavings)}
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => onRemove(bundle.bundle_id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}