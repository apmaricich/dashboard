import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { getTimeData } from "./time.js";

describe("getTimeData", () => {
  let originalNow: Date;

  beforeEach(() => {
    originalNow = new Date();
    // Freeze time for consistent tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns valid date objects", () => {
    const data = getTimeData();
    expect(data.local).toBeInstanceOf(Date);
    expect(data.utc).toBeInstanceOf(Date);
    expect(typeof data.hour).toBe("number");
    expect(typeof data.minute).toBe("number");
    expect(typeof data.liturgy).toBe("string");
    expect(typeof data.liturgyTimeRange).toBe("string");
  });

  test("hour range is 0-23", () => {
    const data = getTimeData();
    expect(data.hour).toBeGreaterThanOrEqual(0);
    expect(data.hour).toBeLessThanOrEqual(23);
  });

  test("minute range is 0-59", () => {
    const data = getTimeData();
    expect(data.minute).toBeGreaterThanOrEqual(0);
    expect(data.minute).toBeLessThanOrEqual(59);
  });

  // Test liturgy mappings for each hour range
  test.each([
    [3, "Compline", "previous evening"],
    [5, "Compline", "previous evening"],
    [6, "Lauds", "6am - 9am"],
    [8, "Lauds", "6am - 9am"],
    [9, "Terce", "9am - 12pm"],
    [11, "Terce", "9am - 12pm"],
    [12, "Sext", "12pm - 3pm"],
    [14, "Sext", "12pm - 3pm"],
    [15, "None", "3pm - 6pm"],
    [17, "None", "3pm - 6pm"],
    [18, "Vespers", "6pm - 9pm"],
    [20, "Vespers", "6pm - 9pm"],
    [21, "Compline", "after 9pm"],
    [23, "Compline", "after 9pm"],
  ])("hour %d maps to %s (%s)", (hour, expectedLiturgy, expectedRange) => {
    const testDate = new Date();
    testDate.setHours(hour, 30, 0, 0);
    vi.setSystemTime(testDate);

    const data = getTimeData();
    expect(data.liturgy).toBe(expectedLiturgy);
    expect(data.liturgyTimeRange).toBe(expectedRange);
  });

  test("boundary: hour 6 transitions from Compline to Lauds", () => {
    let date = new Date();
    date.setHours(5, 59, 59, 999);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Compline");

    date = new Date();
    date.setHours(6, 0, 0, 0);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Lauds");
  });

  test("boundary: hour 9 transitions from Lauds to Terce", () => {
    let date = new Date();
    date.setHours(8, 59, 59, 999);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Lauds");

    date = new Date();
    date.setHours(9, 0, 0, 0);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Terce");
  });

  test("boundary: hour 12 transitions from Terce to Sext", () => {
    let date = new Date();
    date.setHours(11, 59, 59, 999);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Terce");

    date = new Date();
    date.setHours(12, 0, 0, 0);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Sext");
  });

  test("boundary: hour 15 transitions from Sext to None", () => {
    let date = new Date();
    date.setHours(14, 59, 59, 999);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Sext");

    date = new Date();
    date.setHours(15, 0, 0, 0);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("None");
  });

  test("boundary: hour 18 transitions from None to Vespers", () => {
    let date = new Date();
    date.setHours(17, 59, 59, 999);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("None");

    date = new Date();
    date.setHours(18, 0, 0, 0);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Vespers");
  });

  test("boundary: hour 21 transitions from Vespers to Compline", () => {
    let date = new Date();
    date.setHours(20, 59, 59, 999);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Vespers");

    date = new Date();
    date.setHours(21, 0, 0, 0);
    vi.setSystemTime(date);
    expect(getTimeData().liturgy).toBe("Compline");
  });
});