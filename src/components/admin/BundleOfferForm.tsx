import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface BundleOfferFormData {
  name: string;
  description: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  display_order: number;
}

interface BundleOffer {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  display_order: number;
}

interface BundleOfferFormProps {
  bundle?: BundleOffer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BundleOfferForm({ bundle, onSuccess, onCancel }: BundleOfferFormProps) {
  const { toast } = useToast();
  const isEditing = !!bundle;

  const { register, handleSubmit, formState: { errors } } = useForm<BundleOfferFormData>({
    defaultValues: {
      name: bundle?.name || '',
      description: bundle?.description || '',
      is_active: bundle?.is_active ?? true,
      start_date: bundle?.start_date || '',
      end_date: bundle?.end_date || '',
      display_order: bundle?.display_order || 0,
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: BundleOfferFormData) => {
      if (isEditing) {
        const { error } = await supabase
          .from('bundle_offers')
          .update(data)
          .eq('id', bundle.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bundle_offers')
          .insert([data]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Offre modifiée" : "Offre créée",
        description: `L'offre bundle a été ${isEditing ? 'modifiée' : 'créée'} avec succès.`
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Error saving bundle offer:', error);
      toast({
        title: "Erreur",
        description: `Impossible de ${isEditing ? 'modifier' : 'créer'} l'offre bundle.`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: BundleOfferFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de l'offre *</Label>
          <Input
            id="name"
            {...register('name', { 
              required: 'Le nom est requis',
              minLength: { value: 3, message: 'Le nom doit contenir au moins 3 caractères' }
            })}
            placeholder="Ex: Offre Duo Hiver"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_order">Ordre d'affichage</Label>
          <Input
            id="display_order"
            type="number"
            {...register('display_order', { 
              valueAsNumber: true,
              min: { value: 0, message: 'L\'ordre doit être positif' }
            })}
            placeholder="0"
          />
          {errors.display_order && (
            <p className="text-sm text-destructive">{errors.display_order.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Décrivez votre offre bundle..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Date de début</Label>
          <Input
            id="start_date"
            type="date"
            {...register('start_date')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Date de fin</Label>
          <Input
            id="end_date"
            type="date"
            {...register('end_date')}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          {...register('is_active')}
          defaultChecked={bundle?.is_active ?? true}
        />
        <Label htmlFor="is_active">Offre active</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}