import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileCard } from '@/components/mobile/ProfileCard';
import { BalanceCard } from '@/components/mobile/BalanceCard';
import { QuickActionsGrid } from '@/components/mobile/QuickActionsGrid';
import { CollapsibleMenuSection } from '@/components/mobile/CollapsibleMenuSection';
import { MobileMenuHeader } from '@/components/mobile/MobileMenuHeader';
import { MobileMenuActions } from '@/components/mobile/MobileMenuActions';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import { Headphones, HelpCircle, Scale, FileText, Heart, Users, Globe } from 'lucide-react';

export default function SimpleMobileMenuPage() {
  const { t, i18n } = useTranslation('common');
  const {
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
  } = useMobileMenu();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  // Mock data - in real app, this would come from hooks
  const totalUnreadMessages = 3;

  // Menu items configuration
  const menuSections = {
    support: [
      { icon: Headphones, label: "Client Support", action: () => handleNavigation('/support') },
      { icon: HelpCircle, label: "FAQ" }
    ],
    legal: [
      { icon: Scale, label: "Legal Terms", action: () => handleNavigation('/legal') },
      { icon: FileText, label: "Privacy Policy", action: () => handleNavigation('/privacy') },
      { icon: Heart, label: "Responsible Gaming", action: () => handleNavigation('/responsible-gaming') }
    ],
    aboutUs: [
      { icon: Users, label: "About Us", action: () => handleNavigation('/about-us') }
    ]
  };

  const handleSpecialNavigation = (path: string) => {
    if (path === 'logout') {
      handleLogout();
    } else {
      handleNavigation(path);
    }
  };

  return (
    <Layout hideNavigation>
      <div className="min-h-screen bg-background">
        <MobileMenuHeader onBack={() => navigate(-1)} />

        <div className="pb-6">
          <ProfileCard user={user} onCopyUserId={handleCopyUserId} />
        <Separator />
        
        <BalanceCard 
          totalBalance={totalBalance}
          usdcBalance={usdcToken?.formattedBalance || null}
          usdcChainId={usdcToken?.chainId || null}
          isLoading={isBalanceLoading}
          onDeposit={() => handleNavigation('/mobile-deposit')}
          onWithdraw={() => handleNavigation('/withdrawal')}
          onBalanceClick={() => handleNavigation('/wallet')}
        />
        <Separator />

        <QuickActionsGrid />
        <Separator />

        <MobileMenuActions
          receivedRequestsCount={receivedRequests.length}
          totalUnreadMessages={totalUnreadMessages}
          onNavigate={handleSpecialNavigation}
          showLogout={false}
        />
        <Separator />

        {/* Collapsible Sections */}
        {Object.entries(menuSections).map(([key, items], index) => (
          <React.Fragment key={key}>
            <CollapsibleMenuSection
              title={key === 'aboutUs' ? 'About Us' : key.charAt(0).toUpperCase() + key.slice(1)}
              items={items}
              isOpen={openSections[key]}
              onToggle={() => toggleSection(key)}
            />
            {index < Object.entries(menuSections).length - 1 && <Separator />}
          </React.Fragment>
        ))}
        <Separator />

          {/* Language Selector */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>{t('settings.language')}</span>
              </div>
              <Select value={i18n.language.split('-')[0]} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('settings.english')}</SelectItem>
                  <SelectItem value="fr">{t('settings.french')}</SelectItem>
                  <SelectItem value="es">{t('settings.spanish')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />

          {/* Logout Button */}
          <div className="px-4 py-4">
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => handleSpecialNavigation('logout')}
            >
              {t('buttons.logout', 'Logout')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}