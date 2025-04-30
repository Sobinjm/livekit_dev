import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import MeetingControls from "@/components/MeetingControls";
import ParticipantGrid from "@/components/ParticipantGrid";
import ChatPanel from "@/components/ChatPanel";
import MeetingInfo from "@/components/MeetingInfo";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRoom } from "@/hooks/useRoom";
import { useWebSocket } from "@/hooks/useWebSocket";
import { User, Meeting as MeetingType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, Menu, MessageSquare } from "lucide-react";

interface MeetingProps {
  meetingId: string;
  user: User;
}

export default function Meeting({ meetingId, user }: MeetingProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMeetingInfoOpen, setIsMeetingInfoOpen] = useState(false);
  
  // LiveKit room connection
  const { 
    participants,
    isConnected,
    localParticipant,
    activeSpeakerId,
    cameraEnabled,
    microphoneEnabled,
    isScreenShareEnabled,
    toggleCamera,
    toggleMicrophone,
    toggleScreenShare,
    leaveRoom
  } = useRoom(meetingId, user);
  
  // WebSocket connection for chat
  const { 
    isConnected: isWsConnected,
    messages,
    sendMessage
  } = useWebSocket(meetingId, user.id);
  
  // Fetch meeting information
  const { data: meeting, isLoading, error } = useQuery<MeetingType>({
    queryKey: ['/api/meetings', meetingId, Date.now()], // Add timestamp to prevent caching
    // In a real application this would fetch from the server
    // Currently simulating meeting data
    queryFn: async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          id: 1,
          meetingId,
          name: "Q3 Procurement Planning Meeting",
          description: "Discuss procurement strategies and approve new vendor contracts",
          createdBy: 1,
          isRecording: false,
          createdAt: new Date()
        };
      } catch (error) {
        throw new Error("Failed to fetch meeting details");
      }
    }
  });
  
  // Join the meeting
  useEffect(() => {
    async function joinMeeting() {
      try {
        if (meetingId && user) {
          // In a real app, this would call the join API
          // await apiRequest("POST", `/api/meetings/${meetingId}/join`, { userId: user.id });
          console.log("Joining meeting:", meetingId);
        }
      } catch (error) {
        toast({
          title: "Error joining meeting",
          description: "Could not join the meeting. Please try again.",
          variant: "destructive",
        });
        setLocation("/");
      }
    }
    
    joinMeeting();
    
    return () => {
      // Clean up when leaving the page
      leaveRoom();
    };
  }, [meetingId, user, toast, setLocation]);
  
  // Handle errors and loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-primary"></div>
          <h2 className="text-xl font-semibold">Joining Meeting...</h2>
          <p className="text-neutral-600">Please wait while we connect you</p>
        </div>
      </div>
    );
  }
  
  if (error || !meeting) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="flex max-w-md flex-col items-center rounded-xl bg-white p-8 shadow-lg">
          <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-neutral-900">Meeting Not Found</h2>
          <p className="mb-6 text-center text-neutral-600">
            The meeting you're trying to join doesn't exist or you don't have permission to join.
          </p>
          <Button onClick={() => setLocation("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`fixed inset-y-0 left-0 z-30 md:relative md:z-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform duration-200 ease-in-out`}>
        <Sidebar user={user} />
      </div>
      
      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-100 bg-white px-4">
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-heading text-lg font-semibold">ProcureConnect</h1>
          </div>
          
          {/* Meeting info - desktop */}
          <div className="hidden items-center md:flex">
            <span className="mr-4 text-sm text-neutral-500">
              {new Date().toLocaleTimeString()}
            </span>
            {meeting.isRecording && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                Recording
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMeetingInfoOpen(true)}
              className="text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <Info className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="hidden items-center md:flex"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              Chat
              {messages.length > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {messages.length}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Meeting space */}
        <div className="flex flex-1 flex-col overflow-auto bg-neutral-900 p-4">
          <ParticipantGrid 
            participants={participants}
            localParticipant={localParticipant}
            activeSpeakerId={activeSpeakerId}
          />
        </div>

        {/* Meeting controls */}
        <MeetingControls 
          cameraEnabled={cameraEnabled}
          microphoneEnabled={microphoneEnabled}
          screenShareEnabled={isScreenShareEnabled}
          onToggleCamera={toggleCamera}
          onToggleMicrophone={toggleMicrophone}
          onToggleScreenShare={toggleScreenShare}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          onLeave={() => {
            leaveRoom();
            setLocation("/");
          }}
          unreadMessages={messages.length}
        />
      </main>
      
      {/* Chat panel */}
      <ChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={(content) => sendMessage(content)}
        user={user}
      />
      
      {/* Meeting info modal */}
      <MeetingInfo
        isOpen={isMeetingInfoOpen}
        onClose={() => setIsMeetingInfoOpen(false)}
        meeting={meeting}
      />
      
      {/* Black overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
