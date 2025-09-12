import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  featured_image: string;
  featured_image_alt: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  reading_time_minutes: number;
}

export default function BlogNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BlogFormData>({
    defaultValues: {
      status: 'draft',
      is_featured: false,
      reading_time_minutes: 5
    }
  });

  // Fetch categories for the select dropdown
  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Auto-generate slug from title
  const watchTitle = watch('title');
  React.useEffect(() => {
    if (watchTitle) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchTitle, setValue]);

  const onSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    
    try {
      const postData = {
        ...data,
        published_at: data.status === 'published' ? new Date().toISOString() : null,
        author_id: null // Will be set by RLS if needed
      };

      const { error } = await supabase
        .from('blog_posts')
        .insert([postData]);

      if (error) throw error;

      toast({
        title: "Article créé",
        description: "L'article de blog a été créé avec succès."
      });

      navigate('/admin/blog');
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'article.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/blog')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nouvel Article</h1>
          <p className="text-muted-foreground">Créer un nouvel article de blog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenu Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Le titre est requis' })}
                    placeholder="Titre de l'article"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">Slug URL *</Label>
                  <Input
                    id="slug"
                    {...register('slug', { required: 'Le slug est requis' })}
                    placeholder="url-de-l-article"
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="excerpt">Extrait</Label>
                  <Textarea
                    id="excerpt"
                    {...register('excerpt')}
                    placeholder="Résumé de l'article..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenu *</Label>
                  <Textarea
                    id="content"
                    {...register('content', { required: 'Le contenu est requis' })}
                    placeholder="Contenu de l'article..."
                    rows={12}
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seo_title">Titre SEO</Label>
                  <Input
                    id="seo_title"
                    {...register('seo_title')}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>

                <div>
                  <Label htmlFor="seo_description">Description SEO</Label>
                  <Textarea
                    id="seo_description"
                    {...register('seo_description')}
                    placeholder="Description pour les moteurs de recherche"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="seo_keywords">Mots-clés SEO</Label>
                  <Input
                    id="seo_keywords"
                    {...register('seo_keywords')}
                    placeholder="mot-clé1, mot-clé2, mot-clé3"
                  />
                </div>

                <div>
                  <Label htmlFor="canonical_url">URL Canonique</Label>
                  <Input
                    id="canonical_url"
                    {...register('canonical_url')}
                    placeholder="https://exemple.com/article"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    onValueChange={(value) => setValue('status', value as 'draft' | 'published')}
                    defaultValue="draft"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    onCheckedChange={(checked) => setValue('is_featured', checked)}
                  />
                  <Label htmlFor="is_featured">Article mis en avant</Label>
                </div>

                <div>
                  <Label htmlFor="reading_time_minutes">Temps de lecture (minutes)</Label>
                  <Input
                    id="reading_time_minutes"
                    type="number"
                    {...register('reading_time_minutes', { valueAsNumber: true })}
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Catégorie & Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category_id">Catégorie</Label>
                  <Select onValueChange={(value) => setValue('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="featured_image">Image mise en avant (URL)</Label>
                  <Input
                    id="featured_image"
                    {...register('featured_image')}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="featured_image_alt">Texte alternatif de l'image</Label>
                  <Input
                    id="featured_image_alt"
                    {...register('featured_image_alt')}
                    placeholder="Description de l'image"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Création...' : 'Créer l\'article'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}