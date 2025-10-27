import EventForm from "@/components/EventForm";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function CreateEventPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  //todo: remove mock functionality - replace with proper auth protection
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

  const handleSubmit = (data: any) => {
    //todo: remove mock functionality - this will be replaced with actual API call
    const mockEventId = Math.random().toString(36).substring(7);
    const shareableLink = `${window.location.origin}/event/${mockEventId}`;
    
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
      setLocation(`/event/${mockEventId}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <EventForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
