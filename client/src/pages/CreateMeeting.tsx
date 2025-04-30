import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import { Switch } from "@/components/ui/switch";
import { User } from "@shared/schema";

interface CreateMeetingProps {
  user: User;
}

const formSchema = z.object({
  name: z.string().min(3, "Meeting name must be at least 3 characters"),
  description: z.string().optional(),
  isRecording: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateMeeting({ user }: CreateMeetingProps) {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isRecording: false,
    },
  });
  
  async function onSubmit(values: FormValues) {
    try {
      const response = await apiRequest("POST", "/api/meetings", {
        ...values,
        createdBy: user.id,
      });
      
      const meeting = await response.json();
      toast({
        title: "Meeting Created",
        description: "Your meeting has been created successfully.",
      });
      
      // Navigate to the meeting
      setLocation(`/meeting/${meeting.meetingId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-neutral-900">Create a New Meeting</h1>
            <p className="mt-2 text-neutral-600">Set up a new video conference or webinar</p>
          </header>
          
          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
              <CardDescription>
                Configure your meeting settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Quarterly Procurement Review" {...field} />
                        </FormControl>
                        <FormDescription>
                          Give your meeting a descriptive name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Discuss procurement strategies and approve new vendor contracts"
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isRecording"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Record Meeting</FormLabel>
                          <FormDescription>
                            Automatically start recording when the meeting begins
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setLocation("/")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Meeting</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
