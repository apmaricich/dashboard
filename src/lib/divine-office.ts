import { Breviarium } from "breviarium";
import { calendarFor } from "romcal";

/**
 * Office data returned by the divine office integration.
 */
export interface OfficeData {
  /** The name of the current office */
  office: string;
  /** Time range when this office is appropriate */
  timeRange: string;
  /** Today's celebration (feast/memorial) */
  celebration: string;
  /** Liturgical color for today */
  color: string;
  /** Liturgical season */
  season: string;
  /** Psalm references for this office */
  psalmRefs: string[];
  /** Reading reference (New Testament) */
  readingRef: string;
  /** Gospel reference (if applicable) */
  gospelRef?: string;
  /** Hymn text for this office */
  hymn: string;
  /** Concluding prayer */
  collect: string;
}

function normalizeRank(type: string): "Solemnity" | "Feast" | "Memorial" | "Optional Memorial" | "Commemoration" | "Weekday" {
  if (type.includes("Solemnity")) return "Solemnity";
  if (type.includes("Feast")) return "Feast";
  if (type.includes("Memorial")) return "Memorial";
  if (type.includes("Commemoration")) return "Commemoration";
  return "Weekday";
}

function normalizeSeason(type: string, name: string): string {
  if (type.includes("Advent")) return "Advent";
  if (type.includes("Christmas")) return "Christmas";
  if (type.includes("Epiphany")) return "Epiphany";
  if (type.includes("Lent")) return "Lent";
  if (type.includes("Palm") || type.includes("Holy Week") || type.includes("Easter")) return "Easter";
  if (type.includes("Trinity") || type.includes("Pentecost")) return "Pentecost";
  if (name.includes("Ordinary Time")) return "Ordinary Time";
  return "Ordinary Time";
}

/**
 * Get the current office information using the breviarium library.
 */
export async function getCurrentOffice(date?: Date): Promise<OfficeData> {
  const now = date ?? new Date();
  const breviarium = new Breviarium(now);

  // Determine which office is appropriate for the current time
  const hour = now.getHours();
  let officeName = "";
  let officeTimeRange = "";
  let officeData: any = null;

  if (hour < 6) {
    officeName = "Compline";
    officeTimeRange = "after 9pm";
    try {
      const completorium = await breviarium.getCompletorium();
      officeData = completorium;
    } catch (_e) {
      // No data for this office
    }
  } else if (hour >= 6 && hour < 9) {
    officeName = "Lauds";
    officeTimeRange = "6am - 9am";
    try {
      const laudes = await breviarium.getLaudes();
      officeData = laudes && laudes.length > 0 ? laudes[0] : null;
    } catch (_e) {
      // No data for this office
    }
  } else if (hour >= 9 && hour < 12) {
    officeName = "Terce";
    officeTimeRange = "9am - 12pm";
    try {
      const tercia = await breviarium.getTertia();
      officeData = tercia;
    } catch (_e) {
      // No data for this office
    }
  } else if (hour >= 12 && hour < 15) {
    officeName = "Sext";
    officeTimeRange = "12pm - 3pm";
    try {
      const sexta = await breviarium.getSexta();
      officeData = sexta;
    } catch (_e) {
      // No data for this office
    }
  } else if (hour >= 15 && hour < 18) {
    officeName = "None";
    officeTimeRange = "3pm - 6pm";
    try {
      const nona = await breviarium.getNona();
      officeData = nona;
    } catch (_e) {
      // No data for this office
    }
  } else {
    officeName = "Vespers";
    officeTimeRange = "6pm - 9pm";
    try {
      const vesperae = await breviarium.getVesperae();
      officeData = vesperae && vesperae.length > 0 ? vesperae[0] : null;
    } catch (_e) {
      // No data for this office
    }
  }

  // Get liturgical information from romcal (English)
  let liturgyInfo = {
    name: "Unknown",
    rank: "Weekday",
    season: "Ordinary Time",
    color: "green",
  };

  try {
    const year = now.getFullYear();
    const days = calendarFor(year);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const today = days.find(
      (d: any) =>
        d.moment &&
        d.moment.startsWith(todayStr)
    );

    if (today) {
      liturgyInfo = {
        name: today.name,
        rank: normalizeRank(today.type),
        season: normalizeSeason(today.type, today.name),
        color: today.data?.meta?.liturgicalColor?.key ?? "green",
      };
    }
  } catch (_e) {
    // Fall through to default
  }

  // Normalize psalm references
  const psalmRefs: string[] = [];
  if (officeData && typeof officeData === "object") {
    if (officeData.primer_salmo_cita) psalmRefs.push(String(officeData.primer_salmo_cita));
    if (officeData.segundo_salmo_cita) psalmRefs.push(String(officeData.segundo_salmo_cita));
    if (officeData.tercer_salmo_cita) psalmRefs.push(String(officeData.tercer_salmo_cita));
  }

  // Extract reading reference
  let readingRef = "";
  if (officeData && typeof officeData === "object") {
    if (officeData.lectura_biblica_cita) {
      readingRef = String(officeData.lectura_biblica_cita);
    } else if (officeData.lecturas && officeData.lecturas.length > 0) {
      readingRef = String(officeData.lecturas[0].ref);
    }
  }

  // Check for gospel reference
  let gospelRef: string | undefined;
  if (officeData && typeof officeData === "object" && officeData.lecturas) {
    const gospel = officeData.lecturas.find((l: any) => l.type === "GOSPEL");
    if (gospel) {
      gospelRef = String(gospel.ref);
    }
  }

  // Get evangelium separately if not found
  if (!gospelRef) {
    try {
      const evangelium = await breviarium.getEvangelium();
      if (evangelium && evangelium.evangelium_lectiones && evangelium.evangelium_lectiones.length > 0) {
        gospelRef = evangelium.evangelium_lectiones[0].ref;
      }
    } catch (_e) {
      // Gospel not available for this office
    }
  }

  return {
    office: officeName,
    timeRange: officeTimeRange,
    celebration: liturgyInfo.name,
    color: liturgyInfo.color,
    season: liturgyInfo.season,
    psalmRefs,
    readingRef,
    gospelRef,
    hymn: officeData?.himno || "",
    collect: officeData?.oracion_final || "",
  };
}