import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/format';
import type { CartItem } from '@/context/CartContext';
import type { CartBundle } from '@/types/bundle';

const checkoutSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  phone: z.string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
    .max(15, 'Le numéro de téléphone ne peut pas dépasser 15 chiffres')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Format de téléphone invalide'),
  ville: z.string()
    .min(2, 'La ville doit contenir au moins 2 caractères')
    .max(30, 'Le nom de la ville ne peut pas dépasser 30 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le nom de ville ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  adresse: z.string()
    .min(10, 'L\'adresse doit contenir au moins 10 caractères')
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  bundles?: CartBundle[];
  onSuccess?: () => void;
}

export function CheckoutModal({ isOpen, onClose, items, bundles = [], onSuccess }: CheckoutModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const leadIdRef = useRef<string | null>(null);
  
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      nom: '',
      phone: '',
      ville: '',
      adresse: '',
    },
  });

  const itemsTotal = items.reduce((sum, item) => sum + item.product_prix * item.quantite, 0);
  const bundleTotal = bundles.reduce((sum, bundle) => sum + bundle.bundle_total * bundle.primary_item.quantite, 0);
  const total = itemsTotal + bundleTotal;

  // Create or update lead when form data changes
  const updateLead = async (data: Partial<CheckoutForm>) => {
    try {
      const currentValues = form.getValues();
      const completedFields = Object.values(data).filter(value => value && value.trim() !== '').length;
      const formCompletionPercentage = Math.round((completedFields / 4) * 100);

      const leadData = {
        nom: data.nom || null,
        phone: data.phone || null,
        ville: data.ville || null,
        adresse: data.adresse || null,
        cart_items: { items, bundles } as any,
        total_value: total,
        form_completion_percentage: formCompletionPercentage,
        last_activity: new Date().toISOString(),
      };

      if (leadIdRef.current) {
        // Update existing lead
        await supabase
          .from('leads')
          .update(leadData)
          .eq('id', leadIdRef.current);
      } else {
        // Create new lead
        const { data: newLead, error } = await supabase
          .from('leads')
          .insert(leadData)
          .select('id')
          .single();

        if (error) throw error;
        leadIdRef.current = newLead.id;
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  // Watch form changes and update lead
  useEffect(() => {
    if (!isOpen) return;

    const subscription = form.watch((data) => {
      // Only update if at least one field has content
      const hasContent = Object.values(data).some(value => value && value.trim() !== '');
      if (hasContent) {
        updateLead(data);
      }
    });

    return () => subscription.unsubscribe();
  }, [isOpen, items, bundles, total]);

  // Reset lead ref when modal closes
  useEffect(() => {
    if (!isOpen) {
      leadIdRef.current = null;
    }
  }, [isOpen]);

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const { data: result, error } = await supabase.rpc('place_order', {
        p_client: data as any,
        p_items: items as any,
      });

      if (error) throw error;

      if (result && result.length > 0) {
        const { code_suivi } = result[0];
        
        // Mark lead as converted if it exists
        if (leadIdRef.current) {
          await supabase
            .from('leads')
            .update({ 
              status: 'converted',
              converted_to_order_id: result[0].order_id 
            })
            .eq('id', leadIdRef.current);
        }

        toast({
          title: "Commande créée",
          description: `Code de suivi : ${code_suivi}`,
        });
        onSuccess?.();
        onClose();
        navigate(`/confirmation/${code_suivi}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finaliser la commande</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Récapitulatif</h4>
          
          {/* Regular Items */}
          {items.map((item) => (
            <div key={`${item.product_id}-${JSON.stringify(item.variables || {})}`} className="flex justify-between text-sm mb-1">
              <span>
                {item.product_nom} x{item.quantite}
                {item.variables && (item.variables.color || item.variables.size) && (
                  <span className="text-muted-foreground text-xs ml-1">
                    ({[item.variables.color, item.variables.size].filter(Boolean).join(', ')})
                  </span>
                )}
              </span>
              <span>{formatPrice(item.product_prix * item.quantite)}</span>
            </div>
          ))}

          {/* Bundle Items */}
          {bundles.map((bundle) => (
            <div key={bundle.bundle_id} className="mb-2 p-2 bg-primary/5 rounded border-l-2 border-primary/20">
              <div className="flex justify-between text-sm font-medium text-primary mb-1">
                <span>{bundle.bundle_name} x{bundle.primary_item.quantite}</span>
                <span>{formatPrice(bundle.bundle_total * bundle.primary_item.quantite)}</span>
              </div>
              <div className="text-xs text-muted-foreground ml-2 space-y-1">
                <div>• {bundle.primary_item.product_nom}</div>
                <div>• {bundle.secondary_item.product_nom} (réduit)</div>
                <div className="text-destructive">
                  Économie: {formatPrice(bundle.total_savings * bundle.primary_item.quantite)}
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-2 mt-2 space-y-1">
            {items.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>Articles:</span>
                <span>{formatPrice(itemsTotal)}</span>
              </div>
            )}
            {bundles.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>Packs:</span>
                <span>{formatPrice(bundleTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="tel" 
                      placeholder="0612345678"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ville"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Casablanca"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse complète</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="123 Avenue Mohammed V, Quartier..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}