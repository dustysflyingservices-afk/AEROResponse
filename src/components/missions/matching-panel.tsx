import { criteriaFromMission, findMatchingAircraft } from "@/lib/services/matching";
import { AIRCRAFT_CATEGORY_LABELS } from "@/lib/constants/aircraft-category";
import { MatchResults, type MatchRow } from "@/components/missions/match-results";
import type { Mission } from "@prisma/client";

interface MatchingPanelProps {
  mission: Mission;
}

export async function MatchingPanel({ mission }: MatchingPanelProps): Promise<JSX.Element> {
  const criteria = criteriaFromMission(mission);
  const hasCriteria =
    Boolean(criteria.requiredCategory) ||
    Boolean(criteria.minUsefulLoadLbs) ||
    Boolean(criteria.minRangeNm) ||
    Boolean(criteria.minRunwayFt);

  const matches = await findMatchingAircraft(criteria);

  // Flatten to plain, JSON-safe rows before handing off to the client
  // component (no Date objects or Prisma model instances need to cross the
  // server/client boundary).
  const rows: MatchRow[] = matches.map((match) => ({
    aircraftId: match.aircraft.id,
    nNumber: match.aircraft.nNumber,
    makeModel: match.aircraft.makeModel,
    categoryLabel: AIRCRAFT_CATEGORY_LABELS[match.aircraft.category],
    homeBaseAirport: match.aircraft.homeBaseAirport,
    pilotName: `${match.aircraft.pilot.firstName} ${match.aircraft.pilot.lastName}`.trim(),
    pilotEmail: match.aircraft.pilot.email,
    pilotPhone: match.aircraft.pilot.phone,
    qualifications: match.aircraft.pilot.airmenRatings,
    isFullMatch: match.isFullMatch,
    reasons: match.reasons,
  }));

  const emailTemplate = {
    subject: `Volunteer Pilot Request: ${mission.missionDescription.slice(0, 80)}`,
    body: [
      `You're being contacted about a mission that may need your aircraft.`,
      ``,
      `MISSION: ${mission.missionDescription}`,
      mission.cargoPassengers ? `CARGO/PASSENGERS: ${mission.cargoPassengers}` : null,
      mission.minUsefulLoadLbs
        ? `APPROXIMATE WEIGHT / USEFUL LOAD NEEDED: ${mission.minUsefulLoadLbs} lbs`
        : null,
      mission.stagingAirport ? `STAGING AIRPORT: ${mission.stagingAirport}` : null,
      mission.destinationAirports.length > 0
        ? `DESTINATION AIRPORT(S): ${mission.destinationAirports.join(", ")}`
        : null,
      mission.launchWindow ? `DATE/LAUNCH WINDOW NEEDED: ${mission.launchWindow}` : null,
      mission.responseNeededBy
        ? `RESPONSE NEEDED BY: ${mission.responseNeededBy.toLocaleString()}`
        : null,
      ``,
      `Please do not self-dispatch. Assignments will be coordinated by Operations.`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  };

  return (
    <div className="mt-10 border-t border-surface-border pt-8">
      <h2 className="text-lg font-semibold text-silver-100">Matching Aircraft &amp; Pilots</h2>
      <p className="mt-1 text-sm text-silver-500">
        {hasCriteria
          ? "Filtered against this mission's category, useful load, range, and runway requirements."
          : "This mission has no structured requirements set, so every aircraft on file is shown. Add requirements under \u201cWhat\u201d for a filtered match."}
      </p>

      <MatchResults rows={rows} emailTemplate={emailTemplate} />
    </div>
  );
}
