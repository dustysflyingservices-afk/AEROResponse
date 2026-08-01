import Link from "next/link";
import { listTrackableAircraft } from "@/lib/services/aircraft";
import { LiveTrackingMap } from "@/components/tracking/live-tracking-map";

export default async function TrackingPage(): Promise<JSX.Element> {
  const trackableAircraft = await listTrackableAircraft();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Live Tracking</h1>
      <p className="mt-1 text-sm text-silver-500">
        Real-time ADS-B positions, via{" "}
        <a
          href="https://airplanes.live"
          target="_blank"
          rel="noreferrer"
          className="text-brand-400 hover:text-brand-500"
        >
          airplanes.live
        </a>
        . Any aircraft with an N-Number on file is tracked automatically -
        no setup needed. An aircraft only appears on the map while it&apos;s
        actually transmitting a position (in the air, transponder on).
      </p>

      <div className="mt-6">
        <LiveTrackingMap />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-silver-100">
          Trackable Aircraft ({trackableAircraft.length})
        </h2>
        {trackableAircraft.length === 0 ? (
          <p className="mt-2 text-sm text-silver-500">
            No aircraft with an N-Number on file yet. Add one on the{" "}
            <Link
              href="/dashboard/pilots"
              className="text-brand-400 hover:text-brand-500"
            >
              Pilots
            </Link>{" "}
            page.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-silver-300">
            {trackableAircraft.map((aircraft) => (
              <li key={aircraft.id}>
                {aircraft.nNumber ?? `hex ${aircraft.icaoHex}`} &middot;{" "}
                {aircraft.pilot.firstName} {aircraft.pilot.lastName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
