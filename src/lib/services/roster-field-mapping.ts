// Maps many possible field-label spellings to our canonical field names,
// matching both the Volunteer Pilot Interest Form's wording (CSV export
// headers AND Jotform's own field labels) and common variants. Labels are
// compared after lowercasing and stripping non-alphanumeric characters, so
// "Estimated Useful Load (lb)" and "Aircraft useful load" both normalize
// toward the same alias.
export const FIELD_ALIASES: Record<string, string[]> = {
  firstName: ["firstname", "first"],
  lastName: ["lastname", "last"],
  fullName: ["name", "pilotname", "fullname", "pilot"],
  email: ["email", "emailaddress", "e-mail"],
  phone: ["phone", "phonenumber", "cell", "mobile", "cellphone"],
  street1: ["streetaddress", "address", "street"],
  street2: ["streetaddressline2", "address2", "addressline2", "apartmentsuite", "suite", "apt"],
  city: ["city"],
  state: ["state", "stateprovince", "province"],
  zipCode: ["postalzipcode", "zipcode", "zip", "postalcode"],
  picTotalTime: ["pictotaltime", "totaltime", "flighttime"],
  airmenRatings: ["airmenratings", "ratings", "qualifications", "certifications"],
  motivation: [
    "whatmotivatesyoutovolunteerwithourorganization",
    "motivation",
    "whyvolunteer",
  ],
  makeModel: ["aircrafttype", "aircraft", "aircraftmakemodel", "makemodel"],
  nNumber: ["aircraftnnumber", "nnumber", "tailnumber", "registration", "regnumber"],
  homeBaseAirport: [
    "aircrafthomeairport",
    "homebaseairport",
    "homebase",
    "baseairport",
    "base",
    "airport",
  ],
  usefulLoadLbs: [
    "aircraftusefulload",
    "estimatedusefulloadlb",
    "estimatedusefulload",
    "usefulloadlbs",
    "usefulload",
    "usefulloadlb",
  ],
  rangeNm: ["estimatedrangenm", "estimatedrange", "rangenm", "range", "rangemiles"],
  minRunwayFt: ["minrunwayft", "minrunway", "runwayft", "runwayrequired"],
};

export function normalizeFieldKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Given a list of available field labels (spreadsheet headers, or a
 * webhook's field names), returns which label matches each canonical field
 * we care about. Tries an exact match first, then falls back to substring
 * matching (longest alias first) so label wording variations - "Estimated "
 * prefixes, unit suffixes, a form's own phrasing - don't silently break the
 * mapping.
 */
export function buildFieldMap(labels: string[]): Record<string, string> {
  const normalized = labels.map((label) => ({
    original: label,
    normalized: normalizeFieldKey(label),
  }));

  const map: Record<string, string> = {};

  for (const [canonicalField, aliases] of Object.entries(FIELD_ALIASES)) {
    let match = normalized.find((label) => aliases.includes(label.normalized));

    if (!match) {
      const sortedAliases = [...aliases].sort((a, b) => b.length - a.length);
      match = normalized.find((label) =>
        sortedAliases.some((alias) => label.normalized.includes(alias))
      );
    }

    if (match) {
      map[canonicalField] = match.original;
    }
  }

  return map;
}
