import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
import enCommon from '@/locales/en/common.json';
import enNavigation from '@/locales/en/navigation.json';
import enProfile from '@/locales/en/profile.json';
import enAuth from '@/locales/en/auth.json';
import enTipster from '@/locales/en/tipster.json';
import enBets from '@/locales/en/bets.json';
import enDeposit from '@/locales/en/deposit.json';
import enFeed from '@/locales/en/feed.json';
import enPages from '@/locales/en/pages.json';
import enGames from '@/locales/en/games.json';
import enWallet from '@/locales/en/wallet.json';
import enWithdraw from '@/locales/en/withdraw.json';
import enNft from '@/locales/en/nft.json';
import enStreaming from '@/locales/en/streaming.json';
import enSupport from '@/locales/en/support.json';
import enNotifications from '@/locales/en/notifications.json';
import enSearch from '@/locales/en/search.json';
import enLanding from '@/locales/en/landing.json';
import enPolymarket from '@/locales/en/polymarket.json';
import enSecurity from '@/locales/en/security.json';

// French translations
import frCommon from '@/locales/fr/common.json';
import frNavigation from '@/locales/fr/navigation.json';
import frProfile from '@/locales/fr/profile.json';
import frAuth from '@/locales/fr/auth.json';
import frTipster from '@/locales/fr/tipster.json';
import frBets from '@/locales/fr/bets.json';
import frDeposit from '@/locales/fr/deposit.json';
import frFeed from '@/locales/fr/feed.json';
import frPages from '@/locales/fr/pages.json';
import frGames from '@/locales/fr/games.json';
import frWallet from '@/locales/fr/wallet.json';
import frWithdraw from '@/locales/fr/withdraw.json';
import frNft from '@/locales/fr/nft.json';
import frStreaming from '@/locales/fr/streaming.json';
import frSupport from '@/locales/fr/support.json';
import frNotifications from '@/locales/fr/notifications.json';
import frSearch from '@/locales/fr/search.json';
import frLanding from '@/locales/fr/landing.json';
import frPolymarket from '@/locales/fr/polymarket.json';
import frSecurity from '@/locales/fr/security.json';

// Spanish translations
import esCommon from '@/locales/es/common.json';
import esNavigation from '@/locales/es/navigation.json';
import esProfile from '@/locales/es/profile.json';
import esAuth from '@/locales/es/auth.json';
import esTipster from '@/locales/es/tipster.json';
import esBets from '@/locales/es/bets.json';
import esDeposit from '@/locales/es/deposit.json';
import esFeed from '@/locales/es/feed.json';
import esPages from '@/locales/es/pages.json';
import esGames from '@/locales/es/games.json';
import esWallet from '@/locales/es/wallet.json';
import esWithdraw from '@/locales/es/withdraw.json';
import esNft from '@/locales/es/nft.json';
import esStreaming from '@/locales/es/streaming.json';
import esSupport from '@/locales/es/support.json';
import esNotifications from '@/locales/es/notifications.json';
import esSearch from '@/locales/es/search.json';
import esLanding from '@/locales/es/landing.json';
import esPolymarket from '@/locales/es/polymarket.json';
import esSecurity from '@/locales/es/security.json';

// Hindi translations
import hiCommon from '@/locales/hi/common.json';
import hiNavigation from '@/locales/hi/navigation.json';
import hiGames from '@/locales/hi/games.json';
import hiWallet from '@/locales/hi/wallet.json';
import hiNft from '@/locales/hi/nft.json';
import hiSecurity from '@/locales/hi/security.json';

// Portuguese translations
import ptCommon from '@/locales/pt/common.json';
import ptNavigation from '@/locales/pt/navigation.json';
import ptGames from '@/locales/pt/games.json';
import ptWallet from '@/locales/pt/wallet.json';
import ptNft from '@/locales/pt/nft.json';
import ptSecurity from '@/locales/pt/security.json';

// Arabic translations
import arCommon from '@/locales/ar/common.json';
import arNavigation from '@/locales/ar/navigation.json';
import arGames from '@/locales/ar/games.json';
import arWallet from '@/locales/ar/wallet.json';
import arNft from '@/locales/ar/nft.json';
import arSecurity from '@/locales/ar/security.json';

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    profile: enProfile,
    auth: enAuth,
    tipster: enTipster,
    bets: enBets,
    deposit: enDeposit,
    feed: enFeed,
    pages: enPages,
    games: enGames,
    wallet: enWallet,
    withdraw: enWithdraw,
    nft: enNft,
    streaming: enStreaming,
    support: enSupport,
    notifications: enNotifications,
    search: enSearch,
    landing: enLanding,
    polymarket: enPolymarket,
    security: enSecurity,
  },
  fr: {
    common: frCommon,
    navigation: frNavigation,
    profile: frProfile,
    auth: frAuth,
    tipster: frTipster,
    bets: frBets,
    deposit: frDeposit,
    feed: frFeed,
    pages: frPages,
    games: frGames,
    wallet: frWallet,
    withdraw: frWithdraw,
    nft: frNft,
    streaming: frStreaming,
    support: frSupport,
    notifications: frNotifications,
    search: frSearch,
    landing: frLanding,
    polymarket: frPolymarket,
    security: frSecurity,
  },
  es: {
    common: esCommon,
    navigation: esNavigation,
    profile: esProfile,
    auth: esAuth,
    tipster: esTipster,
    bets: esBets,
    deposit: esDeposit,
    feed: esFeed,
    pages: esPages,
    games: esGames,
    wallet: esWallet,
    withdraw: esWithdraw,
    nft: esNft,
    streaming: esStreaming,
    support: esSupport,
    notifications: esNotifications,
    search: esSearch,
    landing: esLanding,
    polymarket: esPolymarket,
    security: esSecurity,
  },
  hi: {
    common: hiCommon,
    navigation: hiNavigation,
    games: hiGames,
    wallet: hiWallet,
    nft: hiNft,
    security: hiSecurity,
  },
  pt: {
    common: ptCommon,
    navigation: ptNavigation,
    games: ptGames,
    wallet: ptWallet,
    nft: ptNft,
    security: ptSecurity,
  },
  ar: {
    common: arCommon,
    navigation: arNavigation,
    games: arGames,
    wallet: arWallet,
    nft: arNft,
    security: arSecurity,
  },
};

// RTL languages
const RTL_LANGUAGES = ['ar'];

// Update document direction based on language
const updateDirection = (language: string) => {
  const dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'es', 'hi', 'pt', 'ar'],
    load: 'languageOnly', // 'fr-FR' → 'fr'
    defaultNS: 'common',
    ns: ['common', 'navigation', 'profile', 'auth', 'tipster', 'bets', 'deposit', 'feed', 'pages', 'games', 'wallet', 'withdraw', 'nft', 'streaming', 'support', 'notifications', 'search', 'landing', 'polymarket', 'security'],
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

// Set initial direction
updateDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', updateDirection);

export default i18n;
