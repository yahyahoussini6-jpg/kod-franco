import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Facebook, Twitter, Linkedin, Youtube, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Platform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube';

interface SocialConnection {
  id: string;
  platform: Platform;
  account_name: string;
  account_id: string;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
}

const platformIcons: Record<Platform, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Youtube,
  youtube: Youtube,
};

const platformColors: Record<Platform, string> = {
  facebook: 'bg-blue-500',
  instagram: 'bg-pink-500',
  twitter: 'bg-sky-500',
  linkedin: 'bg-blue-700',
  tiktok: 'bg-black',
  youtube: 'bg-red-500',
};

export default function SocialMediaConnections() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [accountName, setAccountName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const queryClient = useQueryClient();

  // Fetch connections
  const { data: connections, isLoading } = useQuery({
    queryKey: ['social-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SocialConnection[];
    },
    enabled: !!user,
  });

  // Add connection mutation
  const addConnectionMutation = useMutation({
    mutationFn: async (connection: {
      platform: Platform;
      account_name: string;
      account_id: string;
      access_token: string;
    }) => {
      const { data, error } = await supabase
        .from('social_media_connections')
        .insert({
          user_id: user?.id,
          platform: connection.platform,
          account_name: connection.account_name,
          account_id: connection.account_id,
          access_token_encrypted: connection.access_token, // In production, encrypt this
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Social media account connected successfully');
      queryClient.invalidateQueries({ queryKey: ['social-connections'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to connect account: ${error.message}`);
    },
  });

  // Delete connection mutation
  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('social_media_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Connection removed successfully');
      queryClient.invalidateQueries({ queryKey: ['social-connections'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to remove connection: ${error.message}`);
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('social_media_connections')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Connection status updated');
      queryClient.invalidateQueries({ queryKey: ['social-connections'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const resetForm = () => {
    setAccountName('');
    setAccountId('');
    setAccessToken('');
    setSelectedPlatform('facebook');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !accessToken) {
      toast.error('Please fill in all required fields');
      return;
    }

    addConnectionMutation.mutate({
      platform: selectedPlatform,
      account_name: accountName,
      account_id: accountId || accountName,
      access_token: accessToken,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Social Media Connections</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Social Media Connections</h1>
          <p className="text-muted-foreground mt-1">
            Connect your social media accounts to track performance metrics
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Social Media Account</DialogTitle>
              <DialogDescription>
                Add your social media account credentials to start tracking performance
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={selectedPlatform} onValueChange={(value: Platform) => setSelectedPlatform(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name *</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g., @mycompany"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID (optional)</Label>
                <Input
                  id="accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Platform-specific account ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token *</Label>
                <Input
                  id="accessToken"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter your API access token"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your token is stored securely and used only to fetch analytics data
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addConnectionMutation.isPending}>
                  {addConnectionMutation.isPending ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!connections || connections.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No social media accounts connected yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => {
            const Icon = platformIcons[connection.platform];
            const colorClass = platformColors[connection.platform];

            return (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{connection.platform}</CardTitle>
                        <CardDescription className="mt-1">{connection.account_name}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={connection.is_active ? 'default' : 'outline'}>
                      {connection.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {connection.last_synced_at && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Last synced: {new Date(connection.last_synced_at).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: connection.id,
                          is_active: connection.is_active,
                        })
                      }
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      {connection.is_active ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this connection?')) {
                          deleteConnectionMutation.mutate(connection.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
