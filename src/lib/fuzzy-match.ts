/**
 * Fuzzy matching utility for the widget callup feature.
 */

/**
 * Score how well a query matches a target string.
 * Returns a score from 0 to 100, higher is better match.
 * 
 * Scoring:
 * - Exact match: 100
 * - Prefix match: 90
 * - Contains match: 70
 * - Fuzzy (all chars present in order): 50
 * - No match: 0
 */
export function fuzzyMatchScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  
  if (!q) return 0; // Empty query doesn't score
  if (q === t) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 70;
  
  // Fuzzy: check if all query chars appear in target in order
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  if (qi === q.length) return 50;
  
  return 0;
}

/**
 * Filter and rank matches from an array of strings.
 * 
 * @param query - Search query
 * @param targets - Array of strings to search
 * @param maxResults - Maximum number of results (default 10)
 * @returns Array of { index, target, score } sorted by score descending
 */
export function fuzzyFilter<T>(
  query: string,
  targets: T[],
  keyFn: (item: T) => string,
  maxResults = 10
): { index: number; item: T; score: number }[] {
  // Empty query: return all items
  if (!query || query.trim() === "") {
    return targets.map((item, index) => ({
      index,
      item,
      score: 100,
    }));
  }

  const scored = targets
    .map((item, index) => {
      const score = fuzzyMatchScore(query, keyFn(item));
      return { index, item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored;
}