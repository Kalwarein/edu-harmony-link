import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Pin, 
  Clock,
  ThumbsUp,
  ThumbsDown,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title?: string;
  content: string;
  author_id: string;
  created_at: string;
  is_pinned?: boolean;
  expires_at?: string;
  image_url?: string;
  author: {
    first_name: string;
    last_name: string;
    role: string;
    admin_level?: string;
    avatar_url?: string;
  };
}

interface PostCardProps {
  post: Post;
  user: any;
}

interface Reaction {
  id: string;
  reaction_type: string;
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_profile?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const PostCard = ({ post, user }: PostCardProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReactions();
    fetchComments();
    
    // Real-time subscriptions
    const reactionsChannel = supabase
      .channel(`post-reactions-${post.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reactions', filter: `post_id=eq.${post.id}` },
        () => fetchReactions()
      )
      .subscribe();

    const commentsChannel = supabase
      .channel(`post-comments-${post.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` },
        () => fetchComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [post.id]);

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('post_id', post.id);

    if (error) {
      console.error('Error fetching reactions:', error);
    } else {
      setReactions(data || []);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      // Fetch user profiles separately
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('user_id', comment.user_id)
            .single();
          
          return {
            ...comment,
            user_profile: profile || { first_name: 'Unknown', last_name: 'User', avatar_url: null }
          };
        })
      );
      setComments(commentsWithProfiles);
    }
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    const existingReaction = reactions.find(r => r.user_id === user.id);

    if (existingReaction) {
      if (existingReaction.reaction_type === type) {
        // Remove reaction
        await supabase.from('reactions').delete().eq('id', existingReaction.id);
      } else {
        // Update reaction
        await supabase.from('reactions')
          .update({ reaction_type: type })
          .eq('id', existingReaction.id);
      }
    } else {
      // Add new reaction
      await supabase.from('reactions').insert({
        post_id: post.id,
        user_id: user.id,
        reaction_type: type
      });
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim()
      });

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string, adminLevel?: string) => {
    if (role === 'student') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (role === 'parent') return 'bg-green-100 text-green-800 border-green-200';
    if (role === 'staff') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (adminLevel === 'principal') return 'bg-red-100 text-red-800 border-red-200';
    if (adminLevel === 'super_admin') return 'bg-gray-100 text-gray-800 border-gray-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleLabel = (role: string, adminLevel?: string) => {
    if (adminLevel === 'principal') return 'Principal';
    if (adminLevel === 'super_admin') return 'Admin';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const isExpired = post.expires_at && new Date(post.expires_at) < new Date();

  const likesCount = reactions.filter(r => r.reaction_type === 'like').length;
  const dislikesCount = reactions.filter(r => r.reaction_type === 'dislike').length;
  const userReaction = reactions.find(r => r.user_id === user.id);

  return (
    <Card className={`w-full transition-all duration-300 hover:shadow-lg animate-fade-in ${isExpired ? 'opacity-60' : ''} ${post.is_pinned ? 'border-primary ring-1 ring-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
              <AvatarImage src={post.author.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {post.author.first_name[0]}{post.author.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {post.author.first_name} {post.author.last_name}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getRoleColor(post.author.role, post.author.admin_level)}`}
                >
                  {getRoleLabel(post.author.role, post.author.admin_level)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          {post.is_pinned && (
            <div className="flex items-center gap-1 text-primary">
              <Pin className="h-4 w-4" />
              <span className="text-xs font-medium">Pinned</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.title && (
          <h3 className="text-lg font-semibold text-foreground leading-tight">
            {post.title}
          </h3>
        )}
        
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {post.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={post.image_url}
              alt="Post attachment"
              className="w-full max-h-80 object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}

        {isExpired && (
          <Badge variant="destructive" className="w-fit">
            <Clock className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('like')}
              className={`gap-1 transition-colors ${
                userReaction?.reaction_type === 'like' 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-muted-foreground hover:text-red-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${userReaction?.reaction_type === 'like' ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('dislike')}
              className={`gap-1 transition-colors ${
                userReaction?.reaction_type === 'dislike' 
                  ? 'text-blue-600 hover:text-blue-700' 
                  : 'text-muted-foreground hover:text-blue-600'
              }`}
            >
              <ThumbsDown className={`h-4 w-4 ${userReaction?.reaction_type === 'dislike' ? 'fill-current' : ''}`} />
              <span>{dislikesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {showComments && (
          <div className="space-y-4 pt-4 border-t animate-fade-in">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={!newComment.trim() || isLoading}
                  className="gap-1"
                >
                  <Send className="h-3 w-3" />
                  {isLoading ? 'Posting...' : 'Comment'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user_profile?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {comment.user_profile?.first_name?.[0]}{comment.user_profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {comment.user_profile?.first_name} {comment.user_profile?.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};