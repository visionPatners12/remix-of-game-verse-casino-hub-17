
import React from "react";
import ReactCountryFlag from "react-country-flag";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeagueCountryCode, COUNTRY_FLAG_MAPPING } from "@/utils/countryMapping";

interface CountryFlagProps {
  countryName: string;
  countrySlug: string;
  className?: string;
  size?: number;
}

export function CountryFlag({ countryName, countrySlug, className, size = 16 }: CountryFlagProps) {
  // Obtenir le code pays avec la logique améliorée
  let countryCode = getLeagueCountryCode(countryName, countrySlug);
  
  // Si on trouve un code pays, vérifier qu'il est mappé pour les drapeaux
  if (countryCode && COUNTRY_FLAG_MAPPING[countryCode]) {
    const flagCode = COUNTRY_FLAG_MAPPING[countryCode];
    
    return (
      <div 
        className={cn("inline-flex items-center justify-center", className)} 
        title={countryName || countrySlug}
      >
        <ReactCountryFlag 
          countryCode={flagCode}
          svg
          style={{
            width: `${size}px`,
            height: `${size * 0.75}px`, // Ratio 4:3 pour les drapeaux
          }}
        />
      </div>
    );
  }
  
  // Fallback : utiliser une icône générique
  return (
    <div 
      className={cn("inline-flex items-center justify-center", className)} 
      title={countryName || countrySlug || "Pays non identifié"}
    >
      <Globe 
        className="text-muted-foreground" 
        size={size} 
      />
    </div>
  );
}
