import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Video, VideoOff, ScreenShare, MessageSquare, UserPlus, PhoneOff } from "lucide-react";

interface MeetingControlsProps {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  screenShareEnabled: boolean;
  unreadMessages: number;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
}

export default function MeetingControls({
  cameraEnabled,
  microphoneEnabled,
  screenShareEnabled,
  unreadMessages,
  onToggleCamera,
  onToggleMicrophone,
  onToggleScreenShare,
  onToggleChat,
  onLeave
}: MeetingControlsProps) {
  return (
    <div className="border-t border-neutral-200 bg-white py-3 px-4">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMicrophone}
            className={cn(
              "h-10 w-10 sm:h-12 sm:w-12 rounded-full",
              !microphoneEnabled && "bg-neutral-100 text-neutral-600"
            )}
          >
            {microphoneEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleCamera}
            className={cn(
              "h-10 w-10 sm:h-12 sm:w-12 rounded-full",
              !cameraEnabled && "bg-neutral-100 text-neutral-600"
            )}
          >
            {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleScreenShare}
            className={cn(
              "h-10 w-10 sm:h-12 sm:w-12 rounded-full",
              screenShareEnabled && "bg-primary text-white"
            )}
          >
            <ScreenShare className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleChat}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full relative"
          >
            <MessageSquare className="h-5 w-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
                {unreadMessages}
              </span>
            )}
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            size="sm"
            className="py-2 px-3 sm:px-4 text-sm font-medium hidden sm:flex"
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Add Participant
          </Button>
          
          <Button 
            variant="destructive"
            size="sm"
            onClick={onLeave}
            className="py-2 px-3 sm:px-4 text-sm font-medium"
          >
            <PhoneOff className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">End Call</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
