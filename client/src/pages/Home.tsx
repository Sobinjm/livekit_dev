import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { User } from "@shared/schema";

interface HomeProps {
  user: User;
}

export default function Home({ user }: HomeProps) {
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [_, navigate] = useLocation();
  
  const { data: recentMeetings, isLoading } = useQuery({
    queryKey: ['/api/meetings/recent'],
    enabled: false, // Disable actual API call for now
  });
  
  // Example recent meetings data for UI display
  const mockRecentMeetings = [
    { 
      id: 1, 
      meetingId: "abc-123", 
      name: "Q3 Procurement Planning", 
      description: "Discuss Q3 procurement strategies and approve new vendor contracts",
      createdAt: new Date(Date.now() - 86400000) // yesterday
    },
    { 
      id: 2, 
      meetingId: "def-456", 
      name: "Weekly Team Standup", 
      description: "Weekly procurement team check-in",
      createdAt: new Date(Date.now() - 604800000) // week ago
    }
  ];
  
  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinMeetingId.trim()) {
      navigate(`/meeting/${joinMeetingId.trim()}`);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-neutral-900">Welcome, {user.displayName}</h1>
            <p className="mt-2 text-neutral-600">Manage your meetings and webinars with ProcureConnect</p>
          </header>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Join Meeting */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Join a Meeting</CardTitle>
                <CardDescription>
                  Enter a meeting ID to join an existing meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinMeeting} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input 
                      type="text" 
                      placeholder="Enter meeting ID" 
                      value={joinMeetingId}
                      onChange={(e) => setJoinMeetingId(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={!joinMeetingId.trim()}>
                    Join
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Start Meeting */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Start a Meeting</CardTitle>
                <CardDescription>
                  Create a new meeting or webinar
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => navigate("/create")}>
                  Create New Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h2 className="mb-4 font-heading text-xl font-semibold text-neutral-900">Recent Meetings</h2>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary"></div>
                </div>
              ) : mockRecentMeetings && mockRecentMeetings.length > 0 ? (
                mockRecentMeetings.map((meeting) => (
                  <Card key={meeting.id} className="hover:bg-neutral-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{meeting.name}</CardTitle>
                        <span className="text-sm text-neutral-500">{formatDate(meeting.createdAt)}</span>
                      </div>
                      <CardDescription>{meeting.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => navigate(`/meeting/${meeting.meetingId}`)}
                      >
                        Join Again
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="mb-4 text-neutral-600">No recent meetings found</p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/create")}
                    >
                      Create Your First Meeting
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
