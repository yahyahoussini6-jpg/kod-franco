import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Upload, X, Palette, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/format';
import ModelViewer3D from '@/components/ModelViewer3D';

const productSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  description: z.string().optional(),
  prix: z.number().min(0, 'Le prix doit être positif'),
  en_stock: z.boolean(),
  variables: z.object({
    colors: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
  }).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nom: '',
      slug: '',
      description: '',
      prix: 0,
      en_stock: true,
      variables: {
        colors: [],
        sizes: [],
      },
    },
  });

  // Upload 3D model file
  const uploadModel = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `models/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('models')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('models')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Upload image files
  const uploadImages = async (files: File[]): Promise<Array<{type: string, url: string}>> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('models')
        .getPublicUrl(filePath);

      return { type: 'image', url: publicUrl };
    });

    return Promise.all(uploadPromises);
  };

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: ProductForm & { id?: string }) => {
      setUploading(true);
      
      try {
        let modelUrl = editingProduct?.model_url;
        let mediaArray = editingProduct?.media || [];
        
        // Upload model file if one is selected
        if (modelFile) {
          modelUrl = await uploadModel(modelFile);
        }

        // Upload image files if any are selected
        if (imageFiles.length > 0) {
          const newImages = await uploadImages(imageFiles);
          mediaArray = [...mediaArray, ...newImages];
        }

        const productData = {
          nom: data.nom,
          slug: data.slug,
          description: data.description,
          prix: data.prix,
          en_stock: data.en_stock,
          variables: data.variables || {},
          model_url: modelUrl,
          media: mediaArray,
        };

        if (data.id) {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('products')
            .insert(productData);
          if (error) throw error;
        }
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: editingProduct ? 'Produit modifié' : 'Produit créé',
        description: 'Le produit a été enregistré avec succès',
      });
      setShowDialog(false);
      setEditingProduct(null);
      setModelFile(null);
      setImageFiles([]);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le produit',
        variant: 'destructive',
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'Produit supprimé',
        description: 'Le produit a été supprimé avec succès',
      });
    },
  });

  const handleSubmit = (data: ProductForm) => {
    productMutation.mutate({
      ...data,
      id: editingProduct?.id,
    });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      nom: product.nom,
      slug: product.slug,
      description: product.description || '',
      prix: product.prix,
      en_stock: product.en_stock,
      variables: product.variables || { colors: [], sizes: [] },
    });
    setShowDialog(true);
  };

  const addColor = () => {
    if (newColor.trim()) {
      const currentColors = form.getValues('variables.colors') || [];
      form.setValue('variables.colors', [...currentColors, newColor.trim()]);
      setNewColor('');
    }
  };

  const removeColor = (index: number) => {
    const currentColors = form.getValues('variables.colors') || [];
    form.setValue('variables.colors', currentColors.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (newSize.trim()) {
      const currentSizes = form.getValues('variables.sizes') || [];
      form.setValue('variables.sizes', [...currentSizes, newSize.trim()]);
      setNewSize('');
    }
  };

  const removeSize = (index: number) => {
    const currentSizes = form.getValues('variables.sizes') || [];
    form.setValue('variables.sizes', currentSizes.filter((_, i) => i !== index));
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteMutation.mutate(id);
    }
  };

  const generateSlug = (nom: string) => {
    return nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Produits</h1>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setModelFile(null);
                setImageFiles([]);
                setNewColor('');
                setNewSize('');
                form.reset();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informations de base</h3>
                    
                    <FormField
                      control={form.control}
                      name="nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Auto-generate slug
                                if (!editingProduct) {
                                  form.setValue('slug', generateSlug(e.target.value));
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug (URL)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix (MAD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="en_stock"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>En stock</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <FormLabel>Images du produit</FormLabel>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                          className="flex-1"
                        />
                        {editingProduct?.media && Array.isArray(editingProduct.media) && 
                         editingProduct.media.filter((m: any) => m.type === 'image').length > 0 && (
                          <Badge variant="secondary">
                            <Upload className="h-3 w-3 mr-1" />
                            {editingProduct.media.filter((m: any) => m.type === 'image').length} images
                          </Badge>
                        )}
                      </div>
                      {editingProduct?.media && Array.isArray(editingProduct.media) && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {editingProduct.media
                            .filter((m: any) => m.type === 'image')
                            .slice(0, 4)
                            .map((image: any, index: number) => (
                            <img
                              key={index}
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3D Model Upload */}
                    <div className="space-y-2">
                      <FormLabel>Modèle 3D (.obj)</FormLabel>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".obj"
                          onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                          className="flex-1"
                        />
                        {editingProduct?.model_url && (
                          <Badge variant="secondary">
                            <Upload className="h-3 w-3 mr-1" />
                            Modèle existant
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Variables */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Variables du produit</h3>
                    
                    {/* Colors */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <FormLabel>Couleurs disponibles</FormLabel>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ajouter une couleur"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                        />
                        <Button
                          type="button"
                          onClick={addColor}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {form.watch('variables.colors')?.map((color, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {color}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => removeColor(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Sizes */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        <FormLabel>Tailles disponibles</FormLabel>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ajouter une taille"
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                        />
                        <Button
                          type="button"
                          onClick={addSize}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {form.watch('variables.sizes')?.map((size, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {size}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => removeSize(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDialog(false);
                      setModelFile(null);
                      setImageFiles([]);
                      setNewColor('');
                      setNewSize('');
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={productMutation.isPending || uploading}
                  >
                    {uploading ? 'Téléchargement...' : productMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-4" />
                <div className="h-6 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.map((product) => (
            <Card key={product.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{product.nom}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description || 'Aucune description'}
                </p>
                
                {/* Variables display */}
                {product.variables && typeof product.variables === 'object' && (
                  <div className="space-y-2">
                    {(product.variables as any)?.colors && Array.isArray((product.variables as any).colors) && (product.variables as any).colors.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Palette className="h-3 w-3 text-muted-foreground" />
                        {(product.variables as any).colors.slice(0, 3).map((color: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                        {(product.variables as any).colors.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(product.variables as any).colors.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    {(product.variables as any)?.sizes && Array.isArray((product.variables as any).sizes) && (product.variables as any).sizes.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Ruler className="h-3 w-3 text-muted-foreground" />
                        {(product.variables as any).sizes.slice(0, 3).map((size: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                        {(product.variables as any).sizes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(product.variables as any).sizes.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">
                    {formatPrice(product.prix)}
                  </span>
                  <div className="flex items-center gap-2">
                    {product.model_url && (
                      <Badge variant="secondary" className="text-xs">
                        <Upload className="h-3 w-3 mr-1" />
                        3D
                      </Badge>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.en_stock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.en_stock ? 'En stock' : 'Rupture'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {products && products.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Aucun produit</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par ajouter votre premier produit
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}