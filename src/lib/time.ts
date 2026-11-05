export interface TimeData {
  local: Date;
  utc: Date;
  hour: number;
  minute: number;
  liturgy: string;
  liturgyTimeRange: string;
}

export function getTimeData(): TimeData {
  const local = new Date();
  const utc = new Date(local.toUTCString());
  const hour = local.getHours();

  let liturgy = "";
  let liturgyTimeRange = "";

  if (hour < 6) {
    liturgy = "Compline";
    liturgyTimeRange = "previous evening";
  } else if (hour >= 6 && hour < 9) {
    liturgy = "Lauds";
    liturgyTimeRange = "6am - 9am";
  } else if (hour >= 9 && hour < 12) {
    liturgy = "Terce";
    liturgyTimeRange = "9am - 12pm";
  } else if (hour >= 12 && hour < 15) {
    liturgy = "Sext";
    liturgyTimeRange = "12pm - 3pm";
  } else if (hour >= 15 && hour < 18) {
    liturgy = "None";
    liturgyTimeRange = "3pm - 6pm";
  } else if (hour >= 18 && hour < 21) {
    liturgy = "Vespers";
    liturgyTimeRange = "6pm - 9pm";
  } else {
    liturgy = "Compline";
    liturgyTimeRange = "after 9pm";
  }

  return {
    local,
    utc,
    hour,
    minute: local.getMinutes(),
    liturgy,
    liturgyTimeRange,
  };
}
