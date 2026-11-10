import { describe, test, expect, vi, beforeEach } from "vitest";

let mockCalendar: any[] = [];
let calendarError = false;

vi.mock("romcal", () => ({
  calendarFor: vi.fn(() => {
    if (calendarError) {
      throw new Error("Calendar error");
    }
    return mockCalendar;
  }),
}));

import { getLiturgicalInfo, liturgicalYear } from "./liturgical.js";

describe("getLiturgicalInfo", () => {
  beforeEach(() => {
    mockCalendar = [];
    calendarError = false;
  });

  test("returns info for valid date found in calendar", () => {
    const targetDate = new Date(2024, 0, 1);
    mockCalendar = [
      {
        moment: "2024-01-01T00:00:00.000Z",
        name: "Solemnity of Mary, Mother of God",
        type: "Solemnity",
        data: { meta: { liturgicalColor: { key: "white" } } },
      },
    ];

    const info = getLiturgicalInfo(targetDate);
    expect(info.date).toEqual(targetDate);
    expect(info.name).toBe("Solemnity of Mary, Mother of God");
    expect(info.rank).toBe("Solemnity");
    expect(info.color).toBe("white");
  });

  test("falls back to default info when date not found in calendar", () => {
    mockCalendar = [];

    const info = getLiturgicalInfo(new Date(2024, 6, 15));
    expect(info.name).toBe("Unknown");
    expect(info.rank).toBe("Weekday");
    expect(info.season).toBe("Ordinary Time");
    expect(info.color).toBe("green");
  });

  test("falls back to default info when calendar throws", () => {
    calendarError = true;

    const info = getLiturgicalInfo(new Date(2024, 6, 15));
    expect(info.name).toBe("Unknown");
    expect(info.rank).toBe("Weekday");
    expect(info.season).toBe("Ordinary Time");
    expect(info.color).toBe("green");
  });

  test("normalizes Solemnity rank", () => {
    mockCalendar = [
      {
        moment: "2024-01-01T00:00:00.000Z",
        name: "Test Solemnity",
        type: "Solemnity",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2024, 0, 1));
    expect(info.rank).toBe("Solemnity");
  });

  test("normalizes Feast rank", () => {
    mockCalendar = [
      {
        moment: "2024-01-01T00:00:00.000Z",
        name: "Test Feast",
        type: "Feast",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2024, 0, 1));
    expect(info.rank).toBe("Feast");
  });

  test("normalizes Memorial rank", () => {
    mockCalendar = [
      {
        moment: "2024-01-01T00:00:00.000Z",
        name: "Test Memorial",
        type: "Memorial",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2024, 0, 1));
    expect(info.rank).toBe("Memorial");
  });

  test("normalizes optional memorial rank", () => {
    mockCalendar = [
      {
        moment: "2024-01-01T00:00:00.000Z",
        name: "Test Optional",
        type: "Optional Memorial",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2024, 0, 1));
    expect(info.rank).toBe("Memorial");
  });

  test("falls back to Weekday rank for unrecognized type", () => {
    mockCalendar = [
      {
        moment: "2024-01-01T00:00:00.000Z",
        name: "Test Day",
        type: "Something Weird",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2024, 0, 1));
    expect(info.rank).toBe("Weekday");
  });

  test("normalizes Advent season", () => {
    mockCalendar = [
      {
        moment: "2024-12-01T00:00:00.000Z",
        name: "Advent Day",
        type: "Advent",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2024, 11, 1));
    expect(info.season).toBe("Advent");
  });

  test("normalizes Christmas season", () => {
    mockCalendar = [
      {
        moment: "2024-12-25T00:00:00.000Z",
        name: "Christmas Day",
        type: "Christmas",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2024, 11, 25));
    expect(info.season).toBe("Christmas");
  });

  test("normalizes Lent season", () => {
    mockCalendar = [
      {
        moment: "2025-03-05T00:00:00.000Z",
        name: "Ash Wednesday",
        type: "Lent",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2025, 2, 5));
    expect(info.season).toBe("Lent");
  });

  test("normalizes Easter season (Palm Sunday)", () => {
    mockCalendar = [
      {
        moment: "2025-04-20T00:00:00.000Z",
        name: "Palm Sunday",
        type: "Palm Sunday",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2025, 3, 20));
    expect(info.season).toBe("Easter");
  });

  test("normalizes Holy Week season", () => {
    mockCalendar = [
      {
        moment: "2025-04-22T00:00:00.000Z",
        name: "Holy Thursday",
        type: "Holy Week",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2025, 3, 22));
    expect(info.season).toBe("Easter");
  });

  test("normalizes Ordinary Time by name", () => {
    mockCalendar = [
      {
        moment: "2025-06-15T00:00:00.000Z",
        name: "Ordinary Time Day",
        type: "Weekday",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2025, 5, 15));
    expect(info.season).toBe("Ordinary Time");
  });

  test("defaults to Ordinary Time for unrecognized season", () => {
    mockCalendar = [
      {
        moment: "2025-06-15T00:00:00.000Z",
        name: "Unknown Day",
        type: "Something",
        data: {},
      },
    ];

    const info = getLiturgicalInfo(new Date(2025, 5, 15));
    expect(info.season).toBe("Ordinary Time");
  });

  test("uses default date when none provided", () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    mockCalendar = [
      {
        moment: `${todayStr}T00:00:00.000Z`,
        name: "Today",
        type: "Weekday",
        data: {},
      },
    ];

    const info = getLiturgicalInfo();
    expect(info.date).toBeInstanceOf(Date);
  });

  test("uses liturgical color from romcal data when available", () => {
    mockCalendar = [
      {
        moment: "2024-01-01T00:00:00.000Z",
        name: "Test Day",
        type: "Weekday",
        data: { meta: { liturgicalColor: { key: "purple" } } },
      },
    ];

    const info = getLiturgicalInfo(new Date(2024, 0, 1));
    expect(info.color).toBe("purple");
  });
});

