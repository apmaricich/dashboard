import { registerTheme, type Theme } from "./index.js";

const liturgical: Theme = {
  id: "liturgical",
  colors: {
    primary: "#c4a000",
    border: "#8b7355",
    text: "#f5f5f0",
    background: "#1a1a1a",
    accent: "#8b0000",
  },
};

registerTheme(liturgical);
