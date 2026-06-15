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
  'Egypt': '🇪🇬'
};

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
