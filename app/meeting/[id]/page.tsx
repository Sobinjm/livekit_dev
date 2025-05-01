"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { toast } from "@/app/components/ui/use-toast";

interface Meeting {
  id: number;
  meetingId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  isRecording: boolean;
  createdBy: {
    id: number;
    name: string;
    username: string;
  };
}

interface Participant {
  id: number;
  userId: number;
  isHost: boolean;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  // Mock user - in a real app this would come from authentication
  const currentUser = {
    id: 1,
    name: "Test User",
    username: "testuser",
  };

  useEffect(() => {
    async function fetchMeeting() {
      try {
        const response = await fetch(`/api/meetings/${meetingId}`);
        if (!response.ok) {
          throw new Error("Meeting not found");
        }
        const data = await response.json();
        setMeeting(data);
        
        // Fetch participants
        const participantsResponse = await fetch(`/api/meetings/${meetingId}/participants`);
        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json();
          setParticipants(participantsData);
        }
      } catch (error) {
        console.error("Error fetching meeting:", error);
        toast({
          title: "Error",
          description: "Failed to load meeting details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId]);

  const handleJoinMeeting = async () => {
    setIsJoining(true);
    try {
      // Check if user is already a participant
      const isParticipant = participants.some(
        (p) => p.userId === currentUser.id
      );

      if (!isParticipant) {
        // Join the meeting
        const response = await fetch(`/api/meetings/${meetingId}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: currentUser.id }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to join meeting");
        }
      }

      // Get LiveKit token
      const tokenResponse = await fetch(`/api/meetings/${meetingId}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          username: currentUser.username,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        throw new Error(error || "Failed to get access token");
      }

      const { token } = await tokenResponse.json();

      // Store token in session storage for the actual meeting page
      sessionStorage.setItem("meetingToken", token);
      
      // Navigate to the video conference component
      router.push(`/meeting/${meetingId}/conference`);
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join meeting",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Meeting Not Found</h1>
          <p>The meeting you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background sticky top-0 z-30">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Link href="/dashboard" className="text-primary">
              Video Conference App
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{meeting.title}</h1>
              <p className="text-muted-foreground">
                Hosted by {meeting.createdBy.name}
              </p>
            </div>
            <Button onClick={handleJoinMeeting} disabled={isJoining}>
              {isJoining ? "Joining..." : "Join Meeting"}
            </Button>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm mb-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold mb-2">Meeting Details</h2>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium">Meeting ID:</span> {meeting.meetingId}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium">Start Time:</span>{" "}
                  {formatDate(meeting.startTime)}
                </p>
                {meeting.endTime && (
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium">End Time:</span>{" "}
                    {formatDate(meeting.endTime)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium">Recording:</span>{" "}
                  {meeting.isRecording ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-sm text-muted-foreground">
                  {meeting.description || "No description provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Participants ({participants.length})</h2>
            {participants.length > 0 ? (
              <ul className="divide-y">
                {participants.map((participant) => (
                  <li key={participant.id} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{participant.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{participant.user.username}
                      </p>
                    </div>
                    {participant.isHost && (
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        Host
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No participants have joined yet</p>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Video Conference App. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}