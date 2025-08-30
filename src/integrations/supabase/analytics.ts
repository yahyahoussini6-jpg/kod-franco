import { supabase } from './client';

export interface AnalyticsFilters {
  city?: string;
  courier?: string;
  utm_source?: string;
  category?: string;
}

export interface OverviewMetrics {
  delivered_orders: number;
  delivered_revenue: number;
  delivered_aov: number;
  delivery_rate: number;
  rto_rate: number;
  cancel_rate: number;
  contribution: number;
  contribution_pct: number;
  attempted_gmv: number;
}

export interface SLAMetrics {
  t_confirm_p50: number;
  t_confirm_p90: number;
  t_pack_p50: number;
  t_pack_p90: number;
  t_ship_p50: number;
  t_ship_p90: number;
  t_transit_p50: number;
  t_transit_p90: number;
  t_o2d_p50: number;
  t_o2d_p90: number;
}

export interface GeoMetrics {
  city: string;
  courier: string;
  delivered_orders: number;
  delivered_revenue: number;
  delivery_rate: number;
  transit_p90_days: number;
  shipping_cost_per_delivered: number;
}

export interface ProductMetrics {
  product_id: string;
  product_name: string;
  category: string;
  delivered_units: number;
  delivered_revenue: number;
  sku_margin: number;
  return_rate: number;
  cancel_rate: number;
  aov_contrib: number;
}

export interface MarketingMetrics {
  source: string;
  campaign: string;
  delivered_orders: number;
  delivered_revenue: number;
  delivered_aov: number;
  delivered_rate: number;
  rto_rate: number;
}

export interface DailyOverview {
  d: string;
  delivered_orders: number;
  delivered_revenue: number;
  delivered_aov: number;
}

export interface FunnelCounts {
  d: string;
  nouvelle: number;
  confirmee: number;
  en_preparation: number;
  expediee: number;
  livree: number;
  annulee: number;
  retournee: number;
}

export class AnalyticsClient {
  async getOverview(from: Date, to: Date, filters: AnalyticsFilters = {}): Promise<OverviewMetrics> {
    const { data, error } = await supabase.rpc('rpc_analytics_overview', {
      from_ts: from.toISOString(),
      to_ts: to.toISOString(),
      filters: filters as any
    });

    if (error) throw error;
    return data?.[0] || {
      delivered_orders: 0,
      delivered_revenue: 0,
      delivered_aov: 0,
      delivery_rate: 0,
      rto_rate: 0,
      cancel_rate: 0,
      contribution: 0,
      contribution_pct: 0,
      attempted_gmv: 0
    };
  }

  async getSLA(from: Date, to: Date, filters: AnalyticsFilters = {}): Promise<SLAMetrics> {
    const { data, error } = await supabase.rpc('rpc_analytics_sla', {
      from_ts: from.toISOString(),
      to_ts: to.toISOString(),
      filters: filters as any
    });

    if (error) throw error;
    return data?.[0] || {
      t_confirm_p50: 0,
      t_confirm_p90: 0,
      t_pack_p50: 0,
      t_pack_p90: 0,
      t_ship_p50: 0,
      t_ship_p90: 0,
      t_transit_p50: 0,
      t_transit_p90: 0,
      t_o2d_p50: 0,
      t_o2d_p90: 0
    };
  }

  async getGeo(from: Date, to: Date, filters: AnalyticsFilters = {}): Promise<GeoMetrics[]> {
    const { data, error } = await supabase.rpc('rpc_analytics_geo', {
      from_ts: from.toISOString(),
      to_ts: to.toISOString(),
      filters: filters as any
    });

    if (error) throw error;
    return data || [];
  }

  async getProducts(from: Date, to: Date, filters: AnalyticsFilters = {}): Promise<ProductMetrics[]> {
    const { data, error } = await supabase.rpc('rpc_analytics_products', {
      from_ts: from.toISOString(),
      to_ts: to.toISOString(),
      filters: filters as any
    });

    if (error) throw error;
    return data || [];
  }

  async getMarketing(from: Date, to: Date, filters: AnalyticsFilters = {}): Promise<MarketingMetrics[]> {
    const { data, error } = await supabase.rpc('rpc_analytics_marketing', {
      from_ts: from.toISOString(),
      to_ts: to.toISOString(),
      filters: filters as any
    });

    if (error) throw error;
    return data || [];
  }

  async getDailyOverview(from: Date, to: Date): Promise<DailyOverview[]> {
    const { data, error } = await supabase
      .from('v_overview_daily')
      .select('*')
      .gte('d', from.toISOString().split('T')[0])
      .lte('d', to.toISOString().split('T')[0])
      .order('d');

    if (error) throw error;
    return data || [];
  }

  async getFunnelCounts(from: Date, to: Date): Promise<FunnelCounts[]> {
    const { data, error } = await supabase
      .from('v_funnel_counts')
      .select('*')
      .gte('d', from.toISOString().split('T')[0])
      .lte('d', to.toISOString().split('T')[0])
      .order('d');

    if (error) throw error;
    return data || [];
  }

  async getAgedShipments(maxDays: number = 7) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, code_suivi, city, courier, shipped_at, order_total')
      .eq('status', 'expediee')
      .not('shipped_at', 'is', null)
      .lt('shipped_at', new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;
    
    return (data || []).map(order => ({
      ...order,
      days_in_transit: Math.floor((Date.now() - new Date(order.shipped_at).getTime()) / (24 * 60 * 60 * 1000))
    }));
  }

  async getFilterOptions() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('city, courier, utm_source')
      .not('city', 'is', null)
      .not('courier', 'is', null);

    if (error) throw error;

    const { data: categories, error: categoriesError } = await supabase
      .from('order_items')
      .select('category')
      .not('category', 'is', null);

    if (categoriesError) throw categoriesError;

    const cities = [...new Set(orders?.map(o => o.city).filter(Boolean))];
    const couriers = [...new Set(orders?.map(o => o.courier).filter(Boolean))];
    const sources = [...new Set(orders?.map(o => o.utm_source).filter(Boolean))];
    const categoryList = [...new Set(categories?.map(c => c.category).filter(Boolean))];

    return { cities, couriers, sources, categories: categoryList };
  }
}

export const analyticsClient = new AnalyticsClient();