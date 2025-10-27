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
import { DollarSign, TrendingUp, Users, Bell, Share2, Eye } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { MOCK_EVENTS, MOCK_CONTRIBUTIONS, MOCK_NOTIFICATIONS } from "@/data/mockData";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleViewEvent = (id: string) => {
    setLocation(`/event/${id}`);
  };

  const handleShareEvent = (id: string) => {
    const url = `${window.location.origin}/event/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share this link with potential contributors",
    });
  };

  //todo: remove mock functionality - replace with proper auth protection
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

  const totalRaised = MOCK_EVENTS.reduce((sum, event) => sum + event.currentAmount, 0);
  const activeEvents = MOCK_EVENTS.filter(e => e.status === 'active').length;
  const totalContributors = MOCK_CONTRIBUTIONS.length; // Count from contributions instead
  const pendingPledges = MOCK_CONTRIBUTIONS.filter(c => c.isPledge && c.status === 'pending').length;

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
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRaised.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEvents}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contributors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContributors}</div>
              <p className="text-xs text-muted-foreground">Total supporters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Pledges</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPledges}</div>
              <p className="text-xs text-muted-foreground">Needs follow-up</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events" data-testid="tab-events">My Events</TabsTrigger>
            <TabsTrigger value="contributions" data-testid="tab-contributions">Contributions</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              Notifications
              {MOCK_NOTIFICATIONS.filter(n => !n.read).length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground px-2 py-0">
                  {MOCK_NOTIFICATIONS.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {MOCK_EVENTS.map((event) => (
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
                            {!event.isPublic && (
                              <Badge variant="outline" className="border-blue/50 text-blue">Private</Badge>
                            )}
                            <Badge className="bg-primary text-primary-foreground">{event.status}</Badge>
                          </div>
                        </div>
                        <ProgressBar current={event.currentAmount} goal={event.goalAmount} />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewEvent(event.id)}
                          data-testid={`button-view-${event.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShareEvent(event.id)}
                          data-testid={`button-share-${event.id}`}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Link
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

          <TabsContent value="contributions">
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
                  {MOCK_CONTRIBUTIONS.map((contribution) => (
                    <TableRow key={contribution.id} data-testid={`row-contribution-${contribution.id}`}>
                      <TableCell className="font-medium">{contribution.eventTitle}</TableCell>
                      <TableCell>{contribution.donorName}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        ${contribution.amount.toLocaleString()}
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
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardContent className="p-6 space-y-4">
                {MOCK_NOTIFICATIONS.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                    }`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={notification.read ? 'text-muted-foreground' : 'font-medium'}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge className="bg-primary text-primary-foreground">New</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
