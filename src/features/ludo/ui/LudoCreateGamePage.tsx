import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Eye, EyeOff, Play, DollarSign, Gamepad2, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useCasinoCommission } from '@/hooks/useCasinoCommission';
const LudoCreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [betAmount, setBetAmount] = useState('1');
  const [isPublic, setIsPublic] = useState(true);
  const [isFreeGame, setIsFreeGame] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGame = async () => {
    if (!user) {
      toast.error('You must be logged in to create a game');
      return;
    }

    const bet = isFreeGame ? 0 : parseFloat(betAmount);
    if (!isFreeGame && (isNaN(bet) || bet < 0.01)) {
      toast.error('Minimum bet is 0.01 USDT');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('ludo-game', {
        body: { 
          action: 'create',
          gameName: null,
          maxPlayers: parseInt(maxPlayers),
          betAmount: bet,
          isPrivate: !isPublic,
        }
      });

      if (invokeError) {
        console.error('Error creating game:', invokeError);
        toast.error('Error creating the game');
        return;
      }

      if (!data?.ok) {
        console.error('Backend error:', data?.error);
        // Handle specific error: player already in active game
        if (data?.error?.includes('ALREADY_IN_GAME')) {
          toast.error('You are already in an active game. Finish or leave it first.');
          navigate('/games/ludo');
          return;
        }
        toast.error(data?.error || 'Error creating the game');
        return;
      }

      toast.success(`Game created! Code: ${data.game.room_code}`);
      navigate(`/games/ludo/play/${data.game.id}`);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/games/ludo');
  };

  const prizePool = isFreeGame ? 0 : parseFloat(betAmount || '0') * parseInt(maxPlayers);

  return (
    <Layout hideNavigation>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center gap-3 px-4 h-14">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              className="rounded-full hover:bg-muted/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              New Game
            </h1>
          </div>
        </div>

        <div className="p-4 space-y-5 max-w-md mx-auto">
          {/* Max Players */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Players</Label>
            <Select value={maxPlayers} onValueChange={setMaxPlayers}>
              <SelectTrigger className="h-12 bg-muted/30 border-0 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 players</SelectItem>
                <SelectItem value="3">3 players</SelectItem>
                <SelectItem value="4">4 players</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Free Game Toggle */}
          <div className="bg-muted/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFreeGame ? 'bg-emerald-500/20' : 'bg-muted/50'}`}>
                  <Gamepad2 className={`w-5 h-5 ${isFreeGame ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <div className="font-medium">Free Game</div>
                  <div className="text-xs text-muted-foreground">
                    Play for fun, no deposit
                  </div>
                </div>
              </div>
              <Switch
                checked={isFreeGame}
                onCheckedChange={setIsFreeGame}
              />
            </div>
          </div>

          {/* Bet Amount - Only show if not free game */}
          {!isFreeGame && (
            <div className="space-y-2">
              <Label htmlFor="betAmount" className="text-sm font-medium text-muted-foreground">Bet per player</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="betAmount"
                  type="number"
                  placeholder="0.01"
                  value={betAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
                    setBetAmount(cleanValue);
                  }}
                  className="h-12 pl-12 text-base bg-muted/30 border-0 rounded-xl"
                  min="0.01"
                  step="0.01"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  USDT
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Minimum: 0.01 USDT</p>
            </div>
          )}

          {/* Public/Private Toggle */}
          <div className="bg-muted/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPublic ? 'bg-primary/20' : 'bg-muted/50'}`}>
                  {isPublic ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <div className="font-medium">{isPublic ? 'Public' : 'Private'}</div>
                  <div className="text-xs text-muted-foreground">
                    {isPublic ? 'Anyone can join' : 'Invite only'}
                  </div>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          {/* Game Summary */}
          <div className={`rounded-xl p-4 ${isFreeGame ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5' : 'bg-gradient-to-br from-primary/10 to-primary/5'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isFreeGame ? 'bg-emerald-500/20' : 'bg-primary/20'}`}>
                <Hash className={`w-6 h-6 ${isFreeGame ? 'text-emerald-500' : 'text-primary'}`} />
              </div>
              <div>
                <h3 className="font-semibold">Ludo Game</h3>
                <p className="text-xs text-muted-foreground">Room code will be generated</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Players</span>
                <span className="font-medium">{maxPlayers} max</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Mode</span>
                <span className={`font-medium ${isFreeGame ? 'text-emerald-500' : ''}`}>
                  {isFreeGame ? 'Free' : `${parseFloat(betAmount || '0').toFixed(2)} USDT/player`}
                </span>
              </div>
              
              {!isFreeGame && (
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium">Prize Pool</span>
                  <span className="font-bold text-primary text-base">
                    {prizePool.toFixed(2)} USDT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Create Button */}
          <div className="pt-2">
            <Button 
              onClick={handleCreateGame}
              disabled={isLoading}
              className="w-full h-14 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
                  Creating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-3" />
                  Create Game
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LudoCreateGamePage;
