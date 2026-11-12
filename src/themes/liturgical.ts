import { calendarFor } from 'romcal';
import type { Theme, ThemeContext } from './index.js';

/**
 * Liturgical color sub-themes.
 * Each sub-theme specifies the complete colors object and border style
 * for that liturgical color, replacing the entire values in the final
 * theme output.
 */
const LITURGICAL_THEMES: Record<string, { colors: { primary: string; border: string; text: string; background: string; accent: string }; borderStyle: string }> = {
    RED: {
        colors: {
            primary: '#e05555',
            border: '#e05555',
            text: '#ffffff',
            background: '#1a0000',
            accent: '#ff6666',
        },
        borderStyle: 'double',
    },
    ROSE: {
        colors: {
            primary: '#f0a0b0',
            border: '#f0a0b0',
            text: '#ffffff',
            background: '#1a0a10',
            accent: '#f5c0d0',
        },
        borderStyle: 'single',
    },
    PURPLE: {
        colors: {
            primary: '#c080d0',
            border: '#c080d0',
            text: '#ffffff',
            background: '#100a1a',
            accent: '#d090e0',
        },
        borderStyle: 'round',
    },
    GREEN: {
        colors: {
            primary: '#80c080',
            border: '#80c080',
            text: '#ffffff',
            background: '#0a150a',
            accent: '#90d090',
        },
        borderStyle: 'single',
    },
    WHITE: {
        colors: {
            primary: '#e0e0e0',
            border: '#e0e0e0',
            text: '#111111',
            background: '#1a1a1a',
            accent: '#ffffff',
        },
        borderStyle: 'single',
    },
    GOLD: {
        colors: {
            primary: '#e0c040',
            border: '#e0c040',
            text: '#111111',
            background: '#1a1808',
            accent: '#f0d050',
        },
        borderStyle: 'double',
    },
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
        const calendar = calendarFor(year);

        // Find today's day object in the calendar using string comparison
        // Romcal uses UTC dates, so new Date(d.moment) will shift to local time.
        // String matching on the YYYY-MM-DD prefix avoids this timezone issue.
        const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayObj = calendar.find((d: { moment: string }) => d.moment.startsWith(targetDateStr));

        if (dayObj) {
            // Romcal provides liturgicalColor directly in data.meta
            liturgicalColor = dayObj.data?.meta?.liturgicalColor?.key || liturgicalColor;
        }
    } catch (err) {
        console.warn('liturgicalTheme: could not determine liturgical color, defaulting to green');
    }

    const subTheme = LITURGICAL_THEMES[liturgicalColor] || LITURGICAL_THEMES.GREEN;

    return {
        id: 'liturgical',
        colors: subTheme.colors,
        borderStyle: subTheme.borderStyle,
    };
}