import { NextResponse } from "next/server";
import { buildFieldMap } from "@/lib/services/roster-field-mapping";
import {
  createUpsertContext,
  parseAircraftTypeValue,
  splitFullName,
  upsertPilotRow,
} from "@/lib/services/pilot-upsert";

/**
 * Splits Jotform's "pretty" submission summary - a single string like
 * "Name:John Doe, Email:foo@example.com, Phone Number:(555) 555-1234" - into
 * label/value pairs. Jotform doesn't escape commas inside values, so this
 * only splits at points that look like the start of a new "Label:" pair
 * (word characters followed by a colon), which handles the common case of a
 * comma inside an address correctly.
 */
function parsePrettyFields(pretty: string): Record<string, string> {
  const parts = pretty.split(/,\s+(?=[A-Za-z][A-Za-z0-9 /]*:)/);
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

function readField(fields: Record<string, string>, label: string | undefined): string | null {
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

function readNumberField(fields: Record<string, string>, label: string | undefined): number | null {
  const text = readField(fields, label);
  if (!text) {
    return null;
  }
  const parsed = Number(text.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");
  const expectedSecret = process.env.JOTFORM_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("JOTFORM_WEBHOOK_SECRET is not set - refusing all webhook requests.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Jotform webhook: failed to parse request body", error);
    return NextResponse.json({ error: "Could not parse request body" }, { status: 400 });
  }

  const pretty = formData.get("pretty");
  if (typeof pretty !== "string" || pretty.length === 0) {
    console.error("Jotform webhook: no 'pretty' field in payload. Keys received:", [
      ...formData.keys(),
    ]);
    return NextResponse.json(
      { error: "No 'pretty' field found in submission payload" },
      { status: 400 }
    );
  }

  // Logged so the exact submission content is visible in Netlify's function
  // logs while setting this up - useful for confirming the field mapping is
  // matching correctly against a real submission.
  console.log("Jotform webhook received:", pretty);

  const fields = parsePrettyFields(pretty);
  const fieldMap = buildFieldMap(Object.keys(fields));

  let firstName = readField(fields, fieldMap.firstName);
  let lastName = readField(fields, fieldMap.lastName);

  if (!firstName && !lastName) {
    const fullName = readField(fields, fieldMap.fullName);
    if (fullName) {
      const split = splitFullName(fullName);
      firstName = split.firstName;
      lastName = split.lastName;
    }
  }

  if (!firstName) {
    console.error("Jotform webhook: could not determine pilot name from submission", fields);
    return NextResponse.json({ error: "Could not determine pilot name" }, { status: 422 });
  }

  const rawMakeModel = readField(fields, fieldMap.makeModel);
  const explicitNNumber = readField(fields, fieldMap.nNumber)?.toUpperCase() ?? null;
  const { makeModel, nNumber: parsedNNumber } = parseAircraftTypeValue(rawMakeModel);

  try {
    const result = await upsertPilotRow(
      {
        firstName,
        lastName: lastName ?? "",
        email: readField(fields, fieldMap.email)?.toLowerCase() ?? null,
        phone: readField(fields, fieldMap.phone),
        street1: readField(fields, fieldMap.street1),
        city: readField(fields, fieldMap.city),
        state: readField(fields, fieldMap.state),
        zipCode: readField(fields, fieldMap.zipCode),
        picTotalTime: readField(fields, fieldMap.picTotalTime),
        airmenRatings: readField(fields, fieldMap.airmenRatings),
        motivation: readField(fields, fieldMap.motivation),
        makeModel,
        nNumber: explicitNNumber ?? parsedNNumber,
        homeBaseAirport: readField(fields, fieldMap.homeBaseAirport),
        usefulLoadLbs: readNumberField(fields, fieldMap.usefulLoadLbs),
        rangeNm: readNumberField(fields, fieldMap.rangeNm),
        minRunwayFt: readNumberField(fields, fieldMap.minRunwayFt),
      },
      createUpsertContext()
    );

    console.log("Jotform webhook processed successfully:", result);
    return NextResponse.json({ status: "ok", ...result });
  } catch (error) {
    console.error("Jotform webhook: failed to save pilot/aircraft", error);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }
}
