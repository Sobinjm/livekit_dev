import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Meeting } from "@shared/schema";
import { Copy, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MeetingInfoProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
}

export default function MeetingInfo({ isOpen, onClose, meeting }: MeetingInfoProps) {
  const { toast } = useToast();
  
  const handleCopyMeetingId = () => {
    navigator.clipboard.writeText(meeting.meetingId);
    toast({
      title: "Copied!",
      description: "Meeting ID copied to clipboard",
    });
  };
  
  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/meeting/${meeting.meetingId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied!",
      description: "Invitation link copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meeting Information</DialogTitle>
          <DialogDescription>
            Share these details to invite others to your meeting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-medium mb-2">{meeting.name}</h4>
            {meeting.description && (
              <p className="text-sm text-neutral-600 mb-4">{meeting.description}</p>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Meeting ID</label>
              <div className="flex items-center">
                <span className="font-medium text-neutral-700">{meeting.meetingId}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="ml-2 h-8 w-8 text-primary"
                  onClick={handleCopyMeetingId}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Invitation Link</label>
              <div className="flex items-center">
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg" 
                  value={`${window.location.origin}/meeting/${meeting.meetingId}`} 
                  readOnly 
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="ml-2 h-8 w-8 text-primary"
                  onClick={handleCopyInviteLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Meeting Security</label>
              <div className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-neutral-700">End-to-end encrypted</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <Button className="w-full" onClick={handleCopyInviteLink}>
              Invite Others
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
