import { criteriaFromMission, findMatchingAircraft } from "@/lib/services/matching";
import { AIRCRAFT_CATEGORY_LABELS } from "@/lib/constants/aircraft-category";
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
  const fullMatches = matches.filter((match) => match.isFullMatch);
  const partialMatches = matches.filter((match) => !match.isFullMatch);

  return (
    <div className="mt-10 border-t border-surface-border pt-8">
      <h2 className="text-lg font-semibold text-silver-100">Matching Aircraft &amp; Pilots</h2>
      <p className="mt-1 text-sm text-silver-500">
        {hasCriteria
          ? "Filtered against this mission's category, useful load, range, and runway requirements."
          : "This mission has no structured requirements set, so every aircraft on file is shown. Add requirements under \u201cWhat\u201d for a filtered match."}
      </p>

      {matches.length === 0 ? (
        <p className="mt-4 text-sm text-silver-500">
          No aircraft in the database yet. Add aircraft or import your roster first.
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          {fullMatches.length > 0 ? (
            <MatchTable title={`Full Matches (${fullMatches.length})`} matches={fullMatches} />
          ) : (
            <p className="text-sm text-silver-500">No aircraft fully meet every requirement.</p>
          )}

          {partialMatches.length > 0 ? (
            <MatchTable
              title={`Partial Matches (${partialMatches.length})`}
              matches={partialMatches}
              showReasons
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function MatchTable({
  title,
  matches,
  showReasons = false,
}: {
  title: string;
  matches: Awaited<ReturnType<typeof findMatchingAircraft>>;
  showReasons?: boolean;
}): JSX.Element {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-silver-500">
        {title}
      </h3>
      <div className="mt-2 overflow-x-auto rounded-lg border border-surface-border">
        <table className="min-w-full divide-y divide-surface-border">
          <thead className="bg-surface-raised">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Aircraft
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Pilot / Owner
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Contact
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Qualifications
              </th>
              {showReasons ? (
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                  Gaps
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-surface">
            {matches.map((match) => (
              <tr key={match.aircraft.id}>
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium text-silver-100">{match.aircraft.nNumber}</p>
                  <p className="text-xs text-silver-500">
                    {match.aircraft.makeModel} &middot;{" "}
                    {AIRCRAFT_CATEGORY_LABELS[match.aircraft.category]}
                    {match.aircraft.homeBaseAirport
                      ? ` \u00b7 ${match.aircraft.homeBaseAirport}`
                      : ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-silver-100">{match.aircraft.pilot.name}</td>
                <td className="px-4 py-3 text-sm text-silver-300">
                  {match.aircraft.pilot.email ? (
                    <p>{match.aircraft.pilot.email}</p>
                  ) : null}
                  {match.aircraft.pilot.phone ? (
                    <p>{match.aircraft.pilot.phone}</p>
                  ) : null}
                  {!match.aircraft.pilot.email && !match.aircraft.pilot.phone ? "—" : null}
                </td>
                <td className="px-4 py-3 text-sm text-silver-300">
                  {match.aircraft.pilot.qualifications ?? "—"}
                </td>
                {showReasons ? (
                  <td className="px-4 py-3 text-sm text-brand-400">
                    <ul className="space-y-0.5">
                      {match.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
