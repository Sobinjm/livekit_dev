"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

interface Meeting {
  id: number;
  meeting_id: string;
  name: string;
  description: string | null;
  is_recording: boolean;
  created_by: number;
  created_at: Date;
  creator?: {
    id: number;
    display_name: string;
    username: string;
  };
}

// This would normally be fetched from the server
const MOCK_MEETINGS: Meeting[] = [
  {
    id: 1,
    meeting_id: "abc-123-xyz",
    name: "Weekly Team Sync",
    description: "Weekly team synchronization meeting",
    is_recording: false,
    created_by: 1,
    created_at: new Date(),
    creator: {
      id: 1,
      display_name: "Test User",
      username: "testuser"
    }
  },
  {
    id: 2,
    meeting_id: "def-456-uvw",
    name: "Product Planning",
    description: "Discuss upcoming product features",
    is_recording: false,
    created_by: 1,
    created_at: new Date(),
    creator: {
      id: 1,
      display_name: "Test User",
      username: "testuser"
    }
  },
];

// This would normally be fetched from the server
const MOCK_USER = {
  id: 1,
  display_name: "Test User",
  username: "testuser",
};

export default function Dashboard() {
  const [meetings] = useState<Meeting[]>(MOCK_MEETINGS);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background sticky top-0 z-30">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Video Conference App</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Welcome, {MOCK_USER.display_name}</span>
            <Button asChild variant="outline">
              <Link href="/auth/logout">Logout</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/create-meeting">Create Meeting</Link>
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Meetings</h2>
            {meetings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-card rounded-lg border p-4 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold">{meeting.name}</h3>
                    <p className="text-muted-foreground mb-2">
                      {meeting.description}
                    </p>
                    <p className="text-sm mb-4">
                      {formatDate(meeting.created_at)}
                    </p>
                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/meeting/${meeting.meeting_id}`}>
                          Join Meeting
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/meetings/${meeting.id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">No upcoming meetings</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/create-meeting">
                    Schedule a Meeting
                  </Link>
                </Button>
              </div>
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