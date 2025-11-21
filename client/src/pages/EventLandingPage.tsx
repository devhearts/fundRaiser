import { useState, useEffect } from "react";
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
import { Share2, MapPin, Calendar, Check, Users, Loader2, CreditCard } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import ContributionForm from "@/components/ContributionForm";
import ContributionList from "@/components/ContributionList";
import USSDModal from "@/components/USSDModal";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { MOCK_EVENTS } from "@/data/mockData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/config/api";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

export default function EventLandingPage() {
  const [, params] = useRoute("/event/:id");
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [paymentContribution, setPaymentContribution] = useState<any | null>(null);

  const eventId = params?.id;

  // Restore phone verification state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !eventId) return;

    const storedPhoneToken = localStorage.getItem('phoneToken');
    const storedPhone = localStorage.getItem('verifiedPhone');
    const storedEventId = localStorage.getItem('verifiedEventId');

    // If the stored eventId doesn't match current event, clear the stored data
    if (storedEventId && storedEventId !== eventId) {
      localStorage.removeItem('phoneToken');
      localStorage.removeItem('verifiedPhone');
      localStorage.removeItem('verifiedEventId');
      return;
    }

    // If we have a token and phone, and it's for the current event, restore state
    // Note: Token expiration will be validated by the backend when making API calls
    if (storedPhoneToken && storedPhone && storedEventId === eventId) {
      setVerifiedPhone(storedPhone);
    }
  }, [eventId]);

  // Helper function to normalize phone numbers for comparison
  const normalizePhone = (phone: string | null | undefined): string => {
    if (!phone) return "";
    return phone.replace(/\s+/g, "").trim();
  };

  // Get the phone number to use for matching contributions
  const getMyPhone = (): string | null => {
    if (isAuthenticated && user?.phone) {
      return user.phone;
    }
    return verifiedPhone;
  };

  // Check if a contribution belongs to the current user (authenticated or verified phone)
  const isMyContribution = (contribution: any): boolean => {
    const myPhone = getMyPhone();
    if (!myPhone) return false;
    return normalizePhone(contribution.donorPhone) === normalizePhone(myPhone);
  };

  // Check if contribution needs payment (only pending status)
  const needsPayment = (contribution: any): boolean => {
    return contribution.status === "pending";
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<{ phone: string }>({
    defaultValues: { phone: "" },
  });
  const phoneValue = watch("phone");

  const mockEvent = MOCK_EVENTS.find(e => e.id === eventId);

  // Check if event data is already in the cache (from DashboardPage fetch)
  const cachedEvent = queryClient.getQueryData(["/api/events", eventId ?? ""]);

  const { data: fetchedEvent, isLoading, isError } = useQuery({
    queryKey: ["/api/events", eventId ?? ""],
    queryFn: () => api.events.byId(eventId as string),
    enabled: !!eventId && !cachedEvent, // Only fetch if eventId exists and data isn't cached
    initialData: cachedEvent, // Use cached data if available
  });
  const eventData: any = fetchedEvent ?? mockEvent;

  // Check if we have a phone token stored
  const hasPhoneToken = typeof window !== 'undefined' ? !!localStorage.getItem('phoneToken') : false;
  const phoneKeySegment = isAuthenticated ? "auth" : (verifiedPhone || hasPhoneToken) ? "verified" : "anon";
  const contributionsQueryKey = ["event-contributions", eventId ?? "", phoneKeySegment];
  const contributionsQueryEnabled = !!eventId && (isAuthenticated || !!verifiedPhone || hasPhoneToken);
  const {
    data: eventContributions,
    error: contributionsError,
    isFetching: contributionsLoading,
  } = useQuery({
    queryKey: contributionsQueryKey,
    queryFn: () => api.events.getContributions(eventId as string), // No phone query param - token is in Authorization header
    enabled: contributionsQueryEnabled,
    retry: false,
  });

  if (isError || (!isLoading && !eventData)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !eventData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading event…</div>
      </div>
    );
  }

  const rawContributions = Array.isArray(eventContributions) ? eventContributions : [];
  const contributions = rawContributions.map((contribution: any) => ({
    ...contribution,
    createdAt: contribution.createdAt ? new Date(contribution.createdAt) : new Date(),
  }));
  const contributionsAccessGranted = Array.isArray(eventContributions);
  const accessDenied =
    contributionsError instanceof Error && contributionsError.message.toLowerCase().includes("access denied");

  // Clear expired phone token if we get access denied and have a token
  if (accessDenied && typeof window !== 'undefined' && localStorage.getItem('phoneToken')) {
    localStorage.removeItem('phoneToken');
    localStorage.removeItem('verifiedPhone');
    localStorage.removeItem('verifiedEventId');
    setVerifiedPhone(null);
  }

  const shouldShowPhoneAccessCard = !contributionsAccessGranted;
  const phoneFormErrorMessage =
    shouldShowPhoneAccessCard && contributionsError ? (contributionsError as Error).message : undefined;

  const handlePhoneSubmit = handleSubmit(async ({ phone }) => {
    const sanitized = phone.replace(/\s+/g, "");
    if (!/^07\d{8}$/.test(sanitized)) {
      setError("phone", { type: "pattern", message: "Enter a valid phone number (07XXXXXXXX)." });
      return;
    }

    if (!eventId) {
      setError("phone", { type: "manual", message: "Event ID is missing." });
      return;
    }

    try {
      // Clear any existing error manually
      setError("phone", { type: "manual", message: "" });

      // Call phone verification endpoint to get JWT token
      const response = await api.contributions.verifyPhone({
        phone: sanitized,
        eventId: eventId,
      });

      // Store the phone verification token and phone number
      localStorage.setItem("phoneToken", response.token);
      localStorage.setItem("verifiedPhone", sanitized);
      localStorage.setItem("verifiedEventId", eventId);

      // Set verified phone for UI state
      setVerifiedPhone(sanitized);

      // Invalidate contributions query to refetch with new token
      queryClient.invalidateQueries({ queryKey: contributionsQueryKey });

      toast({
        title: "Phone verified",
        description: "You can now view your contributions.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to verify phone number.";
      setError("phone", { type: "manual", message: errorMessage });
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleResetPhoneAccess = () => {
    reset({ phone: "" });
    setVerifiedPhone(null);
    // Clear phone token and related data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('phoneToken');
      localStorage.removeItem('verifiedPhone');
      localStorage.removeItem('verifiedEventId');
    }
    // Invalidate contributions query
    queryClient.invalidateQueries({ queryKey: contributionsQueryKey });
  };

  const phoneAccessDescription = isAuthenticated
    ? "We couldn't verify your organizer access. Enter the phone number you used when contributing to view the list."
    : "Enter the phone number you used when contributing to view the list.";

  const renderPhoneAccessCard = (errorMessage?: string) => (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <Users className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">Verify your contribution</h3>
          <p className="text-muted-foreground">{phoneAccessDescription}</p>
        </div>
        <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="tel"
            {...register("phone")}
            placeholder="07XXXXXXXX"
            className="flex-1"
          />
          <Button type="submit" disabled={!phoneValue || contributionsLoading}>
            {contributionsLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            View contributions
          </Button>
        </form>
        {(errors.phone?.message || errorMessage) && (
          <p className="text-sm text-destructive text-center">
            {errors.phone?.message || errorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const daysRemaining = eventData.deadline 
    ? Math.ceil((new Date(eventData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={eventData.coverImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800"}
          alt={eventData.title}
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
              {eventData.isPublic === false && (
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-blue/50 text-blue">
                  Private Event
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{eventData.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              {eventData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{eventData.location}</span>
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
                  {contributionsAccessGranted && contributions.length > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground px-2 py-0">
                      {contributions.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-8">
                <div>
                  {contributionsAccessGranted && (
                    <ProgressBar current={eventData.currentAmount} goal={eventData.goalAmount} className="mb-8" />
                  )}

                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-semibold mb-4">About This Campaign</h2>
                      <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                        {eventData.description}
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
                        <p className="text-sm text-muted-foreground font-medium">{eventData.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {contributionsAccessGranted && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-semibold mb-4">Recent Contributions</h2>
                      <p className="text-muted-foreground mb-6">
                        Thank you to all the wonderful people who have contributed to this event!
                      </p>
                      <ContributionList contributions={contributions} isLoading={contributionsLoading} />
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Organizer</h3>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {eventData.organizerName.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{eventData.organizerName}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDistanceToNow(new Date(eventData.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contributors" className="space-y-8">
                {contributionsAccessGranted && (
                  <ProgressBar current={eventData.currentAmount} goal={eventData.goalAmount} className="mb-8" />
                )}

                {!contributionsLoading && contributionsAccessGranted && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl font-semibold">Contributors</h2>
                          {!isAuthenticated && verifiedPhone && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Viewing contributions as: <span className="font-medium">{verifiedPhone}</span>
                            </p>
                          )}
                        </div>
                        {!isAuthenticated && verifiedPhone && (
                          <Button variant="outline" size="sm" onClick={handleResetPhoneAccess}>
                            Change phone
                          </Button>
                        )}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Donor</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contributions.length > 0 ? (
                            contributions.map((contribution) => (
                              <TableRow key={contribution.id} data-testid={`row-contribution-${contribution.id}`}>
                                <TableCell className="font-medium">
                                  {contribution.isAnonymous ? "Anonymous" : contribution.donorName}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {contribution.donorPhone || "N/A"}
                                </TableCell>
                                <TableCell className="font-semibold text-primary">
                                  UGX {contribution.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {contribution.createdAt.toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {isMyContribution(contribution) && needsPayment(contribution) ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setPaymentContribution(contribution)}
                                    >
                                      <CreditCard className="h-4 w-4 mr-2" />
                                      Pay
                                    </Button>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                No contributions yet. Be the first to contribute!
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {shouldShowPhoneAccessCard &&
                  renderPhoneAccessCard(phoneFormErrorMessage)}
                  {/* {renderPhoneAccessCard(phoneFormErrorMessage)} */}
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <ContributionForm
              eventId={eventData.id}
              eventTitle={eventData.title}
              sticky
              verifiedPhone={verifiedPhone}
              onSubmit={() => {
                queryClient.invalidateQueries({ queryKey: contributionsQueryKey });
              }}
            />
          </div>
        </div>

        {paymentContribution && (
          <USSDModal
            isOpen={!!paymentContribution}
            onClose={() => setPaymentContribution(null)}
            amount={paymentContribution.amount}
            phoneNumber={paymentContribution.donorPhone}
            eventTitle={eventData.title}
            contributionId={paymentContribution.id}
            payerName={paymentContribution.donorName}
            payerEmail={paymentContribution.donorEmail || undefined}
            onPaymentSuccess={() => {
              setPaymentContribution(null);
              queryClient.invalidateQueries({ queryKey: contributionsQueryKey });
              toast({
                title: "Payment processed",
                description: "Your payment has been recorded successfully!",
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
