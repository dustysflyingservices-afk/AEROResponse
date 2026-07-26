"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { importPilotRosterAction } from "@/app/dashboard/pilots/import/actions";
import type { ImportSummary, RosterRow } from "@/lib/services/pilot-import";

export function ImportForm(): JSX.Element {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setError(null);
    setSummary(null);
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("The spreadsheet has no sheets to import.");
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<RosterRow>(sheet, { defval: "" });

      if (rows.length === 0) {
        throw new Error("No data rows found in the first sheet.");
      }

      const result = await importPilotRosterAction(rows);
      setSummary(result);
    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? parseError.message
          : "Could not read that file. Make sure it's a valid .xlsx, .xls, or .csv file."
      );
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg border border-dashed border-surface-border bg-surface-raised p-6 text-center">
        <label htmlFor="roster-file" className="cursor-pointer">
          <p className="text-sm font-medium text-silver-100">
            {isProcessing ? "Processing..." : "Click to choose a spreadsheet"}
          </p>
          <p className="mt-1 text-xs text-silver-500">.xlsx, .xls, or .csv</p>
        </label>
        <input
          id="roster-file"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="hidden"
        />
      </div>

      {fileName ? (
        <p className="mt-3 text-sm text-silver-400">Selected: {fileName}</p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-brand-400" role="alert">
          {error}
        </p>
      ) : null}

      {summary ? (
        <div className="mt-6 rounded-lg border border-surface-border bg-surface-raised p-4">
          <h2 className="text-sm font-semibold text-silver-100">Import Results</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase text-silver-500">Pilots Added</dt>
              <dd className="text-lg font-semibold text-brand-500">
                {summary.pilotsCreated}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-silver-500">Pilots Matched</dt>
              <dd className="text-lg font-semibold text-silver-100">
                {summary.pilotsMatched}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-silver-500">Aircraft Added</dt>
              <dd className="text-lg font-semibold text-brand-500">
                {summary.aircraftCreated}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-silver-500">Aircraft Updated</dt>
              <dd className="text-lg font-semibold text-silver-100">
                {summary.aircraftUpdated}
              </dd>
            </div>
          </dl>

          {summary.errors.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase text-silver-500">
                Rows needing attention ({summary.errors.length})
              </p>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm text-silver-300">
                {summary.errors.map((rowError) => (
                  <li key={`${rowError.row}-${rowError.message}`}>
                    Row {rowError.row}: {rowError.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
