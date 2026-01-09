
import { useState, useEffect } from "react";
import { Check, X, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  isCompromised?: boolean;
  className?: string;
}

interface PasswordCriteria {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export const PasswordStrengthIndicator = ({ 
  password, 
  isCompromised = false, 
  className 
}: PasswordStrengthIndicatorProps) => {
  const [criteria, setCriteria] = useState<PasswordCriteria[]>([
    { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8, met: false },
    { id: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p), met: false },
    { id: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p), met: false },
    { id: 'number', label: 'One number', test: (p) => /\d/.test(p), met: false },
    { id: 'special', label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), met: false }
  ]);

  useEffect(() => {
    setCriteria(prev => prev.map(criterion => ({
      ...criterion,
      met: criterion.test(password)
    })));
  }, [password]);

  const metCount = criteria.filter(c => c.met).length;
  const strength = metCount <= 2 ? 'weak' : metCount <= 4 ? 'medium' : 'strong';

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Password compromise alert */}
      {isCompromised && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-red-400 font-medium">Compromised password</p>
            <p className="text-red-300 mt-1">
              This password has been found in data breaches. Choose a different password for your security.
            </p>
          </div>
        </div>
      )}

      {/* Strength indicator */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            Password security
          </span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            strength === 'weak' && "bg-red-500/20 text-red-400",
            strength === 'medium' && "bg-yellow-500/20 text-yellow-400",
            strength === 'strong' && "bg-green-500/20 text-green-400"
          )}>
            {strength === 'weak' && 'Weak'}
            {strength === 'medium' && 'Medium'}
            {strength === 'strong' && 'Strong'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              strength === 'weak' && "bg-red-500 w-1/3",
              strength === 'medium' && "bg-yellow-500 w-2/3",
              strength === 'strong' && "bg-green-500 w-full"
            )}
          />
        </div>

        {/* Criteria */}
        <div className="space-y-1">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="flex items-center gap-2 text-sm">
              {criterion.met ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <X className="h-3 w-3 text-slate-500" />
              )}
              <span className={cn(
                criterion.met ? "text-green-400" : "text-slate-400"
              )}>
                {criterion.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      {strength !== 'strong' && !isCompromised && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 <strong>Tip:</strong> Use a passphrase with uppercase, lowercase, numbers, and symbols for a strong and memorable password.
          </p>
        </div>
      )}
    </div>
  );
};
