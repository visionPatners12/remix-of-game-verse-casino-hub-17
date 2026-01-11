import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clipboard, QrCode, History, Check, AlertCircle, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAddress } from 'viem';
import { useTranslation } from 'react-i18next';
import { SearchedUser } from '../hooks/useUserWalletLookup';
import { RecentRecipient } from '../hooks/useRecentRecipients';

interface DestinationCardProps {
  mode: 'address' | 'user';
  address: string;
  onAddressChange: (address: string) => void;
  selectedUser?: SearchedUser | null;
  onClearUser?: () => void;
  recentRecipients?: RecentRecipient[];
  onSelectRecent?: (recipient: RecentRecipient) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  mode,
  address,
  onAddressChange,
  selectedUser,
  onClearUser,
  recentRecipients = [],
  onSelectRecent
}) => {
  const { t } = useTranslation('withdraw');
  const [showRecent, setShowRecent] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onAddressChange(text.trim());
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  const isValidAddress = address ? isAddress(address) : false;

  const getDisplayName = (user: SearchedUser) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.username || 'Unknown User';
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // User mode - show selected user card
  if (mode === 'user' && selectedUser) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          {t('destination.to', 'To')}
        </label>
        
        <div className="relative p-4 rounded-xl bg-primary/5 border-2 border-primary">
          <button
            onClick={onClearUser}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedUser.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedUser.first_name?.[0] || selectedUser.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{getDisplayName(selectedUser)}</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">
                  <Check className="h-3 w-3" />
                  <span className="text-xs font-medium">{t('destination.verified', 'Verified')}</span>
                </div>
              </div>
              
              {selectedUser.username && (
                <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
              )}
              
              {selectedUser.ens_subdomain && (
                <p className="text-sm text-primary font-medium">{selectedUser.ens_subdomain}</p>
              )}
              
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {selectedUser.wallet_address && formatAddress(selectedUser.wallet_address)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Address mode
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">
        {t('destination.address', 'Destination Address')}
      </label>
      
      <div className="relative">
        <Input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="0x..."
          className={cn(
            "h-14 font-mono text-sm pr-24 bg-muted/30",
            address && !isValidAddress && "border-destructive",
            address && isValidAddress && "border-green-500"
          )}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePaste}
            className="h-8 w-8"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Validation feedback */}
      {address && (
        <div className={cn(
          "flex items-center gap-1 text-sm",
          isValidAddress ? "text-green-600" : "text-destructive"
        )}>
          {isValidAddress ? (
            <>
              <Check className="h-4 w-4" />
              <span>{t('destination.validAddress', 'Valid address')}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>{t('destination.invalidAddress', 'Invalid address format')}</span>
            </>
          )}
        </div>
      )}

      {/* Recent recipients */}
      {recentRecipients.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowRecent(!showRecent)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <History className="h-4 w-4" />
            <span>{t('destination.recent', 'Recent recipients')}</span>
          </button>
          
          {showRecent && (
            <div className="space-y-1 p-2 rounded-lg bg-muted/30">
              {recentRecipients.slice(0, 5).map((recipient, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectRecent?.(recipient)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {recipient.type === 'user' && recipient.avatar_url ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={recipient.avatar_url} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">
                      {recipient.label || recipient.ens_subdomain || formatAddress(recipient.address)}
                    </p>
                    {recipient.username && (
                      <p className="text-xs text-muted-foreground">@{recipient.username}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DestinationCard;
