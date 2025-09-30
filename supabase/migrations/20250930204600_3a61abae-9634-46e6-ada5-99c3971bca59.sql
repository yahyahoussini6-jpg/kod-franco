-- Create table for social media account connections
CREATE TABLE IF NOT EXISTS public.social_media_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube')),
  account_name TEXT NOT NULL,
  account_id TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

-- Enable RLS
ALTER TABLE public.social_media_connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own connections
CREATE POLICY "Users can view their own social media connections"
  ON public.social_media_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own connections
CREATE POLICY "Users can insert their own social media connections"
  ON public.social_media_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update their own social media connections"
  ON public.social_media_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their own social media connections"
  ON public.social_media_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can manage all connections
CREATE POLICY "Admin can manage all social media connections"
  ON public.social_media_connections
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_social_connections_user_platform ON public.social_media_connections(user_id, platform);

-- Add trigger for updated_at
CREATE TRIGGER update_social_media_connections_updated_at
  BEFORE UPDATE ON public.social_media_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();