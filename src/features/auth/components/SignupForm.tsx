
import { ReferralCodeDisplay } from "./ReferralCodeDisplay";
import { SubmitButton } from "./SubmitButton";
import { SignupFormFields } from "../forms/SignupFormFields";
import { useSignupForm } from "../hooks/useSignupForm";
import { ErrorDisplay } from "./optimized/ErrorDisplay";

export const SignupForm = () => {
  const { 
    userData, 
    isLoading, 
    termsAccepted,
    privacyAccepted,
    validationErrors,
    authError,
    passwordError,
    handleChange, 
    handleCountryChange,
    handlePhoneChange,
    handleDateChange,
    handleSubmit,
    setTermsAccepted,
    setPrivacyAccepted
  } = useSignupForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ReferralCodeDisplay />
      
      <ErrorDisplay 
        validationErrors={validationErrors}
        authError={authError}
      />

      <SignupFormFields 
        userData={userData} 
        handleChange={handleChange}
        handleCountryChange={handleCountryChange}
        handlePhoneChange={handlePhoneChange}
        handleDateChange={handleDateChange}
        termsAccepted={termsAccepted}
        privacyAccepted={privacyAccepted}
        onTermsChange={setTermsAccepted}
        onPrivacyChange={setPrivacyAccepted}
        passwordError={passwordError}
        isLoading={isLoading}
      />
      
      <SubmitButton isLoading={isLoading} />
    </form>
  );
};
