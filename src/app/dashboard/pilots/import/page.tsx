import { ImportForm } from "@/components/pilots/import-form";

export default function ImportPilotsPage(): JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Import Pilot Roster</h1>
      <p className="mt-1 max-w-2xl text-sm text-silver-500">
        Upload a spreadsheet with your volunteer pilots &mdash; works well
        with an export of the Volunteer Pilot Interest Form. Expected columns
        (any reasonable header spelling works): Name (or First/Last Name),
        Email, Phone, Address, Aircraft Type, N-Number, Home Base, PIC Total
        Time, Airmen Ratings. Pilots are matched by email (or name if no
        email) so re-importing an updated roster updates existing pilots
        instead of duplicating them. If a pilot owns more than one aircraft,
        just give them one row per aircraft &mdash; they'll be matched into a
        single pilot record with each aircraft linked to it.
      </p>
      <div className="mt-6">
        <ImportForm />
      </div>
    </div>
  );
}
