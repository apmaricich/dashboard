export interface LiturgicalInfo {
  date: Date;
  season: string;
  color: string;
  solemnity?: string;
}

export function getLiturgicalInfo(date?: Date): LiturgicalInfo {
  const d = date ?? new Date();
  return {
    date: d,
    season: "Ordinary Time",
    color: "green",
  };
}
