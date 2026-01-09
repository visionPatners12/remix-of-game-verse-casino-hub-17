
import { LogoLoading } from "./logo-loading";

interface LoadingFallbackProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

function LoadingFallback({ text = "Chargement...", size = "lg" }: LoadingFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <LogoLoading text={text} size={size} />
        <div className="mt-4 text-white/60 text-sm">
          Initialisation de l'application...
        </div>
      </div>
    </div>
  );
}

export function SectionLoadingFallback({ text = "Chargement...", size = "md" }: LoadingFallbackProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <LogoLoading text={text} size={size} />
    </div>
  );
}
