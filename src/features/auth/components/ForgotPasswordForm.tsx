
import { useState } from "react";
import { Button, Input, Label } from '@/ui';
import { Mail, Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setEmailSent(true);
        toast.success("Reset instructions sent!");
      }
    } catch (error) {
      toast.error("Error sending instructions");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Instructions sent!</h3>
          <p className="text-muted-foreground text-sm">
            We have sent reset instructions to <strong>{email}</strong>
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Also check your spam folder
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setEmailSent(false);
            setEmail("");
          }}
        >
          Try another address
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <KeyRound className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold">Forgot password?</h3>
        <p className="text-muted-foreground text-sm">
          Enter your email to receive reset instructions
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-email"
            type="email"
            placeholder="your.email@example.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <KeyRound className="mr-2 h-4 w-4" />
            Send instructions
          </>
        )}
      </Button>
    </form>
  );
};
