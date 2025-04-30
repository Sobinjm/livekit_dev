import { useState, useEffect, useRef } from 'react';
import { Participant } from '@/components/ParticipantGrid';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// This currently uses a mock implementation with real LiveKit integration structure
// In a production app, this would connect to a real LiveKit server
export function useRoom(meetingId: string, user: User) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<Participant>({
    id: user.id.toString(),
    name: user.displayName,
    videoEnabled: true,
    audioEnabled: true,
    isSpeaking: false,
  });
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | undefined>(undefined);
  
  // Video/audio state
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);
  
  // Interval reference
  const speakerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Connect to room on component mount
  useEffect(() => {
    async function connectToRoom() {
      // Indicate that connection is in progress
      setConnectionInProgress(true);
      setConnectionError(null);
      
      try {
        console.log(`Connecting to meeting: ${meetingId}`);
        
        // In a production app, we would get a LiveKit token from the server
        // const response = await apiRequest('POST', `/api/meetings/${meetingId}/token`, {
        //   userId: user.id,
        //   username: user.displayName
        // });
        // const { token } = await response.json();
        
        // Then connect to LiveKit with this token
        // await room.connect(livekitUrl, token);
        
        // For now, using mock data
        // Set up mock participants
        const mockParticipants: Participant[] = [
          {
            id: '2',
            name: 'Sarah Johnson',
            videoEnabled: true,
            audioEnabled: true,
            isSpeaking: false,
          },
          {
            id: '3',
            name: 'Michael Chen',
            videoEnabled: true,
            audioEnabled: true,
            isSpeaking: false,
          },
          {
            id: '4',
            name: 'Lisa Wong',
            videoEnabled: true,
            audioEnabled: true,
            isSpeaking: false,
          },
          {
            id: '5',
            name: 'Robert Parker',
            videoEnabled: false,
            audioEnabled: false,
            isSpeaking: false,
          },
        ];
        
        // Set connected state
        setParticipants(mockParticipants);
        setIsConnected(true);
        setConnectionInProgress(false);
        
        // Simulate active speaker changes
        speakerIntervalRef.current = setInterval(() => {
          const speakingParticipantId = Math.random() > 0.7 
            ? mockParticipants[Math.floor(Math.random() * mockParticipants.length)].id
            : undefined;
          
          setActiveSpeakerId(speakingParticipantId);
          
          // Update isSpeaking flag
          setParticipants(prev => 
            prev.map(p => ({
              ...p,
              isSpeaking: p.id === speakingParticipantId
            }))
          );
        }, 3000);
        
      } catch (error) {
        console.error('Error connecting to LiveKit room:', error);
        setConnectionError('Failed to connect to meeting room');
        setConnectionInProgress(false);
        setIsConnected(false);
        
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the meeting room. Please try again.',
          variant: 'destructive'
        });
      }
    }
    
    connectToRoom();
    
    return () => {
      // Clean up interval
      if (speakerIntervalRef.current) {
        clearInterval(speakerIntervalRef.current);
      }
      
      // In a real implementation, this would disconnect from LiveKit
      console.log(`Disconnecting from meeting: ${meetingId}`);
    };
  }, [meetingId, user.id, user.displayName, toast]);
  
  // Handle camera toggle
  const toggleCamera = () => {
    setCameraEnabled(prev => !prev);
    setLocalParticipant(prev => ({
      ...prev,
      videoEnabled: !prev.videoEnabled
    }));
  };
  
  // Handle microphone toggle
  const toggleMicrophone = () => {
    setMicrophoneEnabled(prev => !prev);
    setLocalParticipant(prev => ({
      ...prev,
      audioEnabled: !prev.audioEnabled
    }));
  };
  
  // Handle screen share toggle
  const toggleScreenShare = () => {
    setIsScreenShareEnabled(prev => !prev);
  };
  
  // Handle leaving the room
  const leaveRoom = () => {
    setIsConnected(false);
    // In a real implementation, this would disconnect from LiveKit
    console.log(`Leaving meeting: ${meetingId}`);
  };
  
  return {
    isConnected,
    participants,
    localParticipant,
    activeSpeakerId,
    cameraEnabled,
    microphoneEnabled,
    isScreenShareEnabled,
    toggleCamera,
    toggleMicrophone,
    toggleScreenShare,
    leaveRoom,
  };
}
