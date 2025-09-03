import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Share2, Pin, Calendar, User } from "lucide-react";
import { ShimmerCard, ShimmerText, ShimmerAvatar } from "@/components/ui/shimmer";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  is_pinned: boolean;
  expires_at: string | null;
  image_url: string | null;
  author?: {
    first_name: string;
    last_name: string;
    role: string;
    admin_level?: string;
  };
}

interface PostsFeedProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const PostsFeed = ({ user }: PostsFeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    
    // Real-time subscription for posts
    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch author profiles separately
      const postsWithAuthors = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, role, admin_level')
            .eq('user_id', post.author_id)
            .single();
          
          return {
            ...post,
            author: profile || undefined
          };
        })
      );

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string, adminLevel?: string) => {
    if (adminLevel) return "bg-red-500 text-white";
    switch (role) {
      case 'staff': return "bg-blue-500 text-white";
      case 'parent': return "bg-green-500 text-white";
      case 'student': return "bg-purple-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getRoleLabel = (role: string, adminLevel?: string) => {
    if (adminLevel) return `Admin (${adminLevel})`;
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex items-center space-x-3">
                <ShimmerAvatar />
                <div className="space-y-2 flex-1">
                  <ShimmerText className="w-1/3" />
                  <ShimmerText className="w-1/4 h-3" />
                </div>
              </div>
              <ShimmerText className="w-2/3" />
            </CardHeader>
            <CardContent>
              <ShimmerCard className="h-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">No Posts Yet</h3>
            <p className="text-muted-foreground">
              Check back later for announcements and updates from your school.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-semibold">
                    {post.author?.first_name?.[0]}{post.author?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {post.author?.first_name} {post.author?.last_name}
                    </p>
                    <Badge className={getRoleColor(post.author?.role || 'student', post.author?.admin_level)}>
                      {getRoleLabel(post.author?.role || 'student', post.author?.admin_level)}
                    </Badge>
                    {post.is_pinned && (
                      <Pin className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            
            {post.title && (
              <h2 className="text-xl font-bold mt-3">{post.title}</h2>
            )}
          </CardHeader>
          
          <CardContent>
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
              {post.content}
            </p>
            
            {post.image_url && (
              <div className="mt-4">
                <img 
                  src={post.image_url} 
                  alt="Post attachment"
                  className="rounded-lg w-full max-h-96 object-cover"
                />
              </div>
            )}
            
            {post.expires_at && new Date(post.expires_at) > new Date() && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Expires {formatDistanceToNow(new Date(post.expires_at), { addSuffix: true })}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-6 pt-4 border-t">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};