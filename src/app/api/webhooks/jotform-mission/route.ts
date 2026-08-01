import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { buildMissionIntakeFieldMap } from "@/lib/services/mission-intake-field-mapping";
import { parsePrettyFields, readField } from "@/lib/services/jotform-payload";
import { splitFullName } from "@/lib/services/pilot-upsert";

/**
 * This form is the PUBLIC-facing flight request intake (whoever needs help
 * submits it) - not the internal "activate a mission" form Ops uses. It
 * doesn't collect several fields a fully activated Mission needs (staging
 * airport especially), so every submission comes in as status
 * NEEDS_REVIEW with stagingAirport left blank. Everything submitted is
 * preserved in situationSummary even where it doesn't map to a dedicated
 * column, so Ops has full context while completing the mission record.
 */
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
    console.error("Jotform mission webhook: failed to parse request body", error);
    return NextResponse.json({ error: "Could not parse request body" }, { status: 400 });
  }

  const pretty = formData.get("pretty");
  if (typeof pretty !== "string" || pretty.length === 0) {
    console.error("Jotform mission webhook: no 'pretty' field in payload. Keys received:", [
      ...formData.keys(),
    ]);
    return NextResponse.json(
      { error: "No 'pretty' field found in submission payload" },
      { status: 400 }
    );
  }

  console.log("Jotform mission webhook received:", pretty);

  const fields = parsePrettyFields(pretty);
  const fieldMap = buildMissionIntakeFieldMap(Object.keys(fields));

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
  const requesterName = [firstName, lastName].filter(Boolean).join(" ") || null;

  const email = readField(fields, fieldMap.email);
  const phone = readField(fields, fieldMap.phone);
  const street1 = readField(fields, fieldMap.street1);
  const street2 = readField(fields, fieldMap.street2);
  const city = readField(fields, fieldMap.city);
  const state = readField(fields, fieldMap.state);
  const zipCode = readField(fields, fieldMap.zipCode);
  const flightDate = readField(fields, fieldMap.flightDate);
  const returningFlight = readField(fields, fieldMap.returningFlight);
  const returnDate = readField(fields, fieldMap.returnDate);
  const area = readField(fields, fieldMap.area);
  const description = readField(fields, fieldMap.description);

  const addressParts = [street1, street2, city, state, zipCode].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(", ") : null;

  const missionDescription =
    description ?? (area ? `Flight request - ${area}` : "Flight request submitted online");

  const situationSummary = [
    "Submitted via the public Flight Request form.",
    requesterName ? `Requester: ${requesterName}` : null,
    email ? `Email: ${email}` : null,
    phone ? `Phone: ${phone}` : null,
    address ? `Address: ${address}` : null,
    area ? `Area of need: ${area}` : null,
    returningFlight
      ? `Returning flight: ${returningFlight}${returnDate ? ` on ${returnDate}` : ""}`
      : null,
    description ? `Description: ${description}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const mission = await prisma.mission.create({
      data: {
        pointOfContact: requesterName,
        missionDescription,
        situationSummary,
        launchWindow: flightDate,
        destinationAirports: [],
        status: "NEEDS_REVIEW",
        priority: "MEDIUM",
      },
    });

    console.log("Jotform mission webhook: created mission", mission.id);
    return NextResponse.json({ status: "ok", missionId: mission.id });
  } catch (error) {
    console.error("Jotform mission webhook: failed to save mission", error);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }
}
