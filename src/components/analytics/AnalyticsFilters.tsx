import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getDateRangeOptions } from '@/lib/metrics';
import { cn } from '@/lib/utils';

interface AnalyticsFiltersProps {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  filters: {
    city?: string;
    courier?: string;
    utm_source?: string;
    category?: string;
  };
  onFiltersChange: (filters: any) => void;
  filterOptions: {
    cities: string[];
    couriers: string[];
    sources: string[];
    categories: string[];
  };
}

export function AnalyticsFilters({
  dateRange,
  onDateRangeChange,
  filters,
  onFiltersChange,
  filterOptions
}: AnalyticsFiltersProps) {
  const dateRangeOptions = getDateRangeOptions();
  const [customDateOpen, setCustomDateOpen] = React.useState(false);

  const handlePresetChange = (preset: string) => {
    const option = dateRangeOptions.find(opt => opt.value === preset);
    if (option) {
      onDateRangeChange({ from: option.from, to: option.to });
    }
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof typeof filters];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Date Range Presets */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Période</label>
            <Select onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dates personnalisées</label>
            <Popover open={customDateOpen} onOpenChange={setCustomDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: fr })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: fr })
                    )
                  ) : (
                    <span>Choisir une période</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      onDateRangeChange({ from: range.from, to: range.to });
                      setCustomDateOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ville</label>
            <div className="flex items-center space-x-1">
              <Select 
                value={filters.city || ''} 
                onValueChange={(value) => onFiltersChange({ ...filters, city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  {filterOptions.cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.city && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => clearFilter('city')}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Courier Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Transporteur</label>
            <div className="flex items-center space-x-1">
              <Select 
                value={filters.courier || ''} 
                onValueChange={(value) => onFiltersChange({ ...filters, courier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  {filterOptions.couriers.map((courier) => (
                    <SelectItem key={courier} value={courier}>
                      {courier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.courier && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => clearFilter('courier')}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Source Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <div className="flex items-center space-x-1">
              <Select 
                value={filters.utm_source || ''} 
                onValueChange={(value) => onFiltersChange({ ...filters, utm_source: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  {filterOptions.sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.utm_source && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => clearFilter('utm_source')}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Clear All Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">&nbsp;</label>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="w-full"
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}