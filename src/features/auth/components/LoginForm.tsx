
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { Loader2, ArrowRight, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { LoginFormFields } from "../forms/LoginFormFields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logger } from '@/utils/logger';

export const LoginForm = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpHint, setShowSignUpHint] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      await signIn({ email: formData.email, password: formData.password });
      toast.success("Login successful!");
    } catch (error) {
      logger.error("Login error:", error);
      
      // Gestion spécifique des erreurs d'authentification
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage?.includes("Invalid login credentials") || errorMessage?.includes("Email ou mot de passe incorrect")) {
        setShowSignUpHint(true);
        toast.error("Incorrect email or password. Check your credentials or create an account.");
      } else if (errorMessage?.includes("Email not confirmed")) {
        toast.error("Your email has not been confirmed. Check your inbox.");
      } else if (errorMessage?.includes("Too many requests")) {
        toast.error("Too many login attempts. Please wait a few minutes.");
      } else if (errorMessage?.includes("User not found")) {
        setShowSignUpHint(true);
        toast.error("No account found with this email. Create an account or verify the email address.");
      } else {
        toast.error(errorMessage || "Connection error. Check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Réinitialiser l'hint si l'utilisateur modifie les champs
    if (showSignUpHint) {
      setShowSignUpHint(false);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Alerte d'aide pour l'inscription */}
      {showSignUpHint && (
        <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-200">
          <UserPlus className="h-4 w-4" />
          <AlertDescription>
            Don't have an account yet? Switch to the <strong>"Sign Up"</strong> tab to create your account quickly.
          </AlertDescription>
        </Alert>
      )}
      
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <LoginFormFields
          formData={formData}
          handleInputChange={handleInputChange}
          isLoading={isLoading}
        />
        
        <Button 
          type="submit" 
          className="w-full h-12 text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg disabled:opacity-50 rounded-lg" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
