import calendarFor from 'romcal';

const today = new Date();
const year = today.getFullYear();

const calendar = calendarFor();
console.log('romcal type:', typeof calendarFor);
console.log('calendar type:', typeof calendar);

// Find today
const dayObj = calendar.find((d: any) => {
    const dDate = new Date(d.date);
    return dDate.getFullYear() === today.getFullYear() &&
           dDate.getMonth() === today.getMonth() &&
           dDate.getDate() === today.getDate();
});

if (dayObj) {
    console.log('\nToday found:');
    console.log('  date:', dayObj.date);
    console.log('  name:', dayObj.name);
    console.log('  type:', dayObj.type);
    console.log('  rank:', dayObj.rank);
    console.log('  season:', dayObj.season);
    console.log('  liturgicalColor:', dayObj.liturgicalColor);
    console.log('  liturgicalSeason:', dayObj.liturgicalSeason);
    console.log('\nFull object:');
    console.log(JSON.stringify(dayObj, null, 2));
} else {
    console.log('Today not found in calendar');
}
