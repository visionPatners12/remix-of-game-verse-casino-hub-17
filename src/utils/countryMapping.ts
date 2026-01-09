
/**
 * Mapping des pays vers leurs codes ISO pour les drapeaux
 */
const COUNTRY_CODE_MAPPING: Record<string, string> = {
  // Europe
  'england': 'GB-ENG',
  'spain': 'ES',
  'italy': 'IT',
  'germany': 'DE',
  'france': 'FR',
  'netherlands': 'NL',
  'portugal': 'PT',
  'belgium': 'BE',
  'turkey': 'TR',
  'scotland': 'GB-SCT',
  'wales': 'GB-WLS',
  'ireland': 'IE',
  'northern-ireland': 'GB-NIR',
  'switzerland': 'CH',
  'austria': 'AT',
  'czech-republic': 'CZ',
  'czechia': 'CZ',
  'poland': 'PL',
  'croatia': 'HR',
  'serbia': 'RS',
  'ukraine': 'UA',
  'russia': 'RU',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'greece': 'GR',
  'romania': 'RO',
  'bulgaria': 'BG',
  'hungary': 'HU',
  'slovakia': 'SK',
  'slovenia': 'SI',
  'united-kingdom': 'GB',
  'uk': 'GB',
  'great-britain': 'GB',
  
  // Amérique du Sud
  'brazil': 'BR',
  'argentina': 'AR',
  'uruguay': 'UY',
  'chile': 'CL',
  'colombia': 'CO',
  'peru': 'PE',
  'ecuador': 'EC',
  'venezuela': 'VE',
  'bolivia': 'BO',
  'paraguay': 'PY',
  
  // Amérique du Nord et Centrale
  'united-states': 'US',
  'usa': 'US',
  'canada': 'CA',
  'mexico': 'MX',
  'dominican-republic': 'DO',
  'dominica': 'DM',
  'jamaica': 'JM',
  'haiti': 'HT',
  'cuba': 'CU',
  'costa-rica': 'CR',
  'panama': 'PA',
  'guatemala': 'GT',
  'honduras': 'HN',
  'el-salvador': 'SV',
  'nicaragua': 'NI',
  
  // Asie
  'japan': 'JP',
  'south-korea': 'KR',
  'china': 'CN',
  'india': 'IN',
  'australia': 'AU',
  'saudi-arabia': 'SA',
  'iran': 'IR',
  'iraq': 'IQ',
  'united-arab-emirates': 'AE',
  'qatar': 'QA',
  'kuwait': 'KW',
  'oman': 'OM',
  'thailand': 'TH',
  'vietnam': 'VN',
  'malaysia': 'MY',
  'singapore': 'SG',
  'indonesia': 'ID',
  'philippines': 'PH',
  'taiwan': 'TW',
  'hong-kong': 'HK',
  'macau': 'MO',
  'pakistan': 'PK',
  'bangladesh': 'BD',
  'sri-lanka': 'LK',
  'myanmar': 'MM',
  'cambodia': 'KH',
  'laos': 'LA',
  'nepal': 'NP',
  'afghanistan': 'AF',
  'uzbekistan': 'UZ',
  'kazakhstan': 'KZ',
  'mongolia': 'MN',
  
  // Afrique
  'south-africa': 'ZA',
  'egypt': 'EG',
  'morocco': 'MA',
  'tunisia': 'TN',
  'algeria': 'DZ',
  'nigeria': 'NG',
  'ghana': 'GH',
  'ivory-coast': 'CI',
  'senegal': 'SN',
  'cameroon': 'CM',
  'kenya': 'KE',
  'ethiopia': 'ET',
  'uganda': 'UG',
  'tanzania': 'TZ',
  'zimbabwe': 'ZW',
  'zambia': 'ZM',
  'botswana': 'BW',
  'namibia': 'NA',
  'mozambique': 'MZ',
  'angola': 'AO',
  'democratic-republic-congo': 'CD',
  'republic-congo': 'CG',
  'gabon': 'GA',
  'mali': 'ML',
  'burkina-faso': 'BF',
  'niger': 'NE',
  'chad': 'TD',
  'sudan': 'SD',
  'libya': 'LY',
  'madagascar': 'MG',
  'mauritius': 'MU',
  'seychelles': 'SC',
};

