declare module 'romcal' {
  export interface RomcalOptions {
    date?: string;
    locale?: string;
    country?: string;
    includeAllData?: boolean;
  }

  export interface RomcalResult {
    date: string;
    name: string;
    type: string;
    liturgicalColor: string;
    liturgicalCycle: string;
    liturgicalSeason: string;
    psalterWeek: string;
    [key: string]: unknown;
  }

  function romcal(options?: RomcalOptions): RomcalResult | null;
  export default romcal;
}