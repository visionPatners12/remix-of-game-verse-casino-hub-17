
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type FormView = "login" | "forgot";

export const EnhancedLoginForm = () => {
  const [currentView, setCurrentView] = useState<FormView>("login");

  if (currentView === "forgot") {
    return (
      <div className="space-y-3 sm:space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView("login")}
          className="mb-3 sm:mb-4 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Back to login
        </Button>
        <ForgotPasswordForm />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LoginForm />
      <div className="text-center">
        <Button
          variant="link"
          size="sm"
          onClick={() => setCurrentView("forgot")}
          className="text-xs sm:text-sm text-slate-400 hover:text-purple-300 p-0 h-auto"
        >
          Forgot password?
        </Button>
      </div>
    </div>
  );
};
