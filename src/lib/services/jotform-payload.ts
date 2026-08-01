/**
 * Splits Jotform's "pretty" submission summary - a single string like
 * "Name:John Doe, Email:foo@example.com, Phone Number:(555) 555-1234" - into
 * label/value pairs. Jotform doesn't escape commas inside values, so this
 * only splits at points that look like the start of a new "Label:" pair
 * (word characters followed by a colon), which handles the common case of a
 * comma inside an address correctly.
 */
export function parsePrettyFields(pretty: string): Record<string, string> {
  const parts = pretty.split(/,\s+(?=[A-Za-z][A-Za-z0-9 /?.]*:)/);
  const fields: Record<string, string> = {};

  for (const part of parts) {
    const separatorIndex = part.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }
    const label = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (label) {
      fields[label] = value;
    }
  }

  return fields;
}

export function readField(fields: Record<string, string>, label: string | undefined): string | null {
  if (!label) {
    return null;
  }
  const value = fields[label];
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readNumberField(
  fields: Record<string, string>,
  label: string | undefined
): number | null {
  const text = readField(fields, label);
  if (!text) {
    return null;
  }
  const parsed = Number(text.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}
