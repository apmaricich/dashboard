/**
 * Resolve template variables in a string.
 * Variables use the syntax ${varName} and are replaced with their values.
 * Unknown variables resolve to empty strings.
 */
export function resolveTemplate(template: string, vars: Record<string, string>): string {
  if (!template) return template;
  return template.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    return vars[varName] !== undefined ? vars[varName] : "";
  });
}
