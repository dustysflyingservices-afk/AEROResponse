"use client";

import { useMemo, useState } from "react";
import { toggleAircraftAssignmentAction } from "@/app/dashboard/missions/actions";

export interface MatchRow {
  aircraftId: string;
  nNumber: string | null;
  makeModel: string;
  categoryLabel: string;
  homeBaseAirport: string | null;
  pilotName: string;
  pilotEmail: string | null;
  pilotPhone: string | null;
  qualifications: string | null;
  isFullMatch: boolean;
  reasons: string[];
}

interface MatchResultsProps {
  missionId: string;
  rows: MatchRow[];
  unassignedPilotRows: MatchRow[];
  assignedAircraftIds: string[];
  emailTemplate: { subject: string; body: string };
}

// The "no aircraft on file" rows use a synthetic key (pilot-<id>) since
// there's no real Aircraft record to assign/track - only real aircraft rows
// get persisted as a mission assignment or shown on the tracking map.
function isRealAircraftId(id: string): boolean {
  return !id.startsWith("pilot-");
}

export function MatchResults({
  missionId,
  rows,
  unassignedPilotRows,
  assignedAircraftIds,
  emailTemplate,
}: MatchResultsProps): JSX.Element {
  const allRows = [...rows, ...unassignedPilotRows];

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (assignedAircraftIds.length > 0) {
      return new Set(assignedAircraftIds);
    }
    return new Set(rows.filter((row) => row.isFullMatch).map((row) => row.aircraftId));
  });
  const [copied, setCopied] = useState(false);

  const fullMatches = rows.filter((row) => row.isFullMatch);
  const partialMatches = rows.filter((row) => !row.isFullMatch);

  const selectedEmails = useMemo(() => {
    const emails = new Set<string>();
    for (const row of allRows) {
      if (selectedIds.has(row.aircraftId) && row.pilotEmail) {
        emails.add(row.pilotEmail);
      }
    }
    return Array.from(emails);
  }, [allRows, selectedIds]);

  const selectedCount = allRows.filter((row) => selectedIds.has(row.aircraftId)).length;
  const emailList = selectedEmails.join(", ");

  function persistAssignment(aircraftId: string, assign: boolean): void {
    if (!isRealAircraftId(aircraftId)) {
      return;
    }
    toggleAircraftAssignmentAction(missionId, aircraftId, assign).catch((err) => {
      console.error("Failed to save aircraft assignment", err);
    });
  }

  function toggleRow(aircraftId: string): void {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(aircraftId)) {
        next.delete(aircraftId);
        persistAssignment(aircraftId, false);
      } else {
        next.add(aircraftId);
        persistAssignment(aircraftId, true);
      }
      return next;
    });
    setCopied(false);
  }

  function selectGroup(group: MatchRow[], select: boolean): void {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const row of group) {
        if (select) {
          next.add(row.aircraftId);
        } else {
          next.delete(row.aircraftId);
        }
        persistAssignment(row.aircraftId, select);
      }
      return next;
    });
    setCopied(false);
  }

  async function handleCopy(): Promise<void> {
    if (selectedEmails.length === 0) {
      return;
    }
    await navigator.clipboard.writeText(emailList);
    setCopied(true);
  }

  if (allRows.length === 0) {
    return (
      <p className="mt-4 text-sm text-silver-500">
        No pilots or aircraft in the database yet. Add a pilot first.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-silver-100">
              {selectedCount} pilot{selectedCount === 1 ? "" : "s"} selected &middot;{" "}
              {selectedEmails.length} with an email on file
            </p>
            <p className="text-xs text-silver-500">
              Checking a row marks that aircraft assigned to this mission
              (visible on the public Live Tracking map while the mission is
              active) and adds it to the mass-email list. Full matches are
              pre-selected.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={selectedEmails.length === 0}
              className="rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-silver-300 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? "Copied!" : "Copy Emails"}
            </button>
            <a
              href={
                selectedEmails.length > 0
                  ? `mailto:${encodeURIComponent(emailList)}?subject=${encodeURIComponent(
                      emailTemplate.subject
                    )}&body=${encodeURIComponent(emailTemplate.body)}`
                  : undefined
              }
              className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${
                selectedEmails.length > 0
                  ? "bg-brand-500 hover:bg-brand-600"
                  : "bg-brand-500/40 cursor-not-allowed"
              }`}
              aria-disabled={selectedEmails.length === 0}
            >
              Open in Email Client
            </a>
          </div>
        </div>

        {selectedEmails.length > 0 ? (
          <textarea
            readOnly
            value={emailList}
            rows={2}
            className="mt-3 w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-xs text-silver-300"
            onFocus={(event) => event.currentTarget.select()}
          />
        ) : null}
      </div>

      <div className="mt-6 space-y-6">
        {fullMatches.length > 0 ? (
          <MatchGroup
            title={`Full Matches (${fullMatches.length})`}
            rows={fullMatches}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onSelectGroup={selectGroup}
          />
        ) : (
          <p className="text-sm text-silver-500">No aircraft fully meet every requirement.</p>
        )}

        {partialMatches.length > 0 ? (
          <MatchGroup
            title={`Partial Matches (${partialMatches.length})`}
            rows={partialMatches}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onSelectGroup={selectGroup}
            showReasons
          />
        ) : null}

        {unassignedPilotRows.length > 0 ? (
          <div>
            <MatchGroup
              title={`Available Pilots \u2013 No Aircraft on File (${unassignedPilotRows.length})`}
              rows={unassignedPilotRows}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onSelectGroup={selectGroup}
              hideAircraftColumn
            />
            <p className="mt-2 text-xs text-silver-500">
              These pilots don&apos;t have an aircraft on file yet - could be a
              right-seat/safety pilot, or someone whose plane just hasn&apos;t been
              entered. Not evaluated against this mission&apos;s requirements.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MatchGroup({
  title,
  rows,
  selectedIds,
  onToggleRow,
  onSelectGroup,
  showReasons = false,
  hideAircraftColumn = false,
}: {
  title: string;
  rows: MatchRow[];
  selectedIds: Set<string>;
  onToggleRow: (aircraftId: string) => void;
  onSelectGroup: (group: MatchRow[], select: boolean) => void;
  showReasons?: boolean;
  hideAircraftColumn?: boolean;
}): JSX.Element {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-silver-500">
          {title}
        </h3>
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => onSelectGroup(rows, true)}
            className="font-medium text-brand-400 hover:text-brand-500"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => onSelectGroup(rows, false)}
            className="font-medium text-silver-500 hover:text-silver-300"
          >
            Select none
          </button>
        </div>
      </div>
      <div className="mt-2 overflow-x-auto rounded-lg border border-surface-border">
        <table className="min-w-full divide-y divide-surface-border">
          <thead className="bg-surface-raised">
            <tr>
              <th className="w-8 px-4 py-2" />
              {hideAircraftColumn ? null : (
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                  Aircraft
                </th>
              )}
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-silver-500">
                Pilot
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
            {rows.map((row) => (
              <tr key={row.aircraftId}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.aircraftId)}
                    onChange={() => onToggleRow(row.aircraftId)}
                    className="h-4 w-4 rounded border-surface-border bg-surface text-brand-500 focus:ring-brand-500"
                    aria-label={`Include ${row.pilotName} in the email list`}
                  />
                </td>
                {hideAircraftColumn ? null : (
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium text-silver-100">
                      {row.nNumber ?? row.makeModel}
                    </p>
                    <p className="text-xs text-silver-500">
                      {row.makeModel} &middot; {row.categoryLabel}
                      {row.homeBaseAirport ? ` \u00b7 ${row.homeBaseAirport}` : ""}
                    </p>
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-silver-100">{row.pilotName}</td>
                <td className="px-4 py-3 text-sm text-silver-300">
                  {row.pilotEmail ? <p>{row.pilotEmail}</p> : null}
                  {row.pilotPhone ? <p>{row.pilotPhone}</p> : null}
                  {!row.pilotEmail && !row.pilotPhone ? "—" : null}
                </td>
                <td className="px-4 py-3 text-sm text-silver-300">
                  {row.qualifications ?? "—"}
                </td>
                {showReasons ? (
                  <td className="px-4 py-3 text-sm text-brand-400">
                    <ul className="space-y-0.5">
                      {row.reasons.map((reason) => (
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
