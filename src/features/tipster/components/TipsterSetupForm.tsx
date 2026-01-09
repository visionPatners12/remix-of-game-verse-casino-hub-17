import React, { useState } from 'react';
import { Button, Input, Label, Textarea, Badge } from '@/ui';
import { Euro, Star, Loader2 } from 'lucide-react';
import { TipsterSetupFormData } from '../types';
import { useSports } from '@/hooks/useSports';

interface TipsterSetupFormProps {
  initialData?: Partial<TipsterSetupFormData>;
  onSubmit: (data: TipsterSetupFormData) => Promise<void>;
  isLoading?: boolean;
  isUpdate?: boolean;
}

const predefinedPrices = [
  { value: "9.99", label: "9.99€", description: "Beginner" },
  { value: "19.99", label: "19.99€", description: "Intermediate" },
  { value: "29.99", label: "29.99€", description: "Expert" },
  { value: "49.99", label: "49.99€", description: "Pro" }
];

const MAX_SPECIALTIES = 3;

export function TipsterSetupForm({ 
  initialData, 
  onSubmit, 
  isLoading = false, 
  isUpdate = false 
}: TipsterSetupFormProps) {
  const { data: sports, isLoading: sportsLoading } = useSports();
  
  const [formData, setFormData] = useState<TipsterSetupFormData>({
    monthly_price: initialData?.monthly_price || "",
    description: initialData?.description || "",
    specialties: initialData?.specialties || [], // Now stores UUIDs
    experience: initialData?.experience || ""
  });

  const [selectedPlan, setSelectedPlan] = useState<string>(
    predefinedPrices.find(p => p.value === initialData?.monthly_price)?.value || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const toggleSpecialty = (sportId: string) => {
    setFormData(prev => {
      const isSelected = prev.specialties.includes(sportId);
      if (isSelected) {
        // Remove
        return { ...prev, specialties: prev.specialties.filter(s => s !== sportId) };
      } else if (prev.specialties.length < MAX_SPECIALTIES) {
        // Add if under limit
        return { ...prev, specialties: [...prev.specialties, sportId] };
      }
      // At limit, don't add
      return prev;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Monthly price */}
      <div className="space-y-3">
        <Label>Monthly price of your premium predictions</Label>
        <div className="grid grid-cols-2 gap-2">
          {predefinedPrices.map((price) => (
            <Button
              key={price.value}
              type="button"
              variant={selectedPlan === price.value ? "default" : "outline"}
              className="h-auto p-3 flex flex-col items-center"
              onClick={() => {
                setSelectedPlan(price.value);
                setFormData(prev => ({ ...prev, monthly_price: price.value }));
              }}
            >
              <span className="font-bold">{price.label}</span>
              <span className="text-xs opacity-70">{price.description}</span>
            </Button>
          ))}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="custom_price">Or custom price</Label>
          <div className="relative">
            <Input
              id="custom_price"
              type="number"
              step="0.01"
              min="5"
              max="99.99"
              value={formData.monthly_price}
              onChange={(e) => {
                setSelectedPlan("");
                setFormData(prev => ({ ...prev, monthly_price: e.target.value }));
              }}
              placeholder="0.00"
              className="pr-8"
            />
            <Euro className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum price: 5€ - maximum: 99.99€
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Service description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your predictions, analysis method, specialties..."
          rows={4}
          maxLength={500}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Specialties - Now using sports from DB */}
      <div className="space-y-3">
        <Label>
          Your sports specialties 
          <span className="text-muted-foreground font-normal ml-1">
            ({formData.specialties.length}/{MAX_SPECIALTIES} max)
          </span>
        </Label>
        {sportsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading sports...</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sports?.map((sport) => {
              const isSelected = formData.specialties.includes(sport.id);
              const isDisabled = !isSelected && formData.specialties.length >= MAX_SPECIALTIES;
              
              return (
                <Badge
                  key={sport.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-opacity ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/80'
                  }`}
                  onClick={() => !isDisabled && toggleSpecialty(sport.id)}
                >
                  {sport.name}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <Label htmlFor="experience">Your sports betting experience</Label>
        <Textarea
          id="experience"
          value={formData.experience}
          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
          placeholder="Share your journey, successes, approach..."
          rows={3}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.experience.length}/300 characters
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !formData.monthly_price || !formData.description}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
      >
        <Star className="w-4 h-4 mr-2" />
        {isLoading 
          ? "Setting up..." 
          : isUpdate 
            ? "Update" 
            : "Set up my Premium profile"
        }
      </Button>
    </form>
  );
}
