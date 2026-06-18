export const TEAM_FLAGS: { [team: string]: string } = {
  'Argentina': '🇦🇷',
  'Spain': '🇪🇸',
  'Brazil': '🇧🇷',
  'France': '🇫🇷',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Germany': '🇩🇪',
  'Portugal': '🇵🇹',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  'Republic of Korea': '🇰🇷',
  'Czechia': '🇨🇿',
  'Canada': '🇨🇦',
  'Bosnia and Herzegovina': '🇧🇦',
  'USA': '🇺🇸',
  'Paraguay': '🇵🇾',
  'Haiti': '🇭🇹',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Australia': '🇦🇺',
  'Türkiye': '🇹🇷',
  'Morocco': '🇲🇦',
  'Qatar': '🇶🇦',
  'Switzerland': '🇨🇭',
  'Ivory Coast': '🇨🇮',
  'Ecuador': '🇪🇨',
  'Curacao': '🇨🇼',
  'Japan': '🇯🇵',
  'Sweden': '🇸🇪',
  'Tunisia': '🇹🇳',
  'Saudi Arabia': '🇸🇦',
  'Uruguay': '🇺🇾',
  'Cape Verde': '🇨🇻',
  'Iran': '🇮🇷',
  'New Zealand': '🇳🇿',
  'Belgium': '🇧🇪',
  'Egypt': '🇪🇬',
  'Iraq': '🇮🇶',
  'Norway': '🇳🇴',
  'Algeria': '🇩🇿',
  'Austria': '🇦🇹',
  'Jordan': '🇯🇴',
  'Ghana': '🇬🇭',
  'Panama': '🇵🇦',
  'Croatia': '🇭🇷',
  'DR Congo': '🇨🇩',
  'Congo DR': '🇨🇩',
  'Uzbekistan': '🇺🇿',
  'Colombia': '🇨🇴',
  'Senegal': '🇸🇳',
  'Netherlands': '🇳🇱',
  'Mexico': '🇲🇽'
};

export const TEAM_CODES: { [team: string]: string } = {
  'Argentina': 'ar',
  'Spain': 'es',
  'Brazil': 'br',
  'France': 'fr',
  'England': 'gb-eng',
  'Germany': 'de',
  'Portugal': 'pt',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Republic of Korea': 'kr',
  'Czechia': 'cz',
  'Canada': 'ca',
  'Bosnia and Herzegovina': 'ba',
  'USA': 'us',
  'Paraguay': 'py',
  'Haiti': 'ht',
  'Scotland': 'gb-sct',
  'Australia': 'au',
  'Türkiye': 'tr',
  'Morocco': 'ma',
  'Qatar': 'qa',
  'Switzerland': 'ch',
  'Ivory Coast': 'ci',
  'Ecuador': 'ec',
  'Curacao': 'cw',
  'Japan': 'jp',
  'Sweden': 'se',
  'Tunisia': 'tn',
  'Saudi Arabia': 'sa',
  'Uruguay': 'uy',
  'Cape Verde': 'cv',
  'Iran': 'ir',
  'New Zealand': 'nz',
  'Belgium': 'be',
  'Egypt': 'eg',
  'Iraq': 'iq',
  'Norway': 'no',
  'Algeria': 'dz',
  'Austria': 'at',
  'Jordan': 'jo',
  'Ghana': 'gh',
  'Panama': 'pa',
  'Croatia': 'hr',
  'DR Congo': 'cd',
  'Congo DR': 'cd',
  'Uzbekistan': 'uz',
  'Colombia': 'co',
  'Senegal': 'sn',
  'Netherlands': 'nl',
  'Mexico': 'mx'
};

export function getTeamFlagUrl(team: string): string {
  const code = TEAM_CODES[team];
  if (!code) {
    return 'https://flagcdn.com/w40/un.png';
  }
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

/**
 * Calculates whether a match inputs is locked.
 * Inputs are locked if:
 * 1. The match has actually finished (status === 'finished')
 * 2. The match is on a past day relative to today (2026-06-14 mockup baseline)
 */
export function isMatchLocked(matchDateStr: string, status?: string): boolean {
  if (status === 'finished') {
    return true;
  }

  // Use 2026-06-14 as the mockup baseline today
  let todayStr = '2026-06-14';

  // Support actual system date if we are in the future
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localNow = new Date(now.getTime() - (offset * 60 * 1000));
  const realTodayStr = localNow.toISOString().split('T')[0];
  if (realTodayStr > todayStr) {
    todayStr = realTodayStr;
  }

  if (matchDateStr < todayStr) {
    return true;
  }

  return false;
}

export function formatNiceDate(dateStr: string): string {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', options);
}
