import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Calendar, FileText, Megaphone } from 'lucide-react';

interface CreatePostFormProps {
  user: any;
  onPostCreated?: () => void;
}

export const CreatePostForm = ({ user, onPostCreated }: CreatePostFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('announcement');
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          author_id: user.id,
          is_pinned: isPinned,
          expires_at: expiresAt || null,
          image_url: imageUrl || null,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${postType} posted successfully`,
      });

      // Reset form
      setTitle('');
      setContent('');
      setIsPinned(false);
      setExpiresAt('');
      setImageUrl('');
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    switch (postType) {
      case 'announcement':
        return <Megaphone className="h-5 w-5" />;
      case 'assignment':
        return <FileText className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          Create New {postType === 'announcement' ? 'Announcement' : postType === 'assignment' ? 'Assignment' : 'Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postType">Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${postType} title...`}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Enter ${postType} details...`}
              rows={4}
              className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
            <Label htmlFor="isPinned">Pin this post</Label>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 transition-all duration-200 hover:scale-105"
            >
              {isLoading ? 'Creating...' : `Create ${postType}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};