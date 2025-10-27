import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Copy, Check, ExternalLink, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface USSDModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  phoneNumber: string;
  eventTitle: string;
}

export default function USSDModal({ isOpen, onClose, amount, phoneNumber, eventTitle }: USSDModalProps) {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Generate USSD codes for MTN and Airtel
  const generateUSSDCode = (provider: 'MTN' | 'Airtel', phone: string, amount: number) => {
    // Remove any non-digit characters from phone number
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (provider === 'MTN') {
      // MTN Mobile Money USSD code format
      return `*165*3*${cleanPhone}*${amount}#`;
    } else {
      // Airtel Money USSD code format
      return `*185*9*${cleanPhone}*${amount}#`;
    }
  };

  const mtnCode = generateUSSDCode('MTN', phoneNumber, amount);
  const airtelCode = generateUSSDCode('Airtel', phoneNumber, amount);

  const copyToClipboard = async (code: string, provider: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "USSD Code Copied!",
        description: `${provider} code copied to clipboard. Dial it on your phone to complete payment.`,
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopiedCode(null), 3000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy code. Please manually copy the USSD code.",
        variant: "destructive",
      });
    }
  };

  const openDialer = (code: string) => {
    // Create a tel: link to open the phone dialer
    window.open(`tel:${code}`, '_self');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Choose your preferred payment method to complete your contribution of <strong>${amount.toLocaleString()}</strong> for <strong>{eventTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="mtn" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mtn" className="flex items-center gap-2">
              <Badge className="bg-yellow-500 text-white text-xs">MTN</Badge>
              MTN Mobile Money
            </TabsTrigger>
            <TabsTrigger value="airtel" className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white text-xs">Airtel</Badge>
              Airtel Money
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <Badge className="bg-blue-500 text-white text-xs">Card</Badge>
              Card Payment
            </TabsTrigger>
          </TabsList>

          {/* MTN Tab */}
          <TabsContent value="mtn" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-yellow-500 text-white">MTN</Badge>
                  <span className="font-medium">MTN Mobile Money</span>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">USSD Code:</p>
                    <code className="text-lg font-mono bg-white p-2 rounded border block">
                      {mtnCode}
                    </code>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(mtnCode, 'MTN')}
                      className="flex-1"
                    >
                      {copiedCode === mtnCode ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialer(mtnCode)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Dial
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions for MTN */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to complete MTN payment:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Copy the USSD code above</li>
                <li>Dial the code on your phone</li>
                <li>Follow the MTN Mobile Money prompts</li>
                <li>Enter your PIN when prompted</li>
                <li>You'll receive a confirmation SMS</li>
              </ol>
            </div>
          </TabsContent>

          {/* Airtel Tab */}
          <TabsContent value="airtel" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-red-500 text-white">Airtel</Badge>
                  <span className="font-medium">Airtel Money</span>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">USSD Code:</p>
                    <code className="text-lg font-mono bg-white p-2 rounded border block">
                      {airtelCode}
                    </code>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(airtelCode, 'Airtel')}
                      className="flex-1"
                    >
                      {copiedCode === airtelCode ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialer(airtelCode)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Dial
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions for Airtel */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to complete Airtel payment:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Copy the USSD code above</li>
                <li>Dial the code on your phone</li>
                <li>Follow the Airtel Money prompts</li>
                <li>Enter your PIN when prompted</li>
                <li>You'll receive a confirmation SMS</li>
              </ol>
            </div>
          </TabsContent>

          {/* Card Payment Tab */}
          <TabsContent value="card" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-blue-500 text-white">Card</Badge>
                  <span className="font-medium">Card Payment</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">Secure Card Payment</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Pay securely with your Visa, Mastercard, or other supported cards
                    </p>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600 mb-1">Amount to pay:</p>
                      <p className="text-xl font-bold text-green-600">${amount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Card Payment",
                          description: "Card payment integration will be available soon. Please use mobile money for now.",
                        });
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay with Card
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Powered by Pesapal • Secure & Encrypted
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions for Card Payment */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Card Payment Information:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Secure payment processing via Pesapal</li>
                <li>Accepts Visa, Mastercard, and other major cards</li>
                <li>Your card details are encrypted and secure</li>
                <li>You'll receive an email confirmation</li>
                <li>Payment is processed instantly</li>
              </ul>
            </div>
          </TabsContent>

          {/* Close Button */}
          <div className="flex gap-2 pt-2">
            <Button onClick={onClose} className="flex-1" variant="outline">
              Close
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
