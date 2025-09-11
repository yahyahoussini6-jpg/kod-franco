import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Globe, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOPage } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SEOFormData {
  page_path: string;
  page_name: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  meta_robots: string;
  is_active: boolean;
}

const initialFormData: SEOFormData = {
  page_path: '',
  page_name: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  canonical_url: '',
  og_title: '',
  og_description: '',
  og_image: '',
  meta_robots: 'index, follow',
  is_active: true
};

export default function SEOManagement() {
  const [pages, setPages] = useState<SEOPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPage, setEditingPage] = useState<SEOPage | null>(null);
  const [formData, setFormData] = useState<SEOFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .order('page_name');

      if (error) throw error;
      
      let filteredPages = data || [];
      
      if (searchTerm) {
        filteredPages = filteredPages.filter(page =>
          page.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.page_path.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setPages(filteredPages);
    } catch (error) {
      console.error('Error fetching SEO pages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les pages SEO.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [searchTerm]);

  const handleEdit = (page: SEOPage) => {
    setEditingPage(page);
    setFormData({
      page_path: page.page_path,
      page_name: page.page_name,
      seo_title: page.seo_title || '',
      seo_description: page.seo_description || '',
      seo_keywords: page.seo_keywords || '',
      canonical_url: page.canonical_url || '',
      og_title: page.og_title || '',
      og_description: page.og_description || '',
      og_image: page.og_image || '',
      meta_robots: page.meta_robots,
      is_active: page.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingPage) {
        const { error } = await supabase
          .from('seo_pages')
          .update(formData)
          .eq('id', editingPage.id);

        if (error) throw error;

        toast({
          title: "Page SEO mise à jour",
          description: "Les paramètres SEO ont été mis à jour avec succès.",
        });
      } else {
        const { error } = await supabase
          .from('seo_pages')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Page SEO créée",
          description: "La nouvelle page SEO a été créée avec succès.",
        });
      }

      setIsDialogOpen(false);
      setEditingPage(null);
      setFormData(initialFormData);
      fetchPages();
    } catch (error) {
      console.error('Error saving SEO page:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la page SEO.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from('seo_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast({
        title: "Page SEO supprimée",
        description: "La page SEO a été supprimée avec succès.",
      });

      fetchPages();
    } catch (error) {
      console.error('Error deleting SEO page:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la page SEO.",
        variant: "destructive",
      });
    }
  };

  const openNewPageDialog = () => {
    setEditingPage(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion SEO</h1>
          <p className="text-muted-foreground">Gérez le SEO de toutes les pages de votre site</p>
        </div>
        <Button onClick={openNewPageDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle page SEO
        </Button>
      </div>

      {/* SEO Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Pages totales</p>
                <p className="text-2xl font-bold">{pages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pages actives</p>
                <p className="text-2xl font-bold">{pages.filter(p => p.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avec titre SEO</p>
                <p className="text-2xl font-bold">{pages.filter(p => p.seo_title).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avec description</p>
                <p className="text-2xl font-bold">{pages.filter(p => p.seo_description).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou chemin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Chargement...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Aucune page SEO trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Aucune page ne correspond à votre recherche.'
                  : 'Vous n\'avez pas encore configuré de pages SEO.'}
              </p>
              <Button onClick={openNewPageDialog}>
                Créer votre première page SEO
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de la page</TableHead>
                  <TableHead>Chemin</TableHead>
                  <TableHead>Titre SEO</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Robots</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.page_name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {page.page_path}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {page.seo_title ? (
                          <span className="line-clamp-1">{page.seo_title}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Non défini</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.is_active ? "default" : "secondary"}>
                        {page.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {page.meta_robots}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(page)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la page SEO</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cette configuration SEO ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePage(page.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* SEO Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Modifier la page SEO' : 'Nouvelle page SEO'}
            </DialogTitle>
            <DialogDescription>
              Configurez les paramètres SEO pour cette page.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="page_name">Nom de la page *</Label>
                <Input
                  id="page_name"
                  value={formData.page_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, page_name: e.target.value }))}
                  placeholder="ex: Page d'accueil"
                  required
                />
              </div>
              <div>
                <Label htmlFor="page_path">Chemin de la page *</Label>
                <Input
                  id="page_path"
                  value={formData.page_path}
                  onChange={(e) => setFormData(prev => ({ ...prev, page_path: e.target.value }))}
                  placeholder="ex: /"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="seo_title">Titre SEO (≤ 60 caractères)</Label>
              <Input
                id="seo_title"
                value={formData.seo_title}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                placeholder="Titre optimisé pour les moteurs de recherche"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.seo_title.length}/60 caractères
              </p>
            </div>

            <div>
              <Label htmlFor="seo_description">Meta description (≤ 155 caractères)</Label>
              <Textarea
                id="seo_description"
                value={formData.seo_description}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                placeholder="Description qui apparaîtra dans les résultats de recherche"
                maxLength={155}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.seo_description.length}/155 caractères
              </p>
            </div>

            <div>
              <Label htmlFor="seo_keywords">Mots-clés SEO</Label>
              <Input
                id="seo_keywords"
                value={formData.seo_keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                placeholder="mot-clé1, mot-clé2, mot-clé3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Séparez les mots-clés par des virgules
              </p>
            </div>

            <div>
              <Label htmlFor="canonical_url">URL canonique</Label>
              <Input
                id="canonical_url"
                value={formData.canonical_url}
                onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                placeholder="https://example.com/page"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="og_title">Titre Open Graph</Label>
                <Input
                  id="og_title"
                  value={formData.og_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, og_title: e.target.value }))}
                  placeholder="Titre pour les réseaux sociaux"
                />
              </div>
              <div>
                <Label htmlFor="og_image">Image Open Graph</Label>
                <Input
                  id="og_image"
                  value={formData.og_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, og_image: e.target.value }))}
                  placeholder="URL de l'image"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="og_description">Description Open Graph</Label>
              <Textarea
                id="og_description"
                value={formData.og_description}
                onChange={(e) => setFormData(prev => ({ ...prev, og_description: e.target.value }))}
                placeholder="Description pour les réseaux sociaux"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meta_robots">Robots</Label>
                <Input
                  id="meta_robots"
                  value={formData.meta_robots}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_robots: e.target.value }))}
                  placeholder="index, follow"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Page active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}