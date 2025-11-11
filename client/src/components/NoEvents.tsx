import { Card, CardContent } from "@/components/ui/card";
import { CalendarX } from "lucide-react";

export default function NoEvents() {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-4">
        <CalendarX className="h-16 w-16 mx-auto text-muted-foreground" />
        <div className="text-xl font-semibold">No events yet</div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You haven't created any events yet. Create your first event to start receiving contributions from friends and family.
        </p>
      </CardContent>
    </Card>
  );
}
