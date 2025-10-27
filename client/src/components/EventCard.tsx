import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Share2 } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { Event } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface EventCardProps {
  event: Event;
  onViewDetails?: (id: string) => void;
  onShare?: (id: string) => void;
}

export default function EventCard({ event, onViewDetails, onShare }: EventCardProps) {
  const getStatusBadge = () => {
    if (event.status === "completed") return <Badge variant="secondary">Completed</Badge>;
    if (event.status === "active") return <Badge className="bg-primary text-primary-foreground">Active</Badge>;
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const daysRemaining = event.deadline
    ? Math.ceil((new Date(event.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 cursor-pointer"
      onClick={() => onViewDetails?.(event.id)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.coverImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4">{getStatusBadge()}</div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-semibold text-white line-clamp-2">{event.title}</h3>
        </div>
      </div>
      
      <CardHeader className="pb-4">
        <div className="space-y-3">
          <ProgressBar current={event.currentAmount} goal={event.goalAmount} />
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {daysRemaining !== null && daysRemaining > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{daysRemaining} days left</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(event.id);
          }}
          data-testid={`button-view-${event.id}`}
        >
          View Details
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onShare?.(event.id);
          }}
          data-testid={`button-share-${event.id}`}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
