
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useClipboard = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, successMessage?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied successfully",
        description: successMessage || "Text copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to copy text",
        variant: "destructive",
      });
      return false;
    }
  };

  return { copied, copyToClipboard };
};
