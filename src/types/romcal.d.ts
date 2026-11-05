declare module 'romcal' {
    export interface RomcalDay {
        moment: string;
        name: string;
        type: string;
        data?: {
            meta?: {
                liturgicalColor?: {
                    key: string;
                };
            };
        };
    }

    export function calendarFor(year?: number): RomcalDay[];
    export function queryFor(year: number, month: number, day: number): RomcalDay;
    export const countries: any;
    export const getCalendar: any;

    const romcal: {
        calendarFor: typeof calendarFor;
        queryFor: typeof queryFor;
        countries: typeof countries;
        getCalendar: typeof getCalendar;
    };

    export default romcal;
}
