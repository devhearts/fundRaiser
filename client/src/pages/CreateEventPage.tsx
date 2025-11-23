import EventForm from "@/components/EventForm";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/config/api";

export default function CreateEventPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an event.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, setLocation, toast]);

  const handleSubmit = async (data: any) => {
    // Early return if not authenticated (useEffect handles redirect, but this is a safety check)
    if (!isAuthenticated) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.events.create(data);
      const eventId = response.id;
      const shareableLink = `${window.location.origin}/event/${eventId}`;

      // Invalidate events query to refetch the updated list
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });

      toast({
        title: "Event Created Successfully!",
        description: (
          <div className="space-y-2">
            <p>Your fundraising event has been created.</p>
            <div className="mt-2 p-2 bg-muted rounded-md">
              <p className="text-xs font-mono truncate">{shareableLink}</p>
            </div>
          </div>
        ),
      });

      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error creating event:", error);

      // Handle validation errors
      if (error.response?.status === 400) {
        const errorDetails = error.data?.details || [];
        const errorMessages = errorDetails.map((d: any) => d.message).join(", ");
        toast({
          title: "Validation Error",
          description: errorMessages || error.data?.error || "Please check your input and try again.",
          variant: "destructive",
        });
      } else if (error.response?.status === 409) {
        // Duplicate event error
        toast({
          title: "Duplicate Event",
          description: error.data?.message || "You already have an event with this title. Please choose a different title.",
          variant: "destructive",
        });
      } else if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        setLocation("/");
      } else {
        toast({
          title: "Error Creating Event",
          description: error.message || "Failed to create event. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <EventForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
