import romcal from 'romcal';
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
 * Determines today's liturgical color and returns the appropriate theme.
 * @param context - The theme context (for calendar year)
 * @returns Theme with today's liturgical color
 */
export default function liturgicalTheme(context: ThemeContext): Theme {
    const isoDate = context.date.toISOString().split('T')[0];

    let liturgicalColor = 'GREEN'; // Default to Ordinary Time (green)

    try {
        const result = romcal({ date: isoDate });
        liturgicalColor = result?.liturgicalColor || 'GREEN';
    } catch (err) {
        // If romcal fails, fall back to Ordinary Time (green)
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
        borderStyle: 'solid',
    };
}