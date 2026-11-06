import { queryFor } from 'romcal';

export interface LiturgicalInfo {
  date: Date;
  name: string;
  rank: 'Solemnity' | 'Feast' | 'Memorial' | 'Optional Memorial' | 'Commemoration' | 'Weekday';
  season: string;
  color: string;
}

function normalizeRank(type: string): LiturgicalInfo['rank'] {
  if (type.includes('Solemnity')) return 'Solemnity';
  if (type.includes('Feast')) return 'Feast';
  if (type.includes('Memorial')) return 'Memorial';
  if (type.includes('Commemoration')) return 'Commemoration';
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

  try {
    const romcalDay = queryFor(year, month, day);

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
