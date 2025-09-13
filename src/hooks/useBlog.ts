import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, BlogCategory, BlogTag, BlogComment } from '@/types/blog';

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (filters?: {
    category?: string;
    tag?: string;
    status?: string;
    limit?: number;
    featured?: boolean;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          category:blog_categories(*),
          author:profiles(id, full_name),
          tags:blog_post_tags(
            tag:blog_tags(*)
          )
        `)
        .order('published_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category.slug', filters.category);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.eq('status', 'published');
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const postsWithTags = data?.map(post => ({
        ...post,
        tags: post.tags?.map((pt: any) => pt.tag) || []
      })) || [];

      setPosts(postsWithTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:blog_categories(*),
          author:profiles(id, full_name),
          tags:blog_post_tags(
            tag:blog_tags(*)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Increment view count
        await supabase.rpc('increment_blog_post_views', { post_id: data.id });
        
        return {
          ...data,
          tags: data.tags?.map((pt: any) => pt.tag) || []
        };
      }

      return null;
    } catch (err) {
      console.error('Error fetching post:', err);
      return null;
    }
  };

  const getRelatedPosts = async (postId: string, limit = 3): Promise<Partial<BlogPost>[]> => {
    try {
      // Fallback to simple related posts query if RPC fails
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, published_at')
        .eq('status', 'published')
        .neq('id', postId)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching related posts:', err);
      return [];
    }
  };

  const submitComment = async (
    postId: string,
    authorName: string,
    authorEmail: string,
    content: string
  ) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          author_name: authorName,
          author_email: authorEmail,
          content
        });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'An error occurred' 
      };
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, []);

  return {
    posts,
    categories,
    tags,
    loading,
    error,
    fetchPosts,
    getPostBySlug,
    getRelatedPosts,
    submitComment,
    refetch: () => {
      fetchPosts();
      fetchCategories();
      fetchTags();
    }
  };
}