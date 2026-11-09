import { calendarFor } from 'romcal';

export interface LiturgicalInfo {
  date: Date;
  name: string;
  rank: 'Solemnity' | 'Feast' | 'Memorial' | 'Optional Memorial' | 'Commemoration' | 'Weekday';
  season: string;
  color: string;
}

export interface SeasonInfo {
  name: string;
  startDay: number;
  endDay: number;
  daysElapsed: number;
  totalDays: number;
  proportion: number;
}

export interface LiturgicalYearData {
  totalDays: number;
  currentSeason: string;
  currentSeasonDay: number;
  currentSeasonIndex: number;
  seasons: SeasonInfo[];
  progress: number;
}

function normalizeRank(type: string): LiturgicalInfo['rank'] {
  const t = type.toUpperCase();
  if (t.includes('SOLEMNITY')) return 'Solemnity';
  if (t.includes('FEAST')) return 'Feast';
  if (t.includes('MEMORIAL')) return 'Memorial';
  if (t.includes('COMMEMORATION')) return 'Commemoration';
  return 'Weekday';
}

function normalizeSeason(type: string, name: string): string {
  if (type.includes('Advent')) return 'Advent';
  if (type.includes('Christmas')) return 'Christmas';
  if (type.includes('Epiphany')) return 'Epiphany';
  if (type.includes('Lent')) return 'Lent';
  if (type.includes('Palm') || type.includes('Holy Week') || type.includes('Easter')) return 'Easter';
  if (type.includes('Trinity') || type.includes('Pentecost')) return 'Pentecost';
  if (name.includes('Ordinary Time')) return 'Ordinary Time';
  return 'Ordinary Time';
}

export function getLiturgicalInfo(date?: Date): LiturgicalInfo {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Build ISO date string for comparison (romcal uses UTC dates)
  const targetDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  try {
    const calendar = calendarFor(year) as any[];

    let romcalDay = null;
    for (const dayEntry of calendar) {
      // Compare date strings (romcal uses YYYY-MM-DDTHH:MM:SS.000Z format)
      if (dayEntry.moment.startsWith(targetDateStr)) {
        romcalDay = dayEntry;
        break;
      }
    }

    if (!romcalDay) {
      throw new Error('Date not found in calendar');
    }

    return {
      date: d,
      name: romcalDay.name,
      rank: normalizeRank(romcalDay.type),
      season: normalizeSeason(romcalDay.type, romcalDay.name),
      color: romcalDay.data?.meta?.liturgicalColor?.key ?? 'green',
    };
  } catch (_e) {
    return {
      date: d,
      name: 'Unknown',
      rank: 'Weekday',
      season: 'Ordinary Time',
      color: 'green',
    };
  }
}

export function liturgicalYear(): LiturgicalYearData {
  const now = new Date();
  const year = now.getFullYear();

  const days = calendarFor(year) as any[];

  if (days.length === 0) {
    return {
      totalDays: 0,
      currentSeason: 'Unknown',
      currentSeasonDay: 0,
      currentSeasonIndex: 0,
      seasons: [],
      progress: 0,
    };
  }

  // Find current day index
  let currentDayIndex = 0;
  let currentSeasonIndex = 0;
  for (let i = 0; i < days.length; i++) {
    if (new Date(days[i].moment).getTime() <= now.getTime()) {
      currentDayIndex = i;
    } else {
      break;
    }
  }

  // Group into seasons using data.season.value
  const seasons: Array<{ name: string; days: any[] }> = [];
  let currentSeasonName = days[0].data?.season?.value ?? 'Ordinary Time';
  let currentSeason: { name: string; days: any[] } = { name: currentSeasonName, days: [] };

  for (let j = 0; j < days.length; j++) {
    const day = days[j];
    const seasonName = day.data?.season?.value ?? 'Ordinary Time';
    if (seasonName !== currentSeason.name) {
      seasons.push(currentSeason);
      currentSeason = { name: seasonName, days: [] };
    }
    currentSeason.days.push(day);
  }
  seasons.push(currentSeason);

  // Merge consecutive Ordinary Time
  const merged: { name: string; days: typeof days }[] = [];
  let i = 0;
  while (i < seasons.length) {
    let s = { name: seasons[i].name, days: seasons[i].days };
    while (i + 1 < seasons.length && seasons[i + 1].name === s.name) {
      s.days = [...s.days, ...seasons[i + 1].days];
      i++;
    }
    merged.push(s);
    i++;
  }

  const totalDays = days.length;
  let dayCount = 0;
  const seasonInfo: SeasonInfo[] = [];
  let currentSeasonInfo = merged[0];
  let seasonIdx = 0;

  for (const season of merged) {
    const seasonDays = season.days.length;
    const seasonStart = dayCount;
    const seasonEnd = dayCount + seasonDays - 1;

    if (currentDayIndex >= seasonStart && currentDayIndex <= seasonEnd) {
      currentSeasonInfo = season;
      currentSeasonIndex = seasonIdx;
    }

    let daysElapsed = 0;
    if (dayCount <= currentDayIndex && currentDayIndex < dayCount + seasonDays) {
      daysElapsed = currentDayIndex - dayCount + 1;
    } else if (dayCount + seasonDays <= currentDayIndex) {
      daysElapsed = seasonDays;
    } else {
      daysElapsed = 0;
    }

    seasonInfo.push({
      name: season.name,
      startDay: seasonStart + 1,
      endDay: seasonEnd + 1,
      daysElapsed,
      totalDays: seasonDays,
      proportion: daysElapsed / seasonDays,
    });

    dayCount += seasonDays;
    seasonIdx++;
  }

  return {
    totalDays,
    currentSeason: currentSeasonInfo.name,
    currentSeasonDay: currentDayIndex - (dayCount - currentSeasonInfo.days.length),
    currentSeasonIndex: currentSeasonIndex,
    seasons: seasonInfo,
    progress: currentDayIndex / totalDays,
  };
}