// Mapping étendu pour les codes de drapeaux
const COUNTRY_FLAG_MAPPING: Record<string, string> = {
  // Europe
  'GB-ENG': 'GB',
  'GB-SCT': 'GB', 
  'GB-WLS': 'GB',
  'GB-NIR': 'GB',
  'GB': 'GB',
  'UK': 'GB',
  'ES': 'ES',
  'IT': 'IT', 
  'DE': 'DE',
  'FR': 'FR',
  'NL': 'NL',
  'PT': 'PT',
  'BE': 'BE',
  'TR': 'TR',
  'IE': 'IE',
  'CH': 'CH',
  'AT': 'AT',
  'CZ': 'CZ',
  'PL': 'PL',
  'HR': 'HR',
  'RS': 'RS',
  'UA': 'UA',
  'RU': 'RU',
  'SE': 'SE',
  'NO': 'NO',
  'DK': 'DK',
  'FI': 'FI',
  'GR': 'GR',
  'RO': 'RO',
  'BG': 'BG',
  'HU': 'HU',
  'SK': 'SK',
  'SI': 'SI',
  
  // Amérique du Sud
  'BR': 'BR',
  'AR': 'AR',
  'UY': 'UY',
  'CL': 'CL',
  'CO': 'CO',
  'PE': 'PE',
  'EC': 'EC',
  'VE': 'VE',
  'BO': 'BO',
  'PY': 'PY',
  
  // Amérique du Nord et Centrale
  'US': 'US',
  'CA': 'CA',
  'MX': 'MX',
  'DO': 'DO', // République Dominicaine
  'DM': 'DM', // Dominique
  'JM': 'JM',
  'HT': 'HT',
  'CU': 'CU',
  'CR': 'CR',
  'PA': 'PA',
  'GT': 'GT',
  'HN': 'HN',
  'SV': 'SV',
  'NI': 'NI',
  
  // Asie
  'JP': 'JP',
  'KR': 'KR',
  'CN': 'CN',
  'IN': 'IN',
  'AU': 'AU',
  'SA': 'SA',
  'IR': 'IR',
  'IQ': 'IQ',
  'AE': 'AE',
  'QA': 'QA',
  'KW': 'KW',
  'OM': 'OM',
  'TH': 'TH',
  'VN': 'VN',
  'MY': 'MY',
  'SG': 'SG',
  'ID': 'ID',
  'PH': 'PH',
  'TW': 'TW', // Taiwan
  'HK': 'HK',
  'MO': 'MO',
  'PK': 'PK',
  'BD': 'BD',
  'LK': 'LK',
  'MM': 'MM',
  'KH': 'KH',
  'LA': 'LA',
  'NP': 'NP',
  'AF': 'AF',
  'UZ': 'UZ',
  'KZ': 'KZ',
  'MN': 'MN',
  
  // Afrique
  'ZA': 'ZA',
  'EG': 'EG',
  'MA': 'MA',
  'TN': 'TN',
  'DZ': 'DZ',
  'NG': 'NG',
  'GH': 'GH',
  'CI': 'CI',
  'SN': 'SN',
  'CM': 'CM',
  'KE': 'KE',
  'ET': 'ET',
  'UG': 'UG', // Uganda
  'TZ': 'TZ',
  'ZW': 'ZW',
  'ZM': 'ZM',
  'BW': 'BW',
  'NA': 'NA',
  'MZ': 'MZ',
  'AO': 'AO',
  'CD': 'CD',
  'CG': 'CG',
  'GA': 'GA',
  'ML': 'ML',
  'BF': 'BF',
  'NE': 'NE',
  'TD': 'TD',
  'SD': 'SD',
  'LY': 'LY',
  'MG': 'MG',
  'MU': 'MU',
  'SC': 'SC',
};

