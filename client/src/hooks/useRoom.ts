import { useState, useEffect } from 'react';
import { Participant } from '@/components/ParticipantGrid';
import { User } from '@shared/schema';

// This is a mock implementation - in a real app, it would use LiveKit
export function useRoom(meetingId: string, user: User) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<Participant>({
    id: user.id.toString(),
    name: user.displayName,
    videoEnabled: true,
    audioEnabled: true,
    isSpeaking: false,
  });
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | undefined>(undefined);
  
  // Mock video/audio state
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);
  
  // Connect to room on component mount
  useEffect(() => {
    // In a real implementation, this would create a connection to LiveKit
    console.log(`Connecting to meeting: ${meetingId}`);
    
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
    
    // Set initial state
    setParticipants(mockParticipants);
    setIsConnected(true);
    
    // Simulate active speaker changes
    const speakerInterval = setInterval(() => {
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
    
    return () => {
      clearInterval(speakerInterval);
      // In a real implementation, this would disconnect from LiveKit
      console.log(`Disconnecting from meeting: ${meetingId}`);
    };
  }, [meetingId]);
  
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
