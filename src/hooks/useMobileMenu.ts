import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { useWalletTokensThirdWeb } from '@/features/wallet';

export function useMobileMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { receivedRequests } = useFollowRequests();
  const { tokens = [], totalValue = 0, isLoading: isBalanceLoading } = useWalletTokensThirdWeb();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  
  // Format balance with stablecoin breakdown
  const formattedBalance = useMemo(() => {
    const usdt = tokens.find(t => t.symbol?.toUpperCase() === 'USDT');
    const usdc = tokens.find(t => t.symbol?.toUpperCase() === 'USDC');
    
    const usdtValue = usdt?.quote || 0;
    const usdcValue = usdc?.quote || 0;
    
    const parts: string[] = [];
    if (usdtValue > 0) parts.push(`${usdtValue.toFixed(2)} USDT`);
    if (usdcValue > 0) parts.push(`${usdcValue.toFixed(2)} USDC`);
    
    const totalFormatted = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    if (parts.length === 0) return totalFormatted;
    if (parts.length === 1) return `${totalFormatted} (${parts[0]})`;
    return `${totalFormatted} (${parts.join(' + ')})`;
  }, [tokens, totalValue]);
  
  const usdtBalance = totalValue;
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleCopyUserId = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return {
    user,
    receivedRequests,
    openSections,
    toggleSection,
    handleLogout,
    handleCopyUserId,
    handleNavigation,
    navigate,
    usdtBalance,
    isBalanceLoading,
    formattedBalance
  };
}