import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Tag as TagIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useBlog } from '@/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Blog() {
  const { posts, categories, tags, loading, fetchPosts } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    fetchPosts({
      category: selectedCategory || undefined,
      tag: selectedTag || undefined
    });
  }, [selectedCategory, selectedTag]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
  };

  return (
    <>
      <Helmet>
        <title>Blog - Conseils et Actualités | Notre Marque</title>
        <meta name="description" content="Découvrez nos derniers articles, conseils d'experts et actualités. Restez informé sur les tendances et nouveautés de notre secteur." />
        <meta name="keywords" content="blog, articles, conseils, actualités, tendances" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Blog</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Découvrez nos derniers articles, conseils d'experts et actualités du secteur
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Filtres</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(selectedCategory || selectedTag) && (
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                        className="w-full"
                      >
                        Effacer les filtres
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Categories */}
                {categories.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Catégories</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {categories.map((category) => (
                          <li key={category.id}>
                            <button
                              onClick={() => setSelectedCategory(category.slug)}
                              className={`text-sm w-full text-left hover:text-primary transition-colors ${
                                selectedCategory === category.slug 
                                  ? 'text-primary font-medium' 
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {category.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Tags</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={selectedTag === tag.slug ? "default" : "secondary"}
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={() => setSelectedTag(tag.slug)}
                            style={{ backgroundColor: selectedTag === tag.slug ? undefined : tag.color + '20', color: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-muted rounded-t-lg"></div>
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-6 bg-muted rounded mb-4"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <h3 className="text-lg font-semibold mb-2">Aucun article trouvé</h3>
                    <p className="text-muted-foreground mb-4">
                      Aucun article ne correspond à vos critères de recherche.
                    </p>
                    {(selectedCategory || selectedTag) && (
                      <Button variant="outline" onClick={clearFilters}>
                        Effacer les filtres
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                      {post.featured_image && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={post.featured_image}
                            alt={post.featured_image_alt || post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        {post.category && (
                          <Badge variant="secondary" className="mb-2">
                            {post.category.name}
                          </Badge>
                        )}
                        
                        <h2 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h2>
                        
                        {post.excerpt && (
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            {post.published_at && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(post.published_at)}</span>
                              </div>
                            )}
                            {post.reading_time_minutes && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{post.reading_time_minutes} min</span>
                              </div>
                            )}
                          </div>
                          {post.author?.full_name && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{post.author.full_name}</span>
                            </div>
                          )}
                        </div>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-xs"
                                style={{ color: tag.color, borderColor: tag.color + '40' }}
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag.name}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}