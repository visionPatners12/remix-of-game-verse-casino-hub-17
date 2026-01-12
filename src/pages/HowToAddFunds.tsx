import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, CreditCard, Smartphone, Building2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HowToAddFunds() {
  const navigate = useNavigate();

  const depositMethods = [
    {
      icon: <Wallet className="h-6 w-6 text-primary" />,
      title: "Cryptocurrency (USDC)",
      description: "Network: Polygon / Base",
      time: "2-5 minutes",
      fees: "Free",
      available: true,
      steps: [
        "Go to your Wallet",
        "Click 'Deposit' button",
        "Select 'Cryptocurrency'",
        "Copy your unique USDC address",
        "Send USDC from your external wallet",
        "Wait 2-5 minutes for confirmation"
      ]
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Coinbase Pay",
      description: "Buy crypto directly",
      time: "Instant",
      fees: "Coinbase fees apply",
      available: true,
      steps: [
        "Go to your Wallet",
        "Click 'Deposit' button",
        "Select 'Coinbase Pay'",
        "Connect your Coinbase account",
        "Choose amount and payment method",
        "Confirm purchase"
      ]
    },
    {
      icon: <Smartphone className="h-6 w-6 text-primary" />,
      title: "Apple Pay",
      description: "Quick mobile payment",
      time: "Instant",
      fees: "Processing fees apply",
      available: true,
      steps: [
        "Go to your Wallet",
        "Click 'Deposit' button",
        "Select 'Apple Pay'",
        "Enter amount",
        "Confirm with Face ID/Touch ID"
      ]
    },
    {
      icon: <Smartphone className="h-6 w-6 text-muted-foreground" />,
      title: "Mobile Money",
      description: "Orange Money, MTN, Wave",
      time: "Coming Soon",
      fees: "TBD",
      available: false
    },
    {
      icon: <Building2 className="h-6 w-6 text-muted-foreground" />,
      title: "Bank Transfer",
      description: "Direct bank deposit",
      time: "Coming Soon",
      fees: "TBD",
      available: false
    }
  ];

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              How to Add Funds
            </h1>
            <p className="text-sm text-muted-foreground">
              Step-by-step guide to deposit funds to your account
            </p>
          </div>
        </div>

        {/* Available Methods */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Available Deposit Methods</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {depositMethods.map((method, index) => (
              <Card 
                key={index}
                className={method.available ? "border-primary/20" : "opacity-60"}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    {method.icon}
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        {method.title}
                        {!method.available && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing time:</span>
                      <span className="font-medium">{method.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fees:</span>
                      <span className="font-medium">{method.fees}</span>
                    </div>
                  </div>

                  {method.available && method.steps && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-sm font-medium mb-2">Steps:</p>
                      {method.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-2 text-sm">
                          <span className="text-primary font-semibold min-w-[20px]">{stepIndex + 1}.</span>
                          <span className="text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum deposit:</span>
              <span className="font-medium">$5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing time:</span>
              <span className="font-medium">2-5 minutes (Crypto)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit fees:</span>
              <span className="font-medium">Free (Crypto)</span>
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              * Processing times and fees may vary depending on the payment method and network conditions.
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        <Button 
          className="w-full h-12 text-base font-medium"
          onClick={() => navigate('/deposit')}
        >
          <Wallet className="mr-2 h-5 w-5" />
          Deposit Now
        </Button>
      </div>
    </Layout>
  );
}
