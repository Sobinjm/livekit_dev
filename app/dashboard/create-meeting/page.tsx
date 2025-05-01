"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { toast } from "@/app/components/ui/use-toast";

export default function CreateMeeting() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const meetingData = {
        name: formData.name,
        description: formData.description,
        created_by: 1, // Using test user ID
      };

      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create meeting");
      }

      const result = await response.json();

      toast({
        title: "Meeting Created",
        description: "Your meeting has been successfully created.",
      });

      router.push(`/dashboard`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Create New Meeting</h1>
            <Button asChild variant="outline">
              <Link href="/dashboard">Cancel</Link>
            </Button>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium leading-none"
                >
                  Meeting Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium leading-none"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Meeting"}
                </Button>
              </div>
            </form>
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