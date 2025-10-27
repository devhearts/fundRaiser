import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Share2, MapPin, Calendar, Copy, Check, Users } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import ContributionForm from "@/components/ContributionForm";
import ContributionList from "@/components/ContributionList";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { MOCK_EVENTS } from "@/data/mockData";

export default function EventLandingPage() {
  const [, params] = useRoute("/event/:id");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("details");


  const eventId = params?.id;
  const mockEvent = MOCK_EVENTS.find(e => e.id === eventId);

  if (!mockEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const mockContributions = [
    {
      id: '1',
      eventId: mockEvent.id,
      donorName: 'John Smith',
      donorEmail: 'john@example.com',
      amount: 100,
      isAnonymous: false,
      isPledge: false,
      message: 'Happy to support this wonderful cause!',
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      eventId: mockEvent.id,
      donorName: 'Emily Chen',
      donorEmail: 'emily@example.com',
      amount: 250,
      isAnonymous: false,
      isPledge: false,
      message: 'A happy marriage is a blessing!',
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ];

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share this link with potential contributors",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContribution = (data: any) => {
    toast({
      title: "Thank you for your contribution!",
      description: "Your support means the world to us.",
    });
  };

  const daysRemaining = mockEvent.deadline 
    ? Math.ceil((mockEvent.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={mockEvent.coverImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800"}
          alt={mockEvent.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="absolute top-6 right-6">
          <Button
            variant="outline"
            className="bg-background/80 backdrop-blur-sm"
            onClick={handleShare}
            data-testid="button-share"
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Share'}
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary text-primary-foreground">Active Campaign</Badge>
              {!mockEvent.isPublic && (
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-blue/50 text-blue">
                  Private Event
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{mockEvent.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              {mockEvent.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{mockEvent.location}</span>
                </div>
              )}
              {daysRemaining && daysRemaining > 0 && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{daysRemaining} days left</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="details" data-testid="tab-details">
                  Event Details
                </TabsTrigger>
                <TabsTrigger value="contributors" data-testid="tab-contributors">
                  <Users className="h-4 w-4 mr-2" />
                  Contributors
                  {isAuthenticated && mockContributions.length > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground px-2 py-0">
                      {mockContributions.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-8">
                <div>
                  {isAuthenticated && (
                    <ProgressBar current={mockEvent.currentAmount} goal={mockEvent.goalAmount} className="mb-8" />
                  )}
                  
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-semibold mb-4">About This Campaign</h2>
                      <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                        {mockEvent.description}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Event Location</h3>
                    <div className="bg-muted/50 rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Map integration placeholder</p>
                        <p className="text-sm font-medium">{mockEvent.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isAuthenticated && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-semibold mb-4">Recent Contributions</h2>
                      <p className="text-muted-foreground mb-6">
                        Thank you to all the wonderful people who have contributed to this event!
                      </p>
                      <ContributionList contributions={mockContributions} />
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Organizer</h3>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {mockEvent.organizerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{mockEvent.organizerName}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDistanceToNow(mockEvent.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contributors" className="space-y-8">
                {isAuthenticated && (
                  <ProgressBar current={mockEvent.currentAmount} goal={mockEvent.goalAmount} className="mb-8" />
                )}
                
                {isAuthenticated ? (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-semibold mb-6">Contributors</h2>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Donor</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            {/* <TableHead>Message</TableHead> */}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockContributions.map((contribution) => (
                            <TableRow key={contribution.id} data-testid={`row-contribution-${contribution.id}`}>
                              <TableCell className="font-medium">
                                {contribution.isAnonymous ? 'Anonymous' : contribution.donorName}
                              </TableCell>
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
                              {/* <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                {contribution.message || '-'}
                              </TableCell> */}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Contributors</h3>
                        <p className="text-muted-foreground">
                          Please log in to view the list of contributors.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <ContributionForm eventId={mockEvent.id} eventTitle={mockEvent.title} onSubmit={handleContribution} sticky />
          </div>
        </div>
      </div>
    </div>
  );
}
