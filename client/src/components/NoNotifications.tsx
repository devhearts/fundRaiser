import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NoNotifications() {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-4">
        <Bell className="h-16 w-16 mx-auto text-muted-foreground" />
        <div className="text-xl font-semibold">No notifications</div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You have no notifications at the moment. New updates and reminders for your events will appear here.
        </p>
      </CardContent>
    </Card>
  );
}
