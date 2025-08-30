import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, formatDate } from '@/lib/format';
import { Calendar, Download, FileText, Calculator, Receipt, DollarSign, Loader2 } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: 'sales_journal' | 'cogs_statement' | 'vat_invoices' | 'cod_reconciliation';
}

export function ExportDialog({ open, onOpenChange, exportType }: ExportDialogProps) {
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  
  const [filters, setFilters] = useState({
    format: 'csv' as 'csv' | 'excel',
    include_details: true,
    include_summary: true,
    group_by_date: false,
    currency: 'MAD'
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Fetch data based on export type
  const { data: exportData, isLoading } = useQuery({
    queryKey: ['export-data', exportType, dateRange],
    queryFn: async () => {
      const startDate = new Date(dateRange.start_date);
      const endDate = new Date(dateRange.end_date);
      endDate.setHours(23, 59, 59, 999);

      switch (exportType) {
        case 'sales_journal':
          return await fetchSalesJournal(startDate, endDate);
        case 'cogs_statement':
          return await fetchCOGSStatement(startDate, endDate);
        case 'vat_invoices':
          return await fetchVATInvoices(startDate, endDate);
        case 'cod_reconciliation':
          return await fetchCODReconciliation(startDate, endDate);
        default:
          return null;
      }
    },
    enabled: open
  });

  const fetchSalesJournal = async (startDate: Date, endDate: Date) => {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'livree')
      .order('created_at');

    if (error) throw error;
    return orders;
  };

  const fetchCOGSStatement = async (startDate: Date, endDate: Date) => {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(product_nom, category, quantite, cogs_per_unit, unit_price)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'livree')
      .order('created_at');

    if (error) throw error;
    return orders;
  };

  const fetchVATInvoices = async (startDate: Date, endDate: Date) => {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items(*)
      `)
      .gte('invoice_date', startDate.toISOString().split('T')[0])
      .lte('invoice_date', endDate.toISOString().split('T')[0])
      .order('invoice_date');

    if (error) throw error;
    return invoices;
  };

  const fetchCODReconciliation = async (startDate: Date, endDate: Date) => {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('delivered_at', startDate.toISOString())
      .lte('delivered_at', endDate.toISOString())
      .eq('status', 'livree')
      .not('cod_fee', 'is', null)
      .order('delivered_at');

    if (error) throw error;
    return orders;
  };

  const generateCSV = (data: any[], headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
  };

  const exportSalesJournal = () => {
    if (!exportData) return;

    const headers = [
      'Date', 'N° Commande', 'Client', 'Ville', 'Montant HT', 'TVA', 'Montant TTC', 
      'COGS', 'Marge', 'Statut', 'Source'
    ];

    const rows = exportData.map((order: any) => [
      formatDate(order.created_at),
      order.code_suivi,
      order.client_nom,
      order.client_ville,
      ((order.order_total || 0) / 1.2).toFixed(2),
      ((order.order_total || 0) * 0.2 / 1.2).toFixed(2),
      (order.order_total || 0).toFixed(2),
      (order.cogs_total || 0).toFixed(2),
      ((order.order_total || 0) - (order.cogs_total || 0) - (order.shipping_cost || 0)).toFixed(2),
      order.status,
      order.utm_source || 'Direct'
    ]);

    // Add summary row if requested
    if (filters.include_summary) {
      const totalOrders = exportData.length;
      const totalRevenue = exportData.reduce((sum: number, o: any) => sum + (o.order_total || 0), 0);
      const totalCOGS = exportData.reduce((sum: number, o: any) => sum + (o.cogs_total || 0), 0);
      const totalMargin = totalRevenue - totalCOGS;

      rows.push([]);
      rows.push(['RÉSUMÉ', '', '', '', '', '', '', '', '', '', '']);
      rows.push(['Total Commandes', totalOrders.toString(), '', '', '', '', '', '', '', '', '']);
      rows.push(['Chiffre d\'Affaires', '', '', '', '', '', totalRevenue.toFixed(2), '', '', '', '']);
      rows.push(['Total COGS', '', '', '', '', '', '', totalCOGS.toFixed(2), '', '', '']);
      rows.push(['Marge Totale', '', '', '', '', '', '', '', totalMargin.toFixed(2), '', '']);
    }

    return generateCSV(exportData, headers, rows);
  };

  const exportCOGSStatement = () => {
    if (!exportData) return;

    const headers = [
      'Date', 'Produit', 'Catégorie', 'Quantité Vendue', 'Prix Unitaire', 
      'COGS Unitaire', 'Marge Unitaire', 'CA Total', 'COGS Total', 'Marge Totale'
    ];

    const rows: any[] = [];
    
    exportData.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        const unitPrice = item.unit_price || 0;
        const cogsUnit = item.cogs_per_unit || 0;
        const quantity = item.quantite || 0;
        const totalRevenue = unitPrice * quantity;
        const totalCOGS = cogsUnit * quantity;
        const totalMargin = totalRevenue - totalCOGS;

        rows.push([
          formatDate(order.created_at),
          item.product_nom,
          item.category || 'Non catégorisé',
          quantity,
          unitPrice.toFixed(2),
          cogsUnit.toFixed(2),
          (unitPrice - cogsUnit).toFixed(2),
          totalRevenue.toFixed(2),
          totalCOGS.toFixed(2),
          totalMargin.toFixed(2)
        ]);
      });
    });

    return generateCSV(exportData, headers, rows);
  };

  const exportVATInvoices = () => {
    if (!exportData) return;

    const headers = [
      'N° Facture', 'Date', 'Client', 'Montant HT', 'Taux TVA', 'Montant TVA', 
      'Montant TTC', 'Statut', 'Échéance'
    ];

    const rows = exportData.map((invoice: any) => [
      invoice.invoice_number,
      formatDate(invoice.invoice_date),
      invoice.customer_name,
      invoice.subtotal.toFixed(2),
      (invoice.tax_rate * 100).toFixed(1) + '%',
      invoice.tax_amount.toFixed(2),
      invoice.total_amount.toFixed(2),
      invoice.status,
      invoice.due_date ? formatDate(invoice.due_date) : 'N/A'
    ]);

    return generateCSV(exportData, headers, rows);
  };

  const exportCODReconciliation = () => {
    if (!exportData) return;

    const headers = [
      'Date Livraison', 'N° Commande', 'Client', 'Montant Commande', 'Frais COD', 
      'Montant COD Attendu', 'Statut Paiement', 'Transporteur'
    ];

    const rows = exportData.map((order: any) => [
      formatDate(order.delivered_at),
      order.code_suivi,
      order.client_nom,
      (order.order_total || 0).toFixed(2),
      (order.cod_fee || 0).toFixed(2),
      ((order.order_total || 0) - (order.cod_fee || 0)).toFixed(2),
      'En attente', // This would come from payment tracking
      order.courier || 'N/A'
    ]);

    // Add reconciliation summary
    if (filters.include_summary) {
      const totalOrders = exportData.length;
      const totalCOD = exportData.reduce((sum: number, o: any) => sum + (o.order_total || 0), 0);
      const totalFees = exportData.reduce((sum: number, o: any) => sum + (o.cod_fee || 0), 0);
      const expectedAmount = totalCOD - totalFees;

      rows.push([]);
      rows.push(['RÉCONCILIATION COD', '', '', '', '', '', '', '']);
      rows.push(['Total Commandes COD', totalOrders.toString(), '', '', '', '', '', '']);
      rows.push(['Montant Total Commandes', '', '', totalCOD.toFixed(2), '', '', '', '']);
      rows.push(['Total Frais COD', '', '', '', totalFees.toFixed(2), '', '', '']);
      rows.push(['Montant COD Attendu', '', '', '', '', expectedAmount.toFixed(2), '', '']);
    }

    return generateCSV(exportData, headers, rows);
  };

  const handleExport = async () => {
    if (!exportData) return;

    setIsExporting(true);
    
    try {
      let blob: Blob | null = null;
      let filename = '';

      switch (exportType) {
        case 'sales_journal':
          blob = exportSalesJournal();
          filename = `journal-ventes-${dateRange.start_date}-${dateRange.end_date}.csv`;
          break;
        case 'cogs_statement':
          blob = exportCOGSStatement();
          filename = `etat-cogs-${dateRange.start_date}-${dateRange.end_date}.csv`;
          break;
        case 'vat_invoices':
          blob = exportVATInvoices();
          filename = `factures-tva-${dateRange.start_date}-${dateRange.end_date}.csv`;
          break;
        case 'cod_reconciliation':
          blob = exportCODReconciliation();
          filename = `reconciliation-cod-${dateRange.start_date}-${dateRange.end_date}.csv`;
          break;
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export réussi",
          description: `Le fichier ${filename} a été téléchargé`
        });

        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le fichier d'export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getTitle = () => {
    switch (exportType) {
      case 'sales_journal': return 'Export Journal des Ventes';
      case 'cogs_statement': return 'Export État COGS';
      case 'vat_invoices': return 'Export Factures TVA';
      case 'cod_reconciliation': return 'Export Réconciliation COD';
      default: return 'Export Comptabilité';
    }
  };

  const getIcon = () => {
    switch (exportType) {
      case 'sales_journal': return <FileText className="h-5 w-5" />;
      case 'cogs_statement': return <Calculator className="h-5 w-5" />;
      case 'vat_invoices': return <Receipt className="h-5 w-5" />;
      case 'cod_reconciliation': return <DollarSign className="h-5 w-5" />;
      default: return <Download className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Période d'Export
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    start_date: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    end_date: e.target.value
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Options d'Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select value={filters.format} onValueChange={(value: 'csv' | 'excel') => 
                    setFilters(prev => ({ ...prev, format: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel (bientôt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={filters.currency} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">MAD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_details"
                    checked={filters.include_details}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, include_details: checked as boolean }))
                    }
                  />
                  <Label htmlFor="include_details">Inclure les détails</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_summary"
                    checked={filters.include_summary}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, include_summary: checked as boolean }))
                    }
                  />
                  <Label htmlFor="include_summary">Inclure le résumé</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="group_by_date"
                    checked={filters.group_by_date}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, group_by_date: checked as boolean }))
                    }
                  />
                  <Label htmlFor="group_by_date">Grouper par date</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          {exportData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aperçu des Données</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>📊 <strong>{exportData.length}</strong> enregistrements trouvés</p>
                  <p>📅 Période: {formatDate(dateRange.start_date)} - {formatDate(dateRange.end_date)}</p>
                  {exportType === 'sales_journal' && (
                    <p>💰 CA Total: {formatPrice(exportData.reduce((sum: number, o: any) => sum + (o.order_total || 0), 0))}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isLoading || isExporting || !exportData}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}