
import { FormField, PhoneField, DateOfBirthField } from "../fields";
import { TermsAcceptance } from "../components/TermsAcceptance";
import { PasswordStrengthIndicator } from "../components/PasswordStrengthIndicator";
import { User, Mail, Lock } from "lucide-react";

interface SignupFormFieldsProps {
  userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    dateOfBirth?: Date;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCountryChange: (value: string) => void;
  handlePhoneChange: (phone: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  onTermsChange: (checked: boolean) => void;
  onPrivacyChange: (checked: boolean) => void;
  isLoading?: boolean;
  passwordError?: {
    isWeak: boolean;
    isCompromised: boolean;
    reasons: string[];
  } | null;
}

export const SignupFormFields = ({ 
  userData, 
  handleChange, 
  handleCountryChange,
  handlePhoneChange,
  handleDateChange,
  termsAccepted,
  privacyAccepted,
  onTermsChange,
  onPrivacyChange,
  isLoading = false,
  passwordError = null
}: SignupFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        id="username"
        name="username"
        type="text"
        label="Username"
        placeholder="Your username"
        value={userData.username}
        onChange={handleChange}
        required
        disabled={isLoading}
        icon={User}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="firstName"
          name="firstName"
          type="text"
          label="First name"
          placeholder="Your first name"
          value={userData.firstName}
          onChange={handleChange}
          required
          disabled={isLoading}
          icon={User}
        />
        
        <FormField
          id="lastName"
          name="lastName"
          type="text"
          label="Last name"
          placeholder="Your last name"
          value={userData.lastName}
          onChange={handleChange}
          required
          disabled={isLoading}
          icon={User}
        />
      </div>
      
      <FormField
        id="email"
        name="email"
        type="email"
        label="Email address"
        placeholder="your.email@example.com"
        value={userData.email}
        onChange={handleChange}
        required
        disabled={isLoading}
        icon={Mail}
      />
      
      <div className="space-y-2">
        <FormField
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={userData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
          icon={Lock}
        />
        
        {/* Indicateur de sécurité du mot de passe */}
        <PasswordStrengthIndicator
          password={userData.password}
          isCompromised={passwordError?.isCompromised || false}
          className="mt-2"
        />
      </div>
      
      <PhoneField
        phone={userData.phone}
        country={userData.country}
        onPhoneChange={handlePhoneChange}
        onCountryChange={handleCountryChange}
        required
        disabled={isLoading}
      />

      <DateOfBirthField
        dateOfBirth={userData.dateOfBirth}
        onDateChange={handleDateChange}
        disabled={isLoading}
      />

      <TermsAcceptance
        termsAccepted={termsAccepted}
        privacyAccepted={privacyAccepted}
        onTermsChange={onTermsChange}
        onPrivacyChange={onPrivacyChange}
      />
    </div>
  );
};
