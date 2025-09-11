export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  category_id?: string | null;
  author_id?: string | null;
  status: string;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  canonical_url?: string | null;
  view_count: number;
  reading_time_minutes?: number | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: BlogCategory | null;
  author?: {
    id: string;
    full_name?: string | null;
  } | null;
  tags?: BlogTag[];
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SEOPage {
  id: string;
  page_path: string;
  page_name: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  structured_data?: any;
  meta_robots: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}