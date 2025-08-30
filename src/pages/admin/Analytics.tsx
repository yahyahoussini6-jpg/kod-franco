import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyticsClient, AnalyticsFilters as IAnalyticsFilters } from '@/integrations/supabase/analytics';
import { formatPrice, formatPercentage } from '@/lib/format';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MapPin, 
  Package, 
  DollarSign, 
  Target,
  ShoppingCart
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; direction: 'up' | 'down' };
}

function KpiCard({ title, value, subtitle, icon: Icon, trend }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend.value).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SimpleDataTableProps {
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    formatter?: (value: any) => string;
  }>;
}

function SimpleDataTable({ data, columns }: SimpleDataTableProps) {
  if (!data.length) {
    return <div className="text-center text-muted-foreground py-4">No data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th key={column.key} className="text-left p-2 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, index) => (
            <tr key={index} className="border-b hover:bg-muted/50">
              {columns.map((column) => (
                <td key={column.key} className="p-2">
                  {column.formatter 
                    ? column.formatter(row[column.key]) 
                    : row[column.key] || '--'
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = React.useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  
  const [filters, setFilters] = React.useState<IAnalyticsFilters>({});

  // Fetch overview metrics
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['analytics-overview', dateRange, filters],
    queryFn: async () => {
      console.log('Fetching analytics overview for:', { dateRange, filters });
      const result = await analyticsClient.getOverview(dateRange.from, dateRange.to, filters);
      console.log('Analytics overview result:', result);
      return result;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
  });

  // Fetch SLA metrics
  const { data: sla, isLoading: slaLoading } = useQuery({
    queryKey: ['analytics-sla', dateRange, filters],
    queryFn: () => analyticsClient.getSLA(dateRange.from, dateRange.to, filters),
  });

  // Fetch funnel data
  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['analytics-funnel', dateRange],
    queryFn: () => analyticsClient.getFunnelCounts(dateRange.from, dateRange.to),
  });

  // Fetch daily trends
  const { data: dailyTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics-daily', dateRange],
    queryFn: () => analyticsClient.getDailyOverview(dateRange.from, dateRange.to),
  });

  // Fetch geo data
  const { data: geoData, isLoading: geoLoading } = useQuery({
    queryKey: ['analytics-geo', dateRange, filters],
    queryFn: () => analyticsClient.getGeo(dateRange.from, dateRange.to, filters),
  });

  // Fetch product data
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['analytics-products', dateRange, filters],
    queryFn: () => analyticsClient.getProducts(dateRange.from, dateRange.to, filters),
  });

  // Fetch marketing data
  const { data: marketingData, isLoading: marketingLoading } = useQuery({
    queryKey: ['analytics-marketing', dateRange, filters],
    queryFn: () => analyticsClient.getMarketing(dateRange.from, dateRange.to, filters),
  });

  // Fetch aged shipments
  const { data: agedShipments, isLoading: agedLoading } = useQuery({
    queryKey: ['analytics-aged'],
    queryFn: () => analyticsClient.getAgedShipments(7),
  });

  const isLoading = overviewLoading || slaLoading || funnelLoading || trendsLoading;

  // Prepare funnel chart data
  const funnelChartData = React.useMemo(() => {
    if (!funnelData || funnelData.length === 0) return [];
    
    const latest = funnelData[funnelData.length - 1];
    return [
      { stage: 'Nouvelle', count: latest.nouvelle || 0, color: '#8884d8' },
      { stage: 'Confirmée', count: latest.confirmee || 0, color: '#82ca9d' },
      { stage: 'En préparation', count: latest.en_preparation || 0, color: '#ffc658' },
      { stage: 'Expédiée', count: latest.expediee || 0, color: '#ff7300' },
      { stage: 'Livrée', count: latest.livree || 0, color: '#00ff00' },
      { stage: 'Annulée', count: latest.annulee || 0, color: '#ff0000' },
      { stage: 'Retournée', count: latest.retournee || 0, color: '#ff69b4' }
    ];
  }, [funnelData]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="sla">SLA & Speed</TabsTrigger>
          <TabsTrigger value="geo">Geography</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Debug Info */}
          {overviewError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Erreur analytics: {overviewError.message}
            </div>
          )}
          
          {/* Executive KPIs Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="CA Livré"
              value={formatPrice(overview?.delivered_revenue || 0)}
              icon={DollarSign}
              subtitle={`${overview?.delivered_orders || 0} commandes`}
            />
            <KpiCard
              title="Commandes Livrées"
              value={overview?.delivered_orders?.toString() || '0'}
              icon={Package}
              subtitle="Total livré"
            />
            <KpiCard
              title="Panier Moyen"
              value={formatPrice(overview?.delivered_aov || 0)}
              icon={TrendingUp}
              subtitle="Sur commandes livrées"
            />
            <KpiCard
              title="Marge Contributive"
              value={formatPrice(overview?.contribution || 0)}
              icon={Target}
              subtitle={formatPercentage(overview?.contribution_pct || 0)}
            />
          </div>

          {/* Executive KPIs Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Taux de Livraison"
              value={formatPercentage(overview?.delivery_rate || 0)}
              icon={TrendingUp}
              subtitle="Expédiées → Livrées"
            />
            <KpiCard
              title="Taux RTO"
              value={formatPercentage(overview?.rto_rate || 0)}
              icon={TrendingDown}
              subtitle="Retours après expédition"
            />
            <KpiCard
              title="Taux d'Annulation"
              value={formatPercentage(overview?.cancel_rate || 0)}
              icon={TrendingDown}
              subtitle="Avant expédition"
            />
            <KpiCard
              title="GMV Tenté"
              value={formatPrice(overview?.attempted_gmv || 0)}
              icon={DollarSign}
              subtitle="Toutes commandes"
            />
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="d" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Revenue']} />
                    <Line type="monotone" dataKey="delivered_revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Daily Orders Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="d" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="delivered_orders" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={funnelChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Conversion Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Confirmation Rate"
              value={funnelChartData[1] && funnelChartData[0] ? 
                formatPercentage(funnelChartData[1].count / Math.max(funnelChartData[0].count, 1)) : '0%'}
              icon={TrendingUp}
              subtitle="Confirmée ÷ Nouvelle"
            />
            <KpiCard
              title="Pack Rate"
              value={funnelChartData[2] && funnelChartData[1] ? 
                formatPercentage(funnelChartData[2].count / Math.max(funnelChartData[1].count, 1)) : '0%'}
              icon={Package}
              subtitle="En préparation ÷ Confirmée"
            />
            <KpiCard
              title="Ship Rate"
              value={funnelChartData[3] && funnelChartData[2] ? 
                formatPercentage(funnelChartData[3].count / Math.max(funnelChartData[2].count, 1)) : '0%'}
              icon={TrendingUp}
              subtitle="Expédiée ÷ En préparation"
            />
            <KpiCard
              title="Overall Delivered"
              value={funnelChartData[4] && funnelChartData[0] ? 
                formatPercentage(funnelChartData[4].count / Math.max(funnelChartData[0].count, 1)) : '0%'}
              icon={Target}
              subtitle="Livrée ÷ Nouvelle"
            />
          </div>
        </TabsContent>

        <TabsContent value="sla" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard
              title="Time to Confirm"
              value={`${(sla?.t_confirm_p50 || 0).toFixed(1)}h`}
              subtitle={`P90: ${(sla?.t_confirm_p90 || 0).toFixed(1)}h`}
              icon={Clock}
            />
            <KpiCard
              title="Time to Pack"
              value={`${(sla?.t_pack_p50 || 0).toFixed(1)}h`}
              subtitle={`P90: ${(sla?.t_pack_p90 || 0).toFixed(1)}h`}
              icon={Package}
            />
            <KpiCard
              title="Time to Ship"
              value={`${(sla?.t_ship_p50 || 0).toFixed(1)}h`}
              subtitle={`P90: ${(sla?.t_ship_p90 || 0).toFixed(1)}h`}
              icon={TrendingUp}
            />
            <KpiCard
              title="Transit Time"
              value={`${(sla?.t_transit_p50 || 0).toFixed(1)}d`}
              subtitle={`P90: ${(sla?.t_transit_p90 || 0).toFixed(1)}d`}
              icon={MapPin}
            />
            <KpiCard
              title="Order-to-Delivery"
              value={`${(sla?.t_o2d_p50 || 0).toFixed(1)}d`}
              subtitle={`P90: ${(sla?.t_o2d_p90 || 0).toFixed(1)}d`}
              icon={Target}
            />
          </div>

          {/* Aged Shipments */}
          {agedShipments && agedShipments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Aged Shipments (&gt;7 days in transit)</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleDataTable
                  data={agedShipments}
                  columns={[
                    { key: 'code_suivi', label: 'Tracking Code' },
                    { key: 'city', label: 'City' },
                    { key: 'courier', label: 'Courier' },
                    { key: 'days_in_transit', label: 'Days in Transit' },
                    { key: 'order_total', label: 'Order Total', formatter: formatPrice },
                  ]}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="geo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by City & Courier</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleDataTable
                data={geoData || []}
                columns={[
                  { key: 'city', label: 'City' },
                  { key: 'courier', label: 'Courier' },
                  { key: 'delivered_orders', label: 'Delivered Orders' },
                  { key: 'delivered_revenue', label: 'Delivered Revenue', formatter: formatPrice },
                  { key: 'delivery_rate', label: 'Delivery Rate', formatter: formatPercentage },
                  { key: 'transit_p90_days', label: 'Transit P90 (days)' },
                  { key: 'shipping_cost_per_delivered', label: 'Shipping Cost/Order', formatter: formatPrice },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleDataTable
                data={productData || []}
                columns={[
                  { key: 'product_name', label: 'Product' },
                  { key: 'category', label: 'Category' },
                  { key: 'delivered_units', label: 'Delivered Units' },
                  { key: 'delivered_revenue', label: 'Delivered Revenue', formatter: formatPrice },
                  { key: 'sku_margin', label: 'SKU Margin', formatter: formatPrice },
                  { key: 'return_rate', label: 'Return Rate', formatter: formatPercentage },
                  { key: 'cancel_rate', label: 'Cancel Rate', formatter: formatPercentage },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Source Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleDataTable
                data={marketingData || []}
                columns={[
                  { key: 'source', label: 'Source' },
                  { key: 'campaign', label: 'Campaign' },
                  { key: 'delivered_orders', label: 'Delivered Orders' },
                  { key: 'delivered_revenue', label: 'Delivered Revenue', formatter: formatPrice },
                  { key: 'delivered_aov', label: 'Delivered AOV', formatter: formatPrice },
                  { key: 'delivered_rate', label: 'Delivered Rate', formatter: formatPercentage },
                  { key: 'rto_rate', label: 'RTO Rate', formatter: formatPercentage },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}