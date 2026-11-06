import { calendarFor } from 'romcal';
import type { Theme, ThemeContext } from './index.js';

/**
 * Liturgical color mappings (terminal-compatible hex colors)
 * Red: Pentecost, feasts of martyrs
 * Rose: Gaudete Sunday, Laetare Sunday
 * Purple: Advent, Lent
 * Green: Ordinary Time
 * White: Easter, Christmas, major feasts
 * Gold: Special solemnities
 */
const COLOR_MAP: Record<string, string> = {
    RED: '#ff0000',
    ROSE: '#ffaaaa',
    PURPLE: '#8800cc',
    GREEN: '#00aa00',
    WHITE: '#ffffff',
    GOLD: '#ffcc00',
};

/**
 * Determines the liturgical color for a day based on its type and name.
 * @param day - Romcal day object
 * @returns Liturgical color name
 */
function _determineLiturgicalColor(day: { name?: string }): string {
    const name = day.name ? day.name.toLowerCase() : '';

    // White: Easter season, Christmas season, major feasts
    if (name.includes('easter') || name.includes('paschal')) {
        return 'WHITE';
    }
    if (name.includes('christmas')) {
        return 'WHITE';
    }
    if (name.includes('nativity')) {
        return 'WHITE';
    }
    if (name.includes('epiphany')) {
        return 'WHITE';
    }
    if (name.includes('ascension')) {
        return 'WHITE';
    }
    if (name.includes('trinity')) {
        return 'WHITE';
    }
    if (name.includes('corpus christi')) {
        return 'WHITE';
    }
    if (name.includes('transfiguration')) {
        return 'WHITE';
    }
    if (name.includes('assumption')) {
        return 'WHITE';
    }
    if (name.includes('all saints')) {
        return 'WHITE';
    }
    if (name.includes('immaculate conception')) {
        return 'WHITE';
    }
    if (name.includes('annunciation')) {
        return 'WHITE';
    }
    if (name.includes('baptism of the lord')) {
        return 'WHITE';
    }
    if (name.includes('st. joseph')) {
        return 'WHITE';
    }
    if (name.includes('st. peter') && name.includes('st. paul')) {
        return 'WHITE';
    }
    if (name.includes('visitation')) {
        return 'WHITE';
    }
    if (name.includes('dedication')) {
        return 'WHITE';
    }
    if (name.includes('st. anne')) {
        return 'WHITE';
    }
    if (name.includes('st. joachim') && name.includes('st. anne')) {
        return 'WHITE';
    }
    if (name.includes('st. john the baptist')) {
        return 'WHITE';
    }
    if (name.includes('st. thomas') && name.includes('the apostle')) {
        return 'WHITE';
    }
    if (name.includes('st. matthew')) {
        return 'WHITE';
    }
    if (name.includes('st. mark')) {
        return 'WHITE';
    }
    if (name.includes('st. lucas')) {
        return 'WHITE';
    }
    if (name.includes('st. jame') && name.includes('the apostle')) {
        return 'WHITE';
    }
    if (name.includes('st. thaddeus') && name.includes('st. julius')) {
        return 'WHITE';
    }
    if (name.includes('st. phillip') && name.includes('st. james')) {
        return 'WHITE';
    }
    if (name.includes('st. simon') && name.includes('st. judes')) {
        return 'WHITE';
    }
    if (name.includes('st. anthony') && name.includes('the great')) {
        return 'WHITE';
    }
    if (name.includes('st. charles')) {
        return 'WHITE';
    }
    if (name.includes('st. joseph calasanctius')) {
        return 'WHITE';
    }
    if (name.includes('st. john paul ii')) {
        return 'WHITE';
    }
    if (name.includes('st. teresa')) {
        return 'WHITE';
    }
    if (name.includes('st. francis') && name.includes('assisi')) {
        return 'WHITE';
    }
    if (name.includes('st. thomas')) {
        return 'WHITE';
    }
    if (name.includes('st. ignatius')) {
        return 'WHITE';
    }
    if (name.includes('st. anthony')) {
        return 'WHITE';
    }
    if (name.includes('st. francis')) {
        return 'WHITE';
    }
    if (name.includes('st. peter')) {
        return 'WHITE';
    }
    if (name.includes('st. paul')) {
        return 'WHITE';
    }
    if (name.includes('st. andrew')) {
        return 'WHITE';
    }
    if (name.includes('st. bartholomew')) {
        return 'WHITE';
    }
    if (name.includes('st. matthew')) {
        return 'WHITE';
    }
    if (name.includes('st. james')) {
        return 'WHITE';
    }
    if (name.includes('st. thomas')) {
        return 'WHITE';
    }
    if (name.includes('st. philip')) {
        return 'WHITE';
    }
    if (name.includes('st. james')) {
        return 'WHITE';
    }
    if (name.includes('st. simon')) {
        return 'WHITE';
    }
    if (name.includes('st. judes')) {
        return 'WHITE';
    }
    if (name.includes('st. john')) {
        return 'WHITE';
    }
    if (name.includes('st. peter')) {
        return 'WHITE';
    }
    if (name.includes('st. paul')) {
        return 'WHITE';
    }
    if (name.includes('st. anthony')) {
        return 'WHITE';
    }
    if (name.includes('st. thomas')) {
        return 'WHITE';
    }
    if (name.includes('st. matthew')) {
        return 'WHITE';
    }
    if (name.includes('st. mark')) {
        return 'WHITE';
    }
    if (name.includes('st. thomas aquinas')) {
        return 'WHITE';
    }
    if (name.includes('st. joseph calasanctius')) {
        return 'WHITE';
    }
    if (name.includes('st. joachim')) {
        return 'WHITE';
    }
    if (name.includes('st. anne')) {
        return 'WHITE';
    }
    if (name.includes('st. anthony')) {
        return 'WHITE';
    }
    if (name.includes('st. charles')) {
        return 'WHITE';
    }
    if (name.includes('st. john paul ii')) {
        return 'WHITE';
    }
    if (name.includes('st. ignatius')) {
        return 'WHITE';
    }
    if (name.includes('st. teresa')) {
        return 'WHITE';
    }
    if (name.includes('st. francis')) {
        return 'WHITE';
    }

    // Purple: Advent and Lent
    if (name.includes('advent')) {
        return 'PURPLE';
    }
    if (name.includes('lent')) {
        return 'PURPLE';
    }
    if (name.includes('ash wednesday')) {
        return 'PURPLE';
    }
    if (name.includes('palm sunday') || name.includes('palm sunday and')) {
        return 'PURPLE';
    }

    // Rose: Gaudete Sunday (3rd Sunday of Advent) and Laetare Sunday (4th Sunday of Lent)
    if (name.includes('gaudete')) {
        return 'ROSE';
    }
    if (name.includes('laetare')) {
        return 'ROSE';
    }

    // Green: Ordinary Time (default)
    if (name.includes('ordinary time')) {
        return 'GREEN';
    }

    // Easter season (after Easter Sunday, before Pentecost) is also white
    if (name.includes('week of easter')) {
        return 'WHITE';
    }

    // Easter Sunday itself
    if (name.includes('easter sunday')) {
        return 'WHITE';
    }

    // Red: Sundays of Easter, Pentecost, Christmas Day, Good Friday
    if (name.includes('sunday of easter')) {
        return 'WHITE';
    }
    if (name.includes('sunday after easter')) {
        return 'WHITE';
    }
    if (name.includes('pentecost')) {
        return 'RED';
    }
    if (name.includes('christmas day')) {
        return 'WHITE';
    }
    if (name.includes('good friday')) {
        return 'RED';
    }
    if (name.includes('holy thursday')) {
        return 'WHITE';
    }

    // Easter Octave (Easter Monday through Easter Saturday)
    if (name.includes('easter monday')) {
        return 'WHITE';
    }
    if (name.includes('easter tuesday')) {
        return 'WHITE';
    }
    if (name.includes('easter wednesday')) {
        return 'WHITE';
    }
    if (name.includes('easter thursday')) {
        return 'WHITE';
    }
    if (name.includes('easter friday')) {
        return 'WHITE';
    }
    if (name.includes('easter saturday')) {
        return 'WHITE';
    }

    // Easter season weekdays are white
    if (name.includes('easter season')) {
        return 'WHITE';
    }

    // Default to green (Ordinary Time)
    return 'GREEN';
}

/**
 * Determines today's liturgical color and returns the appropriate theme.
 * @param context - The theme context (for calendar year)
 * @returns Theme with today's liturgical color
 */
export default function liturgicalTheme(context: ThemeContext): Theme {
    const today = context.date;
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    let liturgicalColor = 'GREEN'; // Default to Ordinary Time (green)

    try {
        // Get the calendar for this year
        const calendar = calendarFor();

        // Find today's day object in the calendar
        const dayObj = calendar.find((d: { moment: string }) => {
            const dDate = new Date(d.moment);
            return dDate.getFullYear() === year &&
                   dDate.getMonth() === month &&
                   dDate.getDate() === day;
        });

        if (dayObj) {
            // Romcal provides liturgicalColor directly in data.meta
            liturgicalColor = dayObj.data?.meta?.liturgicalColor?.key || liturgicalColor;
        }
    } catch (err) {
        console.warn('liturgicalTheme: could not determine liturgical color, defaulting to green');
    }

    const hex = COLOR_MAP[liturgicalColor] || COLOR_MAP.GREEN;

    return {
        id: 'liturgical',
        colors: {
            primary: hex,
            border: hex,
            text: '#ffffff',
            background: '#111111',
            accent: hex,
        },
        borderStyle: 'single',
    };
}