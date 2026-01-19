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
import enReferral from '@/locales/en/referral.json';

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
import frReferral from '@/locales/fr/referral.json';

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
import esReferral from '@/locales/es/referral.json';

// Hindi translations
import hiCommon from '@/locales/hi/common.json';
import hiNavigation from '@/locales/hi/navigation.json';
import hiGames from '@/locales/hi/games.json';
import hiWallet from '@/locales/hi/wallet.json';
import hiNft from '@/locales/hi/nft.json';
import hiSecurity from '@/locales/hi/security.json';
import hiReferral from '@/locales/hi/referral.json';
import hiAuth from '@/locales/hi/auth.json';
import hiProfile from '@/locales/hi/profile.json';
import hiBets from '@/locales/hi/bets.json';
import hiFeed from '@/locales/hi/feed.json';
import hiTipster from '@/locales/hi/tipster.json';
import hiDeposit from '@/locales/hi/deposit.json';
import hiWithdraw from '@/locales/hi/withdraw.json';
import hiPages from '@/locales/hi/pages.json';
import hiLanding from '@/locales/hi/landing.json';
import hiPolymarket from '@/locales/hi/polymarket.json';
import hiNotifications from '@/locales/hi/notifications.json';
import hiSearch from '@/locales/hi/search.json';
import hiStreaming from '@/locales/hi/streaming.json';
import hiSupport from '@/locales/hi/support.json';

// Portuguese translations
import ptCommon from '@/locales/pt/common.json';
import ptNavigation from '@/locales/pt/navigation.json';
import ptGames from '@/locales/pt/games.json';
import ptWallet from '@/locales/pt/wallet.json';
import ptNft from '@/locales/pt/nft.json';
import ptSecurity from '@/locales/pt/security.json';
import ptReferral from '@/locales/pt/referral.json';
import ptAuth from '@/locales/pt/auth.json';
import ptProfile from '@/locales/pt/profile.json';
import ptBets from '@/locales/pt/bets.json';
import ptFeed from '@/locales/pt/feed.json';
import ptTipster from '@/locales/pt/tipster.json';
import ptDeposit from '@/locales/pt/deposit.json';
import ptWithdraw from '@/locales/pt/withdraw.json';
import ptPages from '@/locales/pt/pages.json';
import ptLanding from '@/locales/pt/landing.json';
import ptPolymarket from '@/locales/pt/polymarket.json';
import ptNotifications from '@/locales/pt/notifications.json';
import ptSearch from '@/locales/pt/search.json';
import ptStreaming from '@/locales/pt/streaming.json';
import ptSupport from '@/locales/pt/support.json';

// Arabic translations
import arCommon from '@/locales/ar/common.json';
import arNavigation from '@/locales/ar/navigation.json';
import arGames from '@/locales/ar/games.json';
import arWallet from '@/locales/ar/wallet.json';
import arNft from '@/locales/ar/nft.json';
import arSecurity from '@/locales/ar/security.json';
import arReferral from '@/locales/ar/referral.json';
import arAuth from '@/locales/ar/auth.json';
import arProfile from '@/locales/ar/profile.json';
import arBets from '@/locales/ar/bets.json';
import arFeed from '@/locales/ar/feed.json';
import arTipster from '@/locales/ar/tipster.json';
import arDeposit from '@/locales/ar/deposit.json';
import arWithdraw from '@/locales/ar/withdraw.json';
import arPages from '@/locales/ar/pages.json';
import arLanding from '@/locales/ar/landing.json';
import arPolymarket from '@/locales/ar/polymarket.json';
import arNotifications from '@/locales/ar/notifications.json';
import arSearch from '@/locales/ar/search.json';
import arStreaming from '@/locales/ar/streaming.json';
import arSupport from '@/locales/ar/support.json';

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
    referral: enReferral,
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
    referral: frReferral,
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
    referral: esReferral,
  },
  hi: {
    common: hiCommon,
    navigation: hiNavigation,
    games: hiGames,
    wallet: hiWallet,
    nft: hiNft,
    security: hiSecurity,
    referral: hiReferral,
    auth: hiAuth,
    profile: hiProfile,
    bets: hiBets,
    feed: hiFeed,
    tipster: hiTipster,
    deposit: hiDeposit,
    withdraw: hiWithdraw,
    pages: hiPages,
    landing: hiLanding,
    polymarket: hiPolymarket,
    notifications: hiNotifications,
    search: hiSearch,
    streaming: hiStreaming,
    support: hiSupport,
  },
  pt: {
    common: ptCommon,
    navigation: ptNavigation,
    games: ptGames,
    wallet: ptWallet,
    nft: ptNft,
    security: ptSecurity,
    referral: ptReferral,
    auth: ptAuth,
    profile: ptProfile,
    bets: ptBets,
    feed: ptFeed,
    tipster: ptTipster,
    deposit: ptDeposit,
    withdraw: ptWithdraw,
    pages: ptPages,
    landing: ptLanding,
    polymarket: ptPolymarket,
    notifications: ptNotifications,
    search: ptSearch,
    streaming: ptStreaming,
    support: ptSupport,
  },
  ar: {
    common: arCommon,
    navigation: arNavigation,
    games: arGames,
    wallet: arWallet,
    nft: arNft,
    security: arSecurity,
    referral: arReferral,
    auth: arAuth,
    profile: arProfile,
    bets: arBets,
    feed: arFeed,
    tipster: arTipster,
    deposit: arDeposit,
    withdraw: arWithdraw,
    pages: arPages,
    landing: arLanding,
    polymarket: arPolymarket,
    notifications: arNotifications,
    search: arSearch,
    streaming: arStreaming,
    support: arSupport,
  },
};

// RTL languages
const RTL_LANGUAGES = ['ar'];

// Function to update document direction based on language
const updateDirection = (lng: string) => {
  const dir = RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: [
      'common',
      'navigation',
      'profile',
      'auth',
      'tipster',
      'bets',
      'deposit',
      'feed',
      'pages',
      'games',
      'wallet',
      'withdraw',
      'nft',
      'streaming',
      'support',
      'notifications',
      'search',
      'landing',
      'polymarket',
      'security',
      'referral',
    ],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Set initial direction
updateDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', updateDirection);

export default i18n;
