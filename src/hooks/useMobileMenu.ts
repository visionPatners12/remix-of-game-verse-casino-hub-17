import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { useWalletTokensThirdWeb } from '@/features/wallet';

export function useMobileMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { receivedRequests } = useFollowRequests();
  const { tokens = [], totalValue = 0, isLoading: isBalanceLoading } = useWalletTokensThirdWeb();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  
  // Total balance formatted
  const totalBalance = useMemo(() => {
    return `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [totalValue]);

  // Get USDC token data
  const usdcToken = useMemo(() => {
    return tokens.find(t => t.symbol?.toUpperCase() === 'USDC') || null;
  }, [tokens]);
  
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
    // For deposit/withdrawal, pass current path as origin for contextual back navigation
    if (path === '/deposit' || path === '/withdrawal') {
      navigate(path, { state: { from: location.pathname } });
    } else {
      navigate(path);
    }
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
    isBalanceLoading,
    totalBalance,
    usdcToken
  };
}