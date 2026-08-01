"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LiveAircraftPosition } from "@/app/api/tracking/live/route";

const REFRESH_MS = 15000;
const DEFAULT_CENTER: [number, number] = [37.5, -85.5]; // roughly central Kentucky
const DEFAULT_ZOOM = 6;

function planeIcon(headingDeg: number | null): L.DivIcon {
  const heading = headingDeg ?? 0;
  return L.divIcon({
    className: "aircraft-icon",
    html: `<div style="transform: rotate(${heading}deg);">
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path d="M12 2 L19 21 L12 16.5 L5 21 Z" fill="#ffffff" stroke="#00202b" stroke-width="1.5"/>
      </svg>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

interface LiveTrackingMapProps {
  filterAircraftIds?: Set<string>;
  emptyMessage?: string;
}

export function LiveTrackingMap({
  filterAircraftIds,
  emptyMessage,
}: LiveTrackingMapProps = {}): JSX.Element {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [allPositions, setAllPositions] = useState<LiveAircraftPosition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const positions = filterAircraftIds
    ? allPositions.filter((position) => filterAircraftIds.has(position.aircraftId))
    : allPositions;

  // Initialize the map once.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(
      DEFAULT_CENTER,
      DEFAULT_ZOOM
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Poll for live positions.
  useEffect(() => {
    let cancelled = false;

    async function fetchPositions(): Promise<void> {
      try {
        const response = await fetch("/api/tracking/live");
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
        const data = (await response.json()) as { positions: LiveAircraftPosition[] };
        if (!cancelled) {
          setAllPositions(data.positions);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error ? fetchError.message : "Could not load live positions."
          );
        }
      }
    }

    fetchPositions();
    const interval = setInterval(fetchPositions, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Update markers whenever positions change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const seenIds = new Set<string>();

    for (const position of positions) {
      seenIds.add(position.aircraftId);
      const icon = planeIcon(position.headingDeg);
      const existing = markersRef.current[position.aircraftId];
      const label = position.nNumber ?? position.makeModel;

      if (existing) {
        existing.setLatLng([position.lat, position.lon]);
        existing.setIcon(icon);
      } else {
        const marker = L.marker([position.lat, position.lon], { icon }).addTo(map);
        marker.bindTooltip(label, { permanent: true, direction: "top" });
        markersRef.current[position.aircraftId] = marker;
      }

      markersRef.current[position.aircraftId].bindPopup(
        `<strong>${label}</strong><br/>${position.pilotName}<br/>${
          position.altitudeFt !== null ? `${position.altitudeFt} ft` : "Altitude unknown"
        }${position.groundSpeedKt !== null ? ` &middot; ${position.groundSpeedKt} kt` : ""}`
      );
    }

    // Remove markers for aircraft no longer reporting.
    for (const [aircraftId, marker] of Object.entries(markersRef.current)) {
      if (!seenIds.has(aircraftId)) {
        map.removeLayer(marker);
        delete markersRef.current[aircraftId];
      }
    }
  }, [positions]);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-silver-400">
          {positions.length} aircraft currently reporting
          {lastUpdated ? ` \u00b7 updated ${lastUpdated.toLocaleTimeString()}` : ""}
        </p>
        {error ? <p className="text-brand-400">{error}</p> : null}
      </div>
      {filterAircraftIds && filterAircraftIds.size === 0 ? (
        <p className="mb-2 text-sm text-silver-500">
          {emptyMessage ?? "No aircraft selected to track."}
        </p>
      ) : null}
      <div
        ref={mapContainerRef}
        className="h-[500px] w-full rounded-lg border border-surface-border"
      />
    </div>
  );
}
