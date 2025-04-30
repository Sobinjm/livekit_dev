import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Meeting from "@/pages/Meeting";
import CreateMeeting from "@/pages/CreateMeeting";
import { useEffect, useState } from "react";

import { User } from "@shared/schema";

// Mock user for now - in a real app, this would come from authentication
const MOCK_USER: User = {
  id: 1,
  username: "testuser",
  displayName: "Test User",
  password: "password" // Required by User type
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Home user={MOCK_USER} />} />
      <Route path="/create" component={() => <CreateMeeting user={MOCK_USER} />} />
      <Route path="/meeting/:id">
        {(params) => <Meeting meetingId={params.id} user={MOCK_USER} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate loading necessary resources
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500); // Reduced timeout for faster testing
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading ProcureConnect...</p>
        </div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