/**
 * Normalise un nom de pays pour la recherche
 */
function normalizeCountryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Obtient le code pays à partir d'un slug de pays/ligue
 */
function getCountryCodeFromSlug(slug: string): string | null {
  const normalizedSlug = normalizeCountryName(slug);
  
  // Recherche directe
  if (COUNTRY_CODE_MAPPING[normalizedSlug]) {
    return COUNTRY_CODE_MAPPING[normalizedSlug];
  }
  
  // Recherche partielle
  for (const [country, code] of Object.entries(COUNTRY_CODE_MAPPING)) {
    if (normalizedSlug.includes(country) || country.includes(normalizedSlug)) {
      return code;
    }
  }
  
  return null;
}

/**
 * Obtient le code pays à partir du nom de pays
 */
function getCountryCodeFromName(countryName: string): string | null {
  const normalizedName = normalizeCountryName(countryName);
  
  // Recherche directe
  if (COUNTRY_CODE_MAPPING[normalizedName]) {
    return COUNTRY_CODE_MAPPING[normalizedName];
  }
  
  // Recherches spécifiques pour certains pays
  const specialCases: Record<string, string> = {
    'chinese-taipei': 'TW',
    'taiwan': 'TW',
    'republic-of-china': 'TW',
    'uganda': 'UG',
    'dominican-rep': 'DO',
    'dom-republic': 'DO',
    'dominican': 'DO',
    'united-kingdom': 'GB',
    'great-britain': 'GB',
    'england': 'GB',
    'scotland': 'GB',
    'wales': 'GB',
    'northern-ireland': 'GB',
    'ivory-coast': 'CI',
    'cote-divoire': 'CI',
    'dem-rep-congo': 'CD',
    'dr-congo': 'CD',
    'congo-dr': 'CD',
    'south-korea': 'KR',
    'korea-republic': 'KR',
    'north-korea': 'KP',
    'korea-dpr': 'KP',
  };
  
  if (specialCases[normalizedName]) {
    return specialCases[normalizedName];
  }
  
  // Recherche partielle flexible
  for (const [country, code] of Object.entries(COUNTRY_CODE_MAPPING)) {
    const normalizedCountry = normalizeCountryName(country);
    if (normalizedName.includes(normalizedCountry) || normalizedCountry.includes(normalizedName)) {
      return code;
    }
  }
  
  return null;
}

/**
 * Fonction principale pour obtenir le code pays d'une ligue
 */
export function getLeagueCountryCode(countryName: string, countrySlug: string): string | null {
  // PRIORITÉ 1: Essayer avec le nom de pays (plus précis)
  if (countryName && countryName.trim()) {
    const codeFromName = getCountryCodeFromName(countryName.trim());
    if (codeFromName) {
      return codeFromName;
    }
  }
  
  // PRIORITÉ 2: Essayer avec le slug de pays
  if (countrySlug && countrySlug.trim()) {
    const codeFromSlug = getCountryCodeFromSlug(countrySlug.trim());
    if (codeFromSlug) {
      return codeFromSlug;
    }
  }
  
  // PRIORITÉ 3: Recherche dans le texte combiné
  const combinedText = `${countryName} ${countrySlug}`.toLowerCase();
  
  // Patterns spécifiques pour certains pays problématiques
  const countryPatterns: Record<string, string> = {
    'taiwan': 'TW',
    'chinese-taipei': 'TW',
    'uganda': 'UG',
    'dominican': 'DO',
    'dominique': 'DM',
    'england': 'GB',
    'scotland': 'GB',
    'wales': 'GB',
    'united-kingdom': 'GB',
    'great-britain': 'GB',
    'ivory-coast': 'CI',
    'cote-divoire': 'CI',
  };
  
  for (const [pattern, code] of Object.entries(countryPatterns)) {
    if (combinedText.includes(pattern)) {
      return code;
    }
  }
  
  return null;
}

// Export du mapping des drapeaux pour usage externe
export { COUNTRY_FLAG_MAPPING };
