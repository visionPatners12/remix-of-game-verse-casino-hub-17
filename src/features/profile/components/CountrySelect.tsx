import React from "react";
import ReactCountryFlag from "react-country-flag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountries } from "@/utils/countryUtils";
import { CountryOption } from "@/features/profile/types";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const CountrySelect = ({
  value,
  onChange,
  className,
  placeholder = "Sélectionnez un pays",
}: CountrySelectProps) => {
  const countries = getCountries();

  // Find the country object that matches the current value
  const selectedCountry = countries.find(
    (country) => country.value === value || country.label === value
  );

  return (
    <Select
      value={selectedCountry?.value || value}
      onValueChange={onChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedCountry ? (
            <div className="flex items-center">
              <ReactCountryFlag 
                countryCode={selectedCountry.value} 
                svg 
                className="mr-2 h-4 w-4 rounded-sm" 
                title={selectedCountry.label}
              />
              <span>{selectedCountry.label}</span>
            </div>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto">
        {countries.map((country) => (
          <SelectItem key={country.value} value={country.value}>
            <div className="flex items-center w-full">
              <ReactCountryFlag 
                countryCode={country.value} 
                svg 
                className="mr-3 h-4 w-4 rounded-sm flex-shrink-0" 
                title={country.label}
              />
              <span className="flex-1">{country.label}</span>
              <span className="ml-3 text-xs text-muted-foreground font-mono">
                {country.dialCode}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};