describe("liturgicalYear", () => {
  beforeEach(() => {
    mockCalendar = [];
    calendarError = false;
  });

  test("returns empty year data when calendar is empty", () => {
    const yearData = liturgicalYear();
    expect(yearData.totalDays).toBe(0);
    expect(yearData.currentSeason).toBe("Unknown");
    expect(yearData.seasons).toEqual([]);
    expect(yearData.progress).toBe(0);
  });

  test("computes year progress correctly", () => {
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 364 + i);
      mockCalendar.push({
        moment: day.toISOString(),
        name: `Day ${i}`,
        type: "Weekday",
        data: { season: { value: "Ordinary Time" } },
      });
    }

    const yearData = liturgicalYear();
    expect(yearData.totalDays).toBe(365);
    expect(yearData.progress).toBeGreaterThan(0);
    expect(yearData.progress).toBeLessThanOrEqual(1);
  });

  test("identifies current season correctly", () => {
    const now = new Date();
    // Days before now
    for (let i = 364; i >= 365; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      mockCalendar.push({
        moment: day.toISOString(),
        name: "Previous day",
        type: "Weekday",
        data: { season: { value: "Advent" } },
      });
    }
    // Current day in Lent
    mockCalendar.push({
      moment: now.toISOString(),
      name: "Today",
      type: "Weekday",
      data: { season: { value: "Lent" } },
    });
    // Future days
    for (let i = 1; i < 365; i++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      mockCalendar.push({
        moment: day.toISOString(),
        name: "Future day",
        type: "Weekday",
        data: { season: { value: "Easter" } },
      });
    }

    const yearData = liturgicalYear();
    expect(yearData.currentSeason).toBe("Lent");
  });

  test("computes season day count", () => {
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      mockCalendar.push({
        moment: day.toISOString(),
        name: `Day ${i}`,
        type: "Weekday",
        data: { season: { value: "Ordinary Time" } },
      });
    }

    const yearData = liturgicalYear();
    expect(yearData.currentSeasonDay).toBeGreaterThan(0);
  });
});