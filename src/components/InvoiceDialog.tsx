import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/format';
import { Plus, Trash2, User, Package } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_id?: string;
}

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDialog({ open, onOpenChange }: InvoiceDialogProps) {
  const [customerInfo, setCustomerInfo] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
  });
  
  const [invoiceData, setInvoiceData] = useState({
    due_date: '',
    tax_rate: 0.20,
    discount_amount: 0,
    notes: '',
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers for selection
  const { data: customers } = useQuery({
    queryKey: ['customers-for-invoice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('id, full_name, email, phone, address')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch products for selection
  const { data: products } = useQuery({
    queryKey: ['products-for-invoice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, nom, prix')
        .eq('en_stock', true)
        .order('nom');
      
      if (error) throw error;
      return data;
    }
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoicePayload: any) => {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoicePayload])
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Insert invoice items
      const itemsPayload = items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsPayload);
      
      if (itemsError) throw itemsError;
      
      return invoice;
    },
    onSuccess: (invoice) => {
      toast({
        title: "Facture créée",
        description: `Facture ${invoice.invoice_number} créée avec succès`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-financial-transactions'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive"
      });
      console.error('Error creating invoice:', error);
    }
  });

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    const customer = customers?.find(c => c.id === customerId);
    if (customer) {
      setCustomerInfo({
        customer_name: customer.full_name || '',
        customer_email: customer.email || '',
        customer_phone: customer.phone || '',
        customer_address: customer.address || '',
      });
    }
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate total price
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleProductSelect = (itemId: string, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      handleItemChange(itemId, 'product_id', productId);
      handleItemChange(itemId, 'description', product.nom);
      handleItemChange(itemId, 'unit_price', Number(product.prix));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTaxAmount = () => {
    return calculateSubtotal() * invoiceData.tax_rate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount() - invoiceData.discount_amount;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerInfo.customer_name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du client est requis",
        variant: "destructive"
      });
      return;
    }
    
    if (items.every(item => !item.description.trim())) {
      toast({
        title: "Erreur",
        description: "Au moins un article est requis",
        variant: "destructive"
      });
      return;
    }

    const invoicePayload = {
      customer_id: selectedCustomer || null,
      ...customerInfo,
      due_date: invoiceData.due_date || null,
      tax_rate: invoiceData.tax_rate,
      discount_amount: invoiceData.discount_amount,
      notes: invoiceData.notes,
    };

    createInvoiceMutation.mutate(invoicePayload);
  };

  const handleClose = () => {
    setCustomerInfo({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
    });
    setInvoiceData({
      due_date: '',
      tax_rate: 0.20,
      discount_amount: 0,
      notes: '',
    });
    setItems([{ id: '1', description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
    setSelectedCustomer('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nouvelle Facture
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer-select">Client Existant</Label>
                <Select value={selectedCustomer} onValueChange={handleCustomerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client existant" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Nom *</Label>
                  <Input
                    id="customer_name"
                    value={customerInfo.customer_name}
                    onChange={(e) => setCustomerInfo(prev => ({
                      ...prev,
                      customer_name: e.target.value
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={customerInfo.customer_email}
                    onChange={(e) => setCustomerInfo(prev => ({
                      ...prev,
                      customer_email: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">Téléphone</Label>
                  <Input
                    id="customer_phone"
                    value={customerInfo.customer_phone}
                    onChange={(e) => setCustomerInfo(prev => ({
                      ...prev,
                      customer_phone: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Date d'échéance</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={invoiceData.due_date}
                    onChange={(e) => setInvoiceData(prev => ({
                      ...prev,
                      due_date: e.target.value
                    }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="customer_address">Adresse</Label>
                <Textarea
                  id="customer_address"
                  value={customerInfo.customer_address}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    customer_address: e.target.value
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-4">
                      {index === 0 && <Label>Produit</Label>}
                      <Select 
                        value={item.product_id || ''} 
                        onValueChange={(value) => handleProductSelect(item.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.nom} - {formatPrice(Number(product.prix))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-3">
                      {index === 0 && <Label>Description *</Label>}
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Description"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      {index === 0 && <Label>Quantité</Label>}
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      {index === 0 && <Label>Prix unitaire</Label>}
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      {index === 0 && <Label>Actions</Label>}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un article
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    placeholder="Notes additionnelles..."
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tax_rate">Taux TVA (%)</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        step="0.01"
                        value={invoiceData.tax_rate * 100}
                        onChange={(e) => setInvoiceData(prev => ({
                          ...prev,
                          tax_rate: (parseFloat(e.target.value) || 0) / 100
                        }))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_amount">Remise (MAD)</Label>
                      <Input
                        id="discount_amount"
                        type="number"
                        step="0.01"
                        value={invoiceData.discount_amount}
                        onChange={(e) => setInvoiceData(prev => ({
                          ...prev,
                          discount_amount: parseFloat(e.target.value) || 0
                        }))}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA ({(invoiceData.tax_rate * 100).toFixed(1)}%):</span>
                      <span>{formatPrice(calculateTaxAmount())}</span>
                    </div>
                    {invoiceData.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Remise:</span>
                        <span>-{formatPrice(invoiceData.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? 'Création...' : 'Créer la facture'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}