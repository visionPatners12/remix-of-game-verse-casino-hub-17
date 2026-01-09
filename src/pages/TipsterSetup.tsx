import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button, Input, Label, Textarea, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/ui';
import { ArrowLeft, Star, Euro, TrendingUp, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { tipsterQueries } from "@/services/database";
import { supabase, sportsDataClient } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { useTipsterSetup } from "@/features/tipster/hooks/useTipsterSetup";

interface Sport {
  id: string;
  name: string;
  slug: string;
}


export default function TipsterSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    monthly_price: "",
    description: "",
    specialties: [] as string[],
    experience: ""
  });

  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [availableSports, setAvailableSports] = useState<Sport[]>([]);

  const { submitForm, isLoading } = useTipsterSetup();

  // Fetch available sports and check existing profile
  useEffect(() => {
    const fetchSports = async () => {
      const { data } = await sportsDataClient
        .from('sport')
        .select('id, name, slug')
        .order('name');
      if (data) {
        setAvailableSports(data as any);
      }
    };

    const checkExistingProfile = async () => {
      if (user) {
        const { data } = await tipsterQueries.getTipsterProfile(user.id);
        if (data) {
          setHasExistingProfile(true);
          // Pre-fill form with existing data including specialties
          setFormData({
            monthly_price: data.monthly_price.toString(),
            description: data.description,
            specialties: (data as any).specialties || [],
            experience: data.experience || ""
          });
        }
      }
    };

    fetchSports();
    checkExistingProfile();
  }, [user]);

  const predefinedPrices = [
    { value: "9.99", label: "9.99 USDT", description: "Beginner" },
    { value: "19.99", label: "19.99 USDT", description: "Intermediate" },
    { value: "29.99", label: "29.99 USDT", description: "Expert" },
    { value: "49.99", label: "49.99 USDT", description: "Pro" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.monthly_price || !formData.description) {
      toast.error("Required fields", {
        description: "Please fill in all required fields."
      });
      return;
    }

    // Use the hook's submitForm which handles the correct order: contract first, then profile
    await submitForm({
      monthly_price: formData.monthly_price,
      description: formData.description,
      specialties: formData.specialties,
      experience: formData.experience
    }, hasExistingProfile);
  };

  const toggleSpecialty = (sportId: string) => {
    setFormData(prev => {
      const isSelected = prev.specialties.includes(sportId);
      const newSpecialties = isSelected
        ? prev.specialties.filter(s => s !== sportId)
        : prev.specialties.length < 3 
          ? [...prev.specialties, sportId]
          : prev.specialties; // Don't add if already at max

      return {
        ...prev,
        specialties: newSpecialties
      };
    });
  };

  return (
    <Layout hideNavigation>
      <div 
        className="w-full max-w-lg mx-auto"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/user-dashboard')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-semibold">Become a Premium Tipster</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Présentation */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingUp className="w-5 h-5" />
                Monetize your expertise
              </CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-400">
                Share your premium predictions and generate revenue with your followers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Access to your paying followers</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Euro className="w-4 h-4 text-amber-600" />
                <span>Recurring monthly revenue</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Secure payment management</span>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Monthly price */}
            <div className="space-y-3">
              <Label>Monthly price of your premium predictions (USDT)</Label>
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
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    USDT
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum price: 5 USDT - maximum: 99.99 USDT
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

            {/* Specialties */}
            <div className="space-y-3">
              <Label>Your sports specialties (maximum 3)</Label>
              <p className="text-xs text-muted-foreground">
                Select up to 3 sports you excel at
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSports.map((sport) => {
                  const isSelected = formData.specialties.includes(sport.id);
                  const canSelect = formData.specialties.length < 3 || isSelected;
                  
                  return (
                    <Badge
                      key={sport.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer ${
                        canSelect 
                          ? "hover:bg-primary/80" 
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => canSelect && toggleSpecialty(sport.id)}
                    >
                      {sport.name}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.specialties.length}/3 specialties selected
              </p>
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

            {/* Terms */}
            <Card className="border-muted-foreground/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Terms</CardTitle>
              </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Automatic monthly payments</p>
              <p>• Compliance with terms of use</p>
            </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/user-dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Star className="w-4 h-4 mr-2" />
                {isLoading 
                  ? "Creating..." 
                  : hasExistingProfile 
                    ? "Update" 
                    : "Set up my Premium profile"
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}