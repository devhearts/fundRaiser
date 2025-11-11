import { Card, CardContent } from "@/components/ui/card";
import { HandCoins } from "lucide-react";

export default function NoContributions() {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-4">
        <HandCoins className="h-16 w-16 mx-auto text-muted-foreground" />
        <div className="text-xl font-semibold">No contributions yet</div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You haven't received any contributions. Share your event links with friends and family to start getting support.
        </p>
      </CardContent>
    </Card>
  );
}
