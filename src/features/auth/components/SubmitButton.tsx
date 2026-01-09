
import { UnifiedButton } from '@/ui';

interface SubmitButtonProps {
  isLoading: boolean;
}

export const SubmitButton = ({ isLoading }: SubmitButtonProps) => {
  return (
    <UnifiedButton
      type="submit"
      buttonType="submit"
      isLoading={isLoading}
      label="Create my account"
      loadingText="Creating account..."
      className="w-full"
    />
  );
};
