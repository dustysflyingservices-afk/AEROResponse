import { ImportForm } from "@/components/pilots/import-form";

export default function ImportPilotsPage(): JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Import Pilot Roster</h1>
      <p className="mt-1 max-w-2xl text-sm text-silver-500">
        Upload a spreadsheet with your existing volunteer pilots. Expected columns
        (any reasonable header spelling works): Pilot Name, Email, Phone, N-Number,
        Aircraft Make/Model, Home Base Airport. If a pilot owns more than one
        aircraft, just give them one row per aircraft &mdash; they'll be matched by
        email (or name) into a single pilot record with each aircraft linked to it.
      </p>
      <div className="mt-6">
        <ImportForm />
      </div>
    </div>
  );
}
