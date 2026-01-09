import * as React from "react";
import { useState, useEffect } from "react";
import { Input, Label, Button } from '@/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountrySelect } from "@/features/profile/components/CountrySelect";
import { getCountryByCode } from "@/utils/countryUtils";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { MIN_AGE_REQUIREMENT, getMaxBirthYear } from "@/utils/ageUtils";

// FormField component
interface FormFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  className?: string;
}

export const FormField = ({
  id,
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  icon: Icon,
  rightIcon,
  onRightIconClick,
  className = ""
}: FormFieldProps) => {
  const hasRightIcon = rightIcon && onRightIconClick;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        )}
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`${Icon ? 'pl-10' : ''} ${hasRightIcon ? 'pr-12' : ''} h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-lg ${className}`}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        />
        {hasRightIcon && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center hover:bg-slate-600 rounded-md transition-colors"
            onClick={onRightIconClick}
            disabled={disabled}
          >
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
};

// PhoneField component
interface PhoneFieldProps {
  phone: string;
  country: string;
  onPhoneChange: (phone: string) => void;
  onCountryChange: (country: string) => void;
  required?: boolean;
  disabled?: boolean;
  showVerifyButton?: boolean;
  returnTo?: string;
  isVerified?: boolean;
}

export const PhoneField = ({ 
  phone, 
  country, 
  onPhoneChange, 
  onCountryChange,
  required = false,
  disabled = false,
  showVerifyButton = false,
  returnTo,
  isVerified = false
}: PhoneFieldProps) => {
  const [dialCode, setDialCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const countryData = getCountryByCode(country);
    if (countryData) {
      setDialCode(countryData.dialCode);
      // Ajouter automatiquement l'indicatif uniquement si le téléphone est vide
      if (!phone || phone.trim().length === 0) {
        onPhoneChange(`${countryData.dialCode} `);
      }
    }
  }, [country]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onPhoneChange(value);
  };

  const handleVerifyPhone = () => {
    if (phone && phone.trim().length > 0) {
      navigate('/sms-verification', { 
        state: { 
          phoneNumber: phone,
          returnTo: returnTo || '/settings'
        } 
      });
    }
  };

  // Si le numéro est vérifié et non vide, afficher en lecture seule
  if (isVerified && phone && phone.trim().length > 0) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-medium text-foreground">
            Phone number
            <span className="ml-2 text-sm text-green-600 font-medium">✓ Vérifié</span>
          </Label>
          <div className="min-h-[48px] flex items-center gap-2 px-4 rounded-xl border border-green-500/50 bg-green-50/10">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{phone}</span>
          </div>
        </div>
      </div>
    );
  }

  // Sinon, afficher le formulaire modifiable
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="country" className="text-base font-medium text-foreground">
          Pays
        </Label>
        <CountrySelect
          value={country}
          onChange={onCountryChange}
          className="min-h-[48px] text-base px-4 rounded-xl border-border/50 focus:border-primary bg-background/50"
          placeholder="Sélectionnez votre pays"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base font-medium text-foreground">
          Phone number
          {isVerified && (
            <span className="ml-2 text-sm text-green-600 font-medium">✓ Vérifié</span>
          )}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="123 456 789"
              className={`pl-12 min-h-[48px] text-base pr-4 rounded-xl border-border/50 focus:border-primary bg-background/50 placeholder:text-muted-foreground ${
                isVerified ? 'border-green-500/50 bg-green-50/10' : ''
              }`}
              value={phone}
              onChange={handlePhoneChange}
              required={required}
              disabled={disabled}
            />
          </div>
          {showVerifyButton && !isVerified && (
            <Button
              type="button"
              variant="outline"
              className="min-h-[48px] px-4 rounded-xl"
              onClick={handleVerifyPhone}
              disabled={!phone || phone.trim().length === 0}
            >
              Vérifier
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// DateOfBirthField component
interface DateOfBirthFieldProps {
  dateOfBirth?: Date;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

const MONTHS = [
  { value: 0, label: "Janvier" },
  { value: 1, label: "Février" },
  { value: 2, label: "Mars" },
  { value: 3, label: "Avril" },
  { value: 4, label: "Mai" },
  { value: 5, label: "Juin" },
  { value: 6, label: "Juillet" },
  { value: 7, label: "Août" },
  { value: 8, label: "Septembre" },
  { value: 9, label: "Octobre" },
  { value: 10, label: "Novembre" },
  { value: 11, label: "Décembre" }
];

const MIN_YEAR = 1900;

export const DateOfBirthField = ({ 
  dateOfBirth, 
  onDateChange,
  disabled = false 
}: DateOfBirthFieldProps) => {
  const maxYear = getMaxBirthYear(MIN_AGE_REQUIREMENT);
  
  const [selectedDay, setSelectedDay] = React.useState<number>(
    dateOfBirth?.getDate() || 1
  );
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    dateOfBirth?.getMonth() || 0
  );
  const [selectedYear, setSelectedYear] = React.useState<number>(
    dateOfBirth?.getFullYear() || 2000
  );

  const years = Array.from({ length: maxYear - MIN_YEAR + 1 }, (_, i) => maxYear - i);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

  const updateDate = (day: number, month: number, year: number) => {
    const newDate = new Date(year, month, day);
    onDateChange(newDate);
  };

  const handleDayChange = (day: string) => {
    const dayNum = parseInt(day);
    setSelectedDay(dayNum);
    updateDate(dayNum, selectedMonth, selectedYear);
  };

  const handleMonthChange = (month: string) => {
    const monthNum = parseInt(month);
    setSelectedMonth(monthNum);
    const daysInNewMonth = getDaysInMonth(monthNum, selectedYear);
    const newDay = selectedDay > daysInNewMonth ? daysInNewMonth : selectedDay;
    setSelectedDay(newDay);
    updateDate(newDay, monthNum, selectedYear);
  };

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
    const daysInNewMonth = getDaysInMonth(selectedMonth, yearNum);
    const newDay = selectedDay > daysInNewMonth ? daysInNewMonth : selectedDay;
    setSelectedDay(newDay);
    updateDate(newDay, selectedMonth, yearNum);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="dateOfBirth" className="text-base font-semibold">
        Date de naissance
      </Label>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Select value={selectedDay.toString()} onValueChange={handleDayChange} disabled={disabled}>
            <SelectTrigger className="min-h-[48px] text-base px-4 rounded-xl border-border/50 focus:border-primary bg-background/50">
              <SelectValue placeholder="Jour" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border max-h-60">
              {days.map((day) => (
                <SelectItem key={day} value={day.toString()} className="text-foreground hover:bg-muted">
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={selectedMonth.toString()} onValueChange={handleMonthChange} disabled={disabled}>
            <SelectTrigger className="min-h-[48px] text-base px-4 rounded-xl border-border/50 focus:border-primary bg-background/50">
              <SelectValue placeholder="Mois" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border max-h-60">
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()} className="text-foreground hover:bg-muted">
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange} disabled={disabled}>
            <SelectTrigger className="min-h-[48px] text-base px-4 rounded-xl border-border/50 focus:border-primary bg-background/50">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border max-h-60">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-foreground hover:bg-muted">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Vous devez avoir au moins {MIN_AGE_REQUIREMENT} ans pour vous inscrire
      </p>
    </div>
  );
};