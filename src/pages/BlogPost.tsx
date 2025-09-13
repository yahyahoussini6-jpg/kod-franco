import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Tag as TagIcon, Eye } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost as BlogPostType } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, getRelatedPosts, submitComment } = useBlog();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    setLoading(true);
    try {
      const postData = await getPostBySlug(postSlug);
      if (postData) {
        setPost(postData);
        const related = await getRelatedPosts(postData.id);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setSubmittingComment(true);
    try {
      const result = await submitComment(
        post.id,
        commentForm.name,
        commentForm.email,
        commentForm.content
      );

      if (result.success) {
        toast({
          title: "Commentaire envoyé",
          description: "Votre commentaire a été envoyé et sera modéré avant publication.",
        });
        setCommentForm({ name: '', email: '', content: '' });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de l'envoi du commentaire.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du commentaire.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-3/4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
              <p className="text-muted-foreground mb-6">
                L'article que vous recherchez n'existe pas ou n'est plus disponible.
              </p>
              <Button asChild>
                <Link to="/blog">Retour au blog</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Blog', href: '/blog' },
    ...(post.category ? [{ label: post.category.name, href: `/blog?category=${post.category.slug}` }] : []),
    { label: post.title, href: `/blog/${post.slug}` }
  ];

  const seoData = {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || '',
    keywords: post.seo_keywords || '',
    canonical: post.canonical_url || `${window.location.origin}/blog/${post.slug}`,
    image: post.featured_image,
    type: 'article' as const,
    publishedTime: post.published_at,
    author: post.author?.full_name
  };

  return (
    <>
      <Helmet>
        <title>{seoData.title} | Blog</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <link rel="canonical" href={seoData.canonical} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={seoData.canonical} />
        {seoData.image && <meta property="og:image" content={seoData.image} />}
        {seoData.publishedTime && <meta property="article:published_time" content={seoData.publishedTime} />}
        {seoData.author && <meta property="article:author" content={seoData.author} />}
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.featured_image,
            "author": {
              "@type": "Person",
              "name": post.author?.full_name || "Admin"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Notre Marque"
            },
            "datePublished": post.published_at,
            "dateModified": post.updated_at,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${window.location.origin}/blog/${post.slug}`
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs items={breadcrumbs} />

          <article className="mt-8">
            {/* Header */}
            <header className="mb-8">
              <Button variant="ghost" asChild className="mb-4">
                <Link to="/blog" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour au blog</span>
                </Link>
              </Button>

              {post.category && (
                <Badge variant="secondary" className="mb-4">
                  {post.category.name}
                </Badge>
              )}

              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

              {post.excerpt && (
                <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
              )}

              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  {post.published_at && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                  )}
                  {post.reading_time_minutes && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.reading_time_minutes} min de lecture</span>
                    </div>
                  )}
                  {post.author?.full_name && (
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.view_count} vues</span>
                  </div>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={{ color: tag.color, borderColor: tag.color + '40' }}
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {post.featured_image && (
                <div className="mb-8">
                  <img
                    src={post.featured_image}
                    alt={post.featured_image_alt || post.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </header>

            {/* Content */}
            <div className="prose max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <Separator className="my-8" />

            {/* Comment Form */}
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-6">Laisser un commentaire</h3>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom *</Label>
                        <Input
                          id="name"
                          value={commentForm.name}
                          onChange={(e) => setCommentForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={commentForm.email}
                          onChange={(e) => setCommentForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="content">Commentaire *</Label>
                      <Textarea
                        id="content"
                        rows={4}
                        value={commentForm.content}
                        onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={submittingComment}>
                      {submittingComment ? 'Envoi...' : 'Envoyer le commentaire'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold mb-6">Articles similaires</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost.id} className="group hover:shadow-lg transition-shadow">
                      {relatedPost.featured_image && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={relatedPost.featured_image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/blog/${relatedPost.slug}`}>
                            {relatedPost.title}
                          </Link>
                        </h4>
                        {relatedPost.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {relatedPost.excerpt}
                          </p>
                        )}
                        {relatedPost.published_at && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(relatedPost.published_at)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    </>
  );
}