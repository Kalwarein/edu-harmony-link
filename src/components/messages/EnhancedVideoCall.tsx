import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  MonitorOff,
  Settings,
  Users,
  Hand,
  Volume2,
  VolumeX,
  Circle,
  FileText,
  Grid3X3,
  Maximize2,
  UserPlus,
  UserMinus,
  MoreHorizontal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  name: string;
  isHost?: boolean;
  isMuted?: boolean;
  hasVideo?: boolean;
  audioLevel?: number;
  handRaised?: boolean;
}

interface EnhancedVideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "video" | "audio";
  participants?: Participant[];
  isHost?: boolean;
  callId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const EnhancedVideoCall = ({ 
  isOpen, 
  onClose, 
  callType, 
  participants = [], 
  isHost = false,
  callId,
  user
}: EnhancedVideoCallProps) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [viewMode, setViewMode] = useState<"gallery" | "speaker" | "grid">("gallery");
  const [callDuration, setCallDuration] = useState(0);
  const [waitingRoomParticipants, setWaitingRoomParticipants] = useState<Participant[]>([]);
  const [showTranscription, setShowTranscription] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [volume, setVolume] = useState(1);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Timer for call duration
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Real-time participant updates
  useEffect(() => {
    if (isOpen) {
      const channel = supabase
        .channel(`call-${callId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'calls' },
          (payload) => {
            console.log('Call update:', payload);
            // Handle participant updates
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, callId]);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Media Error",
        description: "Could not access camera or microphone",
        variant: "destructive"
      });
    }
  };

  const stopLocalVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          startLocalVideo();
        };
      } else {
        setIsScreenSharing(false);
        startLocalVideo();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast({
        title: "Screen Share Error",
        description: "Could not share screen",
        variant: "destructive"
      });
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Call recording has been stopped" : "Call is now being recorded"
    });
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    toast({
      title: handRaised ? "Hand Lowered" : "Hand Raised",
      description: handRaised ? "You lowered your hand" : "You raised your hand to speak"
    });
  };

  const admitFromWaitingRoom = (participantId: string) => {
    // Move participant from waiting room to main call
    setWaitingRoomParticipants(prev => 
      prev.filter(p => p.id !== participantId)
    );
    toast({
      title: "Participant Admitted",
      description: "Participant has been admitted to the call"
    });
  };

  const removeParticipant = (participantId: string) => {
    if (isHost) {
      toast({
        title: "Participant Removed",
        description: "Participant has been removed from the call"
      });
    }
  };

  const muteParticipant = (participantId: string) => {
    if (isHost) {
      toast({
        title: "Participant Muted",
        description: "Participant has been muted"
      });
    }
  };

  const endCall = async () => {
    try {
      await supabase
        .from('calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
          duration: callDuration
        })
        .eq('id', callId);

      // Send notification about call end
      await supabase
        .from('notifications')
        .insert({
          title: 'Call Ended',
          content: `${callType === 'video' ? 'Video' : 'Audio'} call ended by ${user.name} (${user.role}). Duration: ${formatDuration(callDuration)}`,
          type: 'call',
          recipient_id: null
        });

      stopLocalVideo();
      onClose();
      
      toast({
        title: "Call Ended",
        description: "The call has been ended successfully"
      });
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen) {
      startLocalVideo();
    } else {
      stopLocalVideo();
    }

    return () => {
      stopLocalVideo();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogTitle className="sr-only">Enhanced Video Call</DialogTitle>
        
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="animate-pulse">
                {isRecording ? "REC" : "LIVE"}
              </Badge>
              <div className="text-sm">
                <div className="font-medium">
                  {callType === 'video' ? 'Video' : 'Audio'} Call
                </div>
                <div className="text-slate-400">
                  {formatDuration(callDuration)} • {participants.length + 1} participants
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === "gallery" ? "speaker" : "gallery")}
                className="text-white hover:bg-slate-700"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              
              {/* Participants List */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700"
              >
                <Users className="h-4 w-4 mr-1" />
                {participants.length + 1}
              </Button>
            </div>
          </div>

          {/* Main Video Area */}
          <div className="flex-1 flex">
            {/* Video Grid */}
            <div className="flex-1 p-4">
              {viewMode === "gallery" ? (
                <div className={`grid gap-4 h-full ${
                  participants.length === 0 ? 'grid-cols-1' : 
                  participants.length <= 2 ? 'grid-cols-2' : 
                  participants.length <= 4 ? 'grid-cols-2 grid-rows-2' : 
                  'grid-cols-3 grid-rows-2'
                }`}>
                  {/* Local Video */}
                  <Card className="relative overflow-hidden bg-slate-800 border-slate-600">
                    <CardContent className="p-0 h-full">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-xs">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium bg-black/50 px-2 py-1 rounded">
                          You {handRaised && "🖐"}
                        </span>
                      </div>
                      {!isVideoEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                          <VideoOff className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Remote Videos */}
                  {participants.map((participant) => (
                    <Card key={participant.id} className="relative overflow-hidden bg-slate-800 border-slate-600">
                      <CardContent className="p-0 h-full">
                        <video
                          ref={(el) => {
                            if (el) remoteVideoRefs.current[participant.id] = el;
                          }}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-xs">
                              {participant.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium bg-black/50 px-2 py-1 rounded flex items-center gap-1">
                            {participant.name}
                            {participant.handRaised && "🖐"}
                            {participant.isMuted && <MicOff className="w-3 h-3" />}
                            {isHost && (
                              <MoreHorizontal 
                                className="w-3 h-3 cursor-pointer hover:text-red-400" 
                                onClick={() => removeParticipant(participant.id)}
                              />
                            )}
                          </span>
                        </div>
                        {!participant.hasVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                            <Avatar className="w-20 h-20">
                              <AvatarFallback className="text-2xl">
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Speaker view
                <div className="h-full flex flex-col">
                  <Card className="flex-1 relative overflow-hidden bg-slate-800 border-slate-600 mb-4">
                    <CardContent className="p-0 h-full">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto">
                    {participants.map((participant) => (
                      <Card key={participant.id} className="w-32 h-24 flex-shrink-0 relative overflow-hidden bg-slate-800 border-slate-600">
                        <CardContent className="p-0 h-full">
                          <Avatar className="w-full h-full rounded-none">
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar for participants and controls */}
            {(waitingRoomParticipants.length > 0 || showTranscription) && (
              <div className="w-80 border-l border-slate-700 bg-slate-800/50">
                {/* Waiting Room */}
                {waitingRoomParticipants.length > 0 && isHost && (
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Waiting Room ({waitingRoomParticipants.length})
                    </h3>
                    <ScrollArea className="h-32">
                      {waitingRoomParticipants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between py-2">
                          <span className="text-sm">{participant.name}</span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => admitFromWaitingRoom(participant.id)}
                              className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                            >
                              Admit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-6 px-2 text-xs"
                            >
                              Deny
                            </Button>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                {/* Transcription */}
                {showTranscription && (
                  <div className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Live Transcription
                    </h3>
                    <ScrollArea className="h-40 bg-slate-900/50 p-3 rounded text-sm">
                      {transcript.map((line, index) => (
                        <div key={index} className="mb-2 text-slate-300">
                          {line}
                        </div>
                      ))}
                      {transcript.length === 0 && (
                        <div className="text-slate-500 italic">
                          Transcription will appear here...
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isAudioEnabled ? "secondary" : "destructive"}
                  onClick={toggleAudio}
                  className="gap-2"
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant={isVideoEnabled ? "secondary" : "destructive"}
                  onClick={toggleVideo}
                  className="gap-2"
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant={isScreenSharing ? "default" : "secondary"}
                  onClick={toggleScreenShare}
                  className="gap-2"
                >
                  {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  Share
                </Button>
              </div>

              {/* Center Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={handRaised ? "default" : "secondary"}
                  onClick={toggleHandRaise}
                  className="gap-2"
                >
                  <Hand className="w-4 h-4" />
                </Button>

                {isHost && (
                  <Button
                    size="sm"
                    variant={isRecording ? "destructive" : "secondary"}
                    onClick={toggleRecording}
                    className="gap-2"
                  >
                    <Circle className="w-4 h-4" />
                    {isRecording ? "Stop" : "Record"}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant={showTranscription ? "default" : "secondary"}
                  onClick={() => setShowTranscription(!showTranscription)}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  CC
                </Button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" className="gap-2">
                  <Settings className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={endCall}
                  className="gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  End Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};