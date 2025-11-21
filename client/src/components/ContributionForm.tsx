import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { HandCoins, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import USSDModal from "./USSDModal";
import { api } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ContributionFormProps {
  eventId: string;
  eventTitle?: string;
  onSubmit?: (data: any) => void;
  sticky?: boolean;
  verifiedPhone?: string | null;
}

const PRESET_AMOUNTS = [100000, 250000, 500000, 1000000];

export default function ContributionForm({ eventId, eventTitle, onSubmit, sticky = false, verifiedPhone }: ContributionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPledge, setIsPledge] = useState(false);
  const [pledgeDate, setPledgeDate] = useState("");
  const [showUSSDModal, setShowUSSDModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetDonorFields = () => {
    if (user) {
      setDonorName(user.name || "");
      setDonorPhone(user.phone || "");
      setDonorEmail(user.email || "");
    } else {
      setDonorName("");
      // Use verifiedPhone if available, otherwise empty string
      setDonorPhone(verifiedPhone || "");
      setDonorEmail("");
    }
  };

  const resetFormState = () => {
    setMessage("");
    setIsAnonymous(false);
    setIsPledge(false);
    setPledgeDate("");
    setSelectedAmount(null);
    setCustomAmount("");
  };

  useEffect(() => {
    resetDonorFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, verifiedPhone]);

  // Update phone field when verifiedPhone changes
  useEffect(() => {
    if (!user && verifiedPhone) {
      setDonorPhone(verifiedPhone);
    }
  }, [verifiedPhone, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = selectedAmount || parseInt(customAmount);

    if (isPledge) {
      setIsSubmitting(true);
      try {
        const pledgeData = {
          donorName,
          donorEmail: donorEmail || undefined,
          donorPhone,
          amount,
          isAnonymous,
          message: message || undefined,
          pledgeDate,
          status: 'pending'
        };

        const response = await api.events.createPledge(eventId, pledgeData);
        
        toast({
          title: "Pledge created!",
          description: "Thank you for your pledge. We'll remind you when it's time to fulfill it.",
        });

        resetDonorFields();
        resetFormState();

        if (onSubmit) {
          onSubmit(response);
        }
      } catch (error: any) {
        toast({
          title: "Failed to create pledge",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setShowUSSDModal(true);
    }
  };

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  return (
    <Card className={cn("shadow-lg", sticky && "lg:sticky lg:top-6")}>
      <CardHeader>
        <CardTitle>Make a Contribution</CardTitle>
        <CardDescription>Support this cause with your donation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Select Amount</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                  data-testid={`button-amount-${amount}`}
                >
                  UGX {amount.toLocaleString()}
                </Button>
              ))}
            </div>
            <div className="relative">
              <HandCoins className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Custom amount (UGX)"
                className="pl-10"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                data-testid="input-custom-amount"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="donor-name">Your Name</Label>
              <Input
                id="donor-name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="John Doe"
                readOnly={!!user}
                required
                data-testid="input-donor-name"
              />
            </div>
            <div>
              <Label htmlFor="donor-phone">Phone Number</Label>
              <Input
                id="donor-phone"
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="0764123769"
                pattern="^0\d{9}$"
                maxLength={10}
                readOnly={!!user || !!verifiedPhone}
                required
                data-testid="input-donor-phone"
              />
            </div>
            <div>
              <Label htmlFor="donor-email">Email Address (Optional)</Label>
              <Input
                id="donor-email"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="john@example.com"
                readOnly={!!user}
                data-testid="input-donor-email"
              />
            </div>
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Words of encouragement..."
                rows={3}
                data-testid="input-message"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="pledge" className="cursor-pointer">Make this a pledge</Label>
              <Switch
                id="pledge"
                checked={isPledge}
                onCheckedChange={setIsPledge}
                data-testid="switch-pledge"
              />
            </div>
            {isPledge && (
              <div>
                <Label htmlFor="pledge-date">When will you make the payment?</Label>
                <Input
                  id="pledge-date"
                  type="date"
                  value={pledgeDate}
                  onChange={(e) => setPledgeDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  data-testid="input-pledge-date"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={finalAmount <= 0 || !donorName || !donorPhone || (isPledge && !pledgeDate) || isSubmitting}
            data-testid="button-contribute"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isPledge ? 'Creating Pledge...' : 'Processing...'}
              </>
            ) : (
              <>
                {isPledge ? 'Make Pledge' : 'Contribute'} UGX {finalAmount.toLocaleString()}
              </>
            )}
          </Button>
        </form>
      </CardContent>
      
      <USSDModal
        isOpen={showUSSDModal}
        onClose={() => setShowUSSDModal(false)}
        amount={finalAmount}
        phoneNumber={donorPhone}
        eventTitle={eventTitle || "this event"}
        eventId={eventId}
        payerName={donorName}
        payerEmail={donorEmail || undefined}
        onPaymentSuccess={() => {
          resetDonorFields();
          resetFormState();
          setShowUSSDModal(false);
          toast({
            title: "Payment recorded",
            description: "Thank you for your contribution!",
          });
          onSubmit?.({ type: "payment" });
        }}
      />
    </Card>
  );
}
