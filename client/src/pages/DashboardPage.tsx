import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HandCoins, TrendingUp, Users, Bell, Share2, Eye, Check, Loader2 } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/config/api";
import { Event } from "@shared/schema";
import NoContributions from "@/components/NoContributions";
import NoNotifications from "@/components/NoNotifications";
import NoEvents from "@/components/NoEvents";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  
  const { data: eventsResponse, isLoading: eventsLoading, isError: eventsError, error: eventsQueryError } = useQuery({
    queryKey: ["/api/events"],
    queryFn: () => api.events.list(),
    enabled: isAuthenticated, // Only fetch when authenticated
  });
  
  const handleViewEvent = async (id: string) => {
    // Don't do anything if already loading this event
    if (loadingEventId === id) return;
    
    setLoadingEventId(id);
    try {
      // Fetch the event in the background and cache it using React Query
      await queryClient.fetchQuery({
        queryKey: ["/api/events", id],
        queryFn: () => api.events.byId(id),
      });
      // Only route if fetch was successful
      setLocation(`/event/${id}`);
    } catch (error) {
      // Show error toast if fetch failed
      toast({
        title: "Failed to load event",
        description: "Could not fetch event details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingEventId(null);
    }
  };

  const handleShareEvent = (id: string) => {
    const url = `${window.location.origin}/event/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedEventId(id);
    setTimeout(() => setCopiedEventId(null), 2000);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to view your dashboard.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, setLocation, toast]);

  // API returns { events: Event[], eventsStats: {...} }
  const allEvents = eventsResponse?.events ?? [];
  const eventsStats = eventsResponse?.eventsStats ?? null;

  // Log errors for debugging
  useEffect(() => {
    if (eventsError) {
      console.error("Error fetching events:", eventsQueryError);
      toast({
        title: "Failed to load events",
        description: eventsQueryError?.message || "Could not fetch your events. Please try again.",
        variant: "destructive",
      });
    }
  }, [eventsError, eventsQueryError, toast]);
  
  const activeEvents = allEvents.filter((event: Event) => event.status !== 'completed');
  const completedEvents = allEvents.filter((event: Event) => event.status === 'completed');
  
  // TODO: Implement API endpoint to fetch all user contributions across all events
  const contributions: any[] = [];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage all your celebration events (weddings, birthdays, etc.) and track contributions from friends & family</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX {eventsStats?.totalRaised?.toLocaleString() ?? 0}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventsStats?.activeEvents ?? 0}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contributors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventsStats?.completedPledges ?? 0}</div>
              <p className="text-xs text-muted-foreground">Total supporters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Pledges</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventsStats?.pendingPledges ?? 0}</div>
              <p className="text-xs text-muted-foreground">Needs follow-up</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events" data-testid="tab-events" className="min-w-[200px] px-8">My Active Events</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed" className="min-w-[200px] px-8">Completed Events</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications" className="min-w-[200px] px-8">
              Notifications
              {/* TODO: Add unread count when notifications API is implemented */}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {eventsLoading && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">Loading your events…</CardContent>
              </Card>
            )}
            {eventsError && (
              <Card>
                <CardContent className="p-6 text-sm text-destructive">Failed to load events.</CardContent>
              </Card>
            )}
            {!eventsLoading && !eventsError && activeEvents.length === 0 && <NoEvents />}
            {!eventsLoading && !eventsError && activeEvents.length > 0 && activeEvents.map((event: any) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <img
                      src={event.coverImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800"}
                      alt={event.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <div className="flex items-center gap-2">
                            {event.isPublic === false && (
                              <Badge variant="outline" className="border-blue/50 text-blue">Private</Badge>
                            )}
                            {event.status && (
                              <Badge className="bg-primary text-primary-foreground">{event.status}</Badge>
                            )}
                          </div>
                        </div>
                        <ProgressBar current={event.currentAmount ?? 0} goal={event.goalAmount ?? 0} />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewEvent(event.id)}
                          data-testid={`button-view-${event.id}`}
                          disabled={!!loadingEventId}
                        >
                          {loadingEventId === event.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShareEvent(event.id)}
                          data-testid={`button-share-${event.id}`}
                        >
                          {copiedEventId === event.id ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Link
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-notify-${event.id}`}>
                          <Bell className="h-4 w-4 mr-2" />
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {eventsLoading && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">Loading completed events…</CardContent>
              </Card>
            )}
            {eventsError && (
              <Card>
                <CardContent className="p-6 text-sm text-destructive">Failed to load completed events.</CardContent>
              </Card>
            )}
            {!eventsLoading && !eventsError && completedEvents.length === 0 && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground text-center">
                  No completed events yet.
                </CardContent>
              </Card>
            )}
            {!eventsLoading && !eventsError && completedEvents.length > 0 && completedEvents.map((event: any) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <img
                      src={event.coverImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800"}
                      alt={event.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <div className="flex items-center gap-2">
                            {event.isPublic === false && (
                              <Badge variant="outline" className="border-blue/50 text-blue">Private</Badge>
                            )}
                            {event.status && (
                              <Badge className="bg-primary text-primary-foreground">{event.status}</Badge>
                            )}
                          </div>
                        </div>
                        <ProgressBar current={event.currentAmount ?? 0} goal={event.goalAmount ?? 0} />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewEvent(event.id)}
                          data-testid={`button-view-${event.id}`}
                          disabled={!!loadingEventId}
                        >
                          {loadingEventId === event.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShareEvent(event.id)}
                          data-testid={`button-share-${event.id}`}
                        >
                          {copiedEventId === event.id ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="contributions">
            {contributions.length === 0 ? (
              <NoContributions />
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((contribution: any) => (
                      <TableRow key={contribution.id} data-testid={`row-contribution-${contribution.id}`}>
                        <TableCell className="font-medium">{contribution.eventTitle}</TableCell>
                        <TableCell>{contribution.donorName}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          UGX {contribution.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={contribution.isPledge ? "outline" : "secondary"}>
                            {contribution.isPledge ? 'Pledge' : 'Payment'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={contribution.status === 'completed' ? "default" : "outline"}>
                            {contribution.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {contribution.createdAt.toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notifications">
            {/* TODO: Implement notifications API endpoint and fetch notifications here */}
            <NoNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
