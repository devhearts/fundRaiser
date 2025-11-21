import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contribution } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare } from "lucide-react";

interface ContributionListProps {
  contributions: Contribution[];
  isLoading?: boolean;
}

export default function ContributionList({ contributions, isLoading = false }: ContributionListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Recent Contributions</CardTitle>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No contributions yet. Be the first to support this cause!
          </p>
        ) : (
          contributions.slice(-3).map((contribution) => {
            const displayName = contribution.isAnonymous ? "Anonymous" : contribution.donorName;
            const initials = displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={contribution.id} className="flex gap-3" data-testid={`contribution-${contribution.id}`}>
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium text-sm truncate">{displayName}</p>
                    <p className="font-semibold text-primary text-sm whitespace-nowrap">
                      UGX {contribution.amount.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(contribution.createdAt), { addSuffix: true })}
                  </p>
                  {contribution.message && (
                    <div className="mt-2 flex gap-2 items-start">
                      <MessageSquare className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm text-muted-foreground italic line-clamp-2">
                        "{contribution.message}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
