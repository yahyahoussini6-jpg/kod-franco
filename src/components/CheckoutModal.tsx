import React from 'react';
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

const checkoutSchema = z.object({
  nom: z.string().min(1, 'Ce champ est obligatoire'),
  phone: z.string().min(1, 'Ce champ est obligatoire'),
  ville: z.string().min(1, 'Ce champ est obligatoire'),
  adresse: z.string().min(1, 'Ce champ est obligatoire'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSuccess?: () => void;
}

export function CheckoutModal({ isOpen, onClose, items, onSuccess }: CheckoutModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      nom: '',
      phone: '',
      ville: '',
      adresse: '',
    },
  });

  const total = items.reduce((sum, item) => sum + item.product_prix * item.quantite, 0);

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const { data: result, error } = await supabase.rpc('place_order', {
        p_client: data as any,
        p_items: items as any,
      });

      if (error) throw error;

      if (result && result.length > 0) {
        const { code_suivi } = result[0];
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
          {items.map((item) => (
            <div key={item.product_id} className="flex justify-between text-sm mb-1">
              <span>{item.product_nom} x{item.quantite}</span>
              <span>{formatPrice(item.product_prix * item.quantite)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 font-semibold">
            Total: {formatPrice(total)}
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
                    <Input {...field} type="tel" />
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
                    <Input {...field} />
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
                    <Input {...field} />
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