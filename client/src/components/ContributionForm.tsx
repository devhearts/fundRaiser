import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import USSDModal from "./USSDModal";

interface ContributionFormProps {
  eventId: string;
  eventTitle?: string;
  onSubmit?: (data: any) => void;
  sticky?: boolean;
}

const PRESET_AMOUNTS = [25, 50, 100, 250];

export default function ContributionForm({ eventId, eventTitle, onSubmit, sticky = false }: ContributionFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = selectedAmount || parseInt(customAmount);
    
    // Show USSD modal for payment
    setShowUSSDModal(true);
    
    // Also call the original onSubmit callback if provided
    onSubmit?.({ eventId, amount, donorName, donorPhone, donorEmail, message, isAnonymous, isPledge, pledgeDate });
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
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="pl-9"
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
                placeholder="07XX XXX XXX"
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
            disabled={finalAmount <= 0 || !donorName || !donorPhone || (isPledge && !pledgeDate)}
            data-testid="button-contribute"
          >
            {isPledge ? 'Make Pledge' : 'Contribute'} ${finalAmount.toLocaleString()}
          </Button>
        </form>
      </CardContent>
      
      {/* USSD Payment Modal */}
      <USSDModal
        isOpen={showUSSDModal}
        onClose={() => setShowUSSDModal(false)}
        amount={finalAmount}
        phoneNumber={donorPhone}
        eventTitle={eventTitle || "this event"}
      />
    </Card>
  );
}
