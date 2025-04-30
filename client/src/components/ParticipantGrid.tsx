import { cn } from "@/lib/utils";
import { Mic, MicOff } from "lucide-react";

export interface Participant {
  id: string;
  name: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isSpeaking: boolean;
  videoTrack?: MediaStreamTrack;
}

interface ParticipantGridProps {
  participants: Participant[];
  localParticipant?: Participant;
  activeSpeakerId?: string;
}

export default function ParticipantGrid({
  participants,
  localParticipant,
  activeSpeakerId
}: ParticipantGridProps) {
  // Combine local participant with other participants
  const allParticipants = localParticipant 
    ? [localParticipant, ...participants] 
    : participants;
  
  // If there's an active speaker, place them at the top
  const sortedParticipants = activeSpeakerId 
    ? [
        ...allParticipants.filter(p => p.id === activeSpeakerId),
        ...allParticipants.filter(p => p.id !== activeSpeakerId)
      ]
    : allParticipants;
  
  // Function to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (sortedParticipants.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-2 text-xl">Waiting for participants to join...</p>
          <p className="text-sm opacity-70">Share the meeting link to invite others</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main video display - show active speaker */}
      {sortedParticipants.length > 0 && (
        <div className="relative mb-4 aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
          {sortedParticipants[0].videoEnabled ? (
            <video 
              className="h-full w-full object-cover"
              autoPlay
              playsInline
              muted={sortedParticipants[0].id === localParticipant?.id}
            >
              {/* In a real app, this would be connected to the participant's video track */}
            </video>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl text-white">
                {getInitials(sortedParticipants[0].name)}
              </div>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 rounded-lg bg-black bg-opacity-50 px-3 py-1 text-white flex items-center">
            {sortedParticipants[0].audioEnabled ? (
              <Mic className="mr-2 h-4 w-4" />
            ) : (
              <MicOff className="mr-2 h-4 w-4" />
            )}
            <span>{sortedParticipants[0].name}</span>
            {sortedParticipants[0].id === localParticipant?.id && " (You)"}
          </div>
        </div>
      )}

      {/* Participant grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 overflow-y-auto pb-20">
        {sortedParticipants.map((participant, index) => (
          <div 
            key={participant.id}
            className={cn(
              "aspect-[4/3] rounded-lg overflow-hidden bg-neutral-800 relative",
              index === 0 && sortedParticipants.length > 1 && "hidden", // Hide the first participant from grid if they're in the main view
              participant.isSpeaking && "ring-2 ring-primary"
            )}
          >
            {participant.videoEnabled ? (
              <video 
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                muted={participant.id === localParticipant?.id}
              >
                {/* In a real app, this would be connected to the participant's video track */}
              </video>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary">
                <span className="text-2xl font-medium text-white">
                  {getInitials(participant.name)}
                </span>
              </div>
            )}
            
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              <span className="truncate rounded bg-black bg-opacity-50 px-2 py-1 text-xs text-white">
                {participant.name}
                {participant.id === localParticipant?.id && " (You)"}
              </span>
              <div className="flex space-x-1">
                {participant.audioEnabled ? (
                  <Mic className="h-4 w-4 rounded-full bg-black bg-opacity-50 p-1 text-white" />
                ) : (
                  <MicOff className="h-4 w-4 rounded-full bg-black bg-opacity-50 p-1 text-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
