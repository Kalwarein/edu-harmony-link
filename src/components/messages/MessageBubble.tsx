import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Reply, 
  Trash2, 
  Download, 
  Image as ImageIcon, 
  FileText, 
  Music, 
  Video,
  Crown,
  Star,
  Shield,
  Users,
  Clock,
  UserX,
  Archive
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: any;
  isOwnMessage: boolean;
  user: any;
  adminLevel?: string;
  onReply: (message: any) => void;
  onDelete: (messageId: string) => void;
  onUserAction?: (userId: string, action: string) => void;
}

export const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  user, 
  adminLevel, 
  onReply, 
  onDelete, 
  onUserAction 
}: MessageBubbleProps) => {
  const [showActions, setShowActions] = useState(false);
  
  const isAdminMessage = message.is_admin_message || message.sender_admin_level;

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getRoleBadgeColor = (role: string, adminLevel?: string) => {
    if (adminLevel) {
      switch (adminLevel) {
        case 'principal':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'teacher':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'coordinator':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'parent_rep':
          return 'bg-green-100 text-green-800 border-green-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'parent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'staff':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAttachmentIcon = (type?: string) => {
    if (!type) return FileText;
    
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('audio/')) return Music;
    if (type.startsWith('video/')) return Video;
    return FileText;
  };

  const renderAttachment = () => {
    if (!message.attachment_url) return null;

    const AttachmentIcon = getAttachmentIcon(message.attachment_type);

    if (message.attachment_type?.startsWith('image/')) {
      return (
        <div className="mt-2">
          <img 
            src={message.attachment_url} 
            alt={message.attachment_name || 'Image attachment'}
            className="max-w-xs rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => window.open(message.attachment_url, '_blank')}
          />
        </div>
      );
    }

    return (
      <div className="mt-2 p-3 border rounded-lg bg-muted/50 flex items-center gap-3 max-w-xs">
        <AttachmentIcon className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{message.attachment_name || 'Attachment'}</p>
          <p className="text-xs text-muted-foreground">{message.attachment_type}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(message.attachment_url, '_blank')}
          className="h-6 w-6 p-0"
        >
          <Download className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  return (
    <div className={`flex gap-3 group ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={`text-xs font-medium ${
          isAdminMessage ? 'bg-primary/10 text-primary' : 'bg-muted'
        }`}>
          {message.sender_name?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${isOwnMessage ? 'order-2' : ''}`}>
            {isOwnMessage ? 'You' : message.sender_name}
          </span>
          
          <div className={`flex items-center gap-1 ${isOwnMessage ? 'order-1 flex-row-reverse' : ''}`}>
            <Badge 
              variant="outline" 
              className={`text-xs px-1.5 py-0.5 ${getRoleBadgeColor(message.sender_role, message.sender_admin_level)}`}
            >
              {message.sender_admin_level || message.sender_role}
            </Badge>
            
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(message.created_at)}
            </span>
          </div>
        </div>

        {/* Reply Preview */}
        {message.reply_to && (
          <div className={`mb-2 p-2 rounded border-l-2 border-primary/50 bg-muted/30 text-xs ${
            isOwnMessage ? 'mr-0 ml-auto max-w-fit' : 'ml-0 mr-auto max-w-fit'
          }`}>
            <p className="font-medium text-primary/80">↳ Replying to {message.reply_to_sender}</p>
            <p className="text-muted-foreground truncate">{message.reply_to_content}</p>
          </div>
        )}
        
        <div 
          className={`inline-block max-w-full relative group ${isOwnMessage ? 'text-right' : ''}`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div className={`p-3 rounded-lg ${
            isOwnMessage 
              ? 'bg-primary text-primary-foreground' 
              : isAdminMessage
              ? 'bg-secondary/50 border border-secondary'
              : 'bg-muted'
          }`}>
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
            {renderAttachment()}
          </div>

          {/* Message Actions */}
          {(showActions || isOwnMessage) && (
            <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-8' : 'right-0 translate-x-8'} 
              opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-lg shadow-lg border p-1 flex gap-1`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(message)}
                className="h-6 w-6 p-0"
              >
                <Reply className="w-3 h-3" />
              </Button>
              {isOwnMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(message.id)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Admin Controls */}
        {adminLevel && !isOwnMessage && (
          <div className="mt-2 flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top">
                <DropdownMenuItem 
                  onClick={() => onUserAction?.(message.sender_id, "timeout")}
                  className="text-orange-600"
                >
                  <Clock className="w-3 h-3 mr-2" />
                  Timeout User
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onUserAction?.(message.sender_id, "block")}
                  className="text-red-600"
                >
                  <UserX className="w-3 h-3 mr-2" />
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="w-3 h-3 mr-2" />
                  Archive Message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};