
import { useState } from "react";
import { FormField } from "../fields";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginFormFieldsProps {
  formData: {
    email: string;
    password: string;
  };
  handleInputChange: (field: string, value: string) => void;
  isLoading: boolean;
}

export const LoginFormFields = ({ 
  formData, 
  handleInputChange, 
  isLoading 
}: LoginFormFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-5">
      <FormField
        id="email"
        name="email"
        type="email"
        label="Email or Username"
        placeholder="your.email@example.com"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        required
        disabled={isLoading}
        icon={Mail}
      />
      
      <FormField
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        placeholder="••••••••"
        value={formData.password}
        onChange={(e) => handleInputChange("password", e.target.value)}
        required
        disabled={isLoading}
        icon={Lock}
        rightIcon={showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
        onRightIconClick={() => setShowPassword(!showPassword)}
      />
    </div>
  );
};
