import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Generate sitemap XML for SEO
export function generateSitemap() {
  return useQuery({
    queryKey: ['sitemap'],
    queryFn: async () => {
      const baseUrl = window.location.origin;
      
      // Get all products
      const { data: products } = await supabase
        .from('products')
        .select('slug, created_at')
        .eq('en_stock', true);
      
      // Get all categories
      const { data: categories } = await supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true);

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Products page -->
  <url>
    <loc>${baseUrl}/produits</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Categories -->
  ${categories?.map(category => `
  <url>
    <loc>${baseUrl}/categorie/${category.slug}</loc>
    <lastmod>${category.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('') || ''}
  
  <!-- Products -->
  ${products?.map(product => `
  <url>
    <loc>${baseUrl}/produit/${product.slug}</loc>
    <lastmod>${product.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}
  
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/politique-de-confidentialite</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
</urlset>`;

      return sitemap;
    },
  });
}

// Generate robots.txt
export function generateRobotsTxt(): string {
  const baseUrl = window.location.origin;
  
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth/
Disallow: /api/
Disallow: /panier/
Disallow: /confirmation/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;
}