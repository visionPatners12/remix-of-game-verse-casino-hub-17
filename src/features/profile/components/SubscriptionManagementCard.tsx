import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, AlertTriangle, ExternalLink, Crown, Calendar, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  creatorName: string;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'cancelled' | 'expired';
}

interface SubscriptionManagementCardProps {
  subscriptions?: Subscription[];
}

export function SubscriptionManagementCard({ subscriptions = [] }: SubscriptionManagementCardProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUnsubscribe = async (subscriptionId: string) => {
    setCancellingId(subscriptionId);
    
    try {
      // Here you would make an API call to cancel the subscription
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Abonnement annulé",
        description: "Votre abonnement a été annulé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'abonnement. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleManageSubscription = () => {
    // Redirect to customer portal
    window.open('https://billing.stripe.com/p/login/test_customer_portal', '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-950/10 dark:to-yellow-950/5 border-amber-200/30 dark:border-amber-800/20">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Crown className="w-12 h-12 mx-auto text-amber-500/60" />
          </div>
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Aucun abonnement Premium
          </h3>
          <p className="text-sm text-amber-600 dark:text-amber-300/80 mb-4">
            Découvrez des tipsters experts et accédez à leurs pronostics exclusifs.
          </p>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Découvrir les Tipsters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id} className="border-amber-200/30 dark:border-amber-800/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{subscription.creatorName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={subscription.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {subscription.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {subscription.price}€/{subscription.currency === 'EUR' ? 'mois' : 'month'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={() => handleManageSubscription()}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Expire le {formatDate(subscription.endDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                <span>Prochaine facturation</span>
              </div>
            </div>
            
            {subscription.status === 'active' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={cancellingId === subscription.id}
                  >
                    <AlertTriangle className="w-3 h-3 mr-2" />
                    {cancellingId === subscription.id ? 'Annulation...' : 'Annuler l\'abonnement'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Annuler l'abonnement</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir annuler votre abonnement à {subscription.creatorName} ? 
                      Vous garderez l'accès jusqu'au {formatDate(subscription.endDate)}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Garder l'abonnement</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleUnsubscribe(subscription.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Oui, annuler
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Global management button */}
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleManageSubscription}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Gérer tous mes abonnements
      </Button>
    </div>
  );
}