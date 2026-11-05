import { getTimeData } from "./time.js";

const data = getTimeData();
console.log("Local time:", data.local.toLocaleString());
console.log("UTC time:", data.utc.toISOString());
console.log("Hour:", data.hour);
console.log("Minute:", data.minute);
console.log("Suggested liturgy:", data.liturgy);
console.log("Time range:", data.liturgyTimeRange);

// Validate structure
const hasAllFields = !!(
  data.local &&
  data.utc &&
  typeof data.hour === "number" &&
  typeof data.minute === "number" &&
  typeof data.liturgy === "string" &&
  typeof data.liturgyTimeRange === "string"
);
console.log("\nStructure valid:", hasAllFields);

// Validate liturgy logic
const hour = data.hour;
let expected = "";
if (hour < 6) expected = "Compline";
else if (hour < 9) expected = "Lauds";
else if (hour < 12) expected = "Terce";
else if (hour < 15) expected = "Sext";
else if (hour < 18) expected = "None";
else if (hour < 21) expected = "Vespers";
else expected = "Compline";

console.log("Expected liturgy:", expected);
console.log("Liturgy correct:", data.liturgy === expected);
