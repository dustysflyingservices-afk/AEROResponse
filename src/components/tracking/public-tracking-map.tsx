"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PublicAircraftPosition } from "@/app/api/tracking/public/route";

const REFRESH_MS = 15000;
const DEFAULT_CENTER: [number, number] = [37.5, -85.5];
const DEFAULT_ZOOM = 6;

function planeIcon(headingDeg: number | null): L.DivIcon {
  const heading = headingDeg ?? 0;
  return L.divIcon({
    className: "aircraft-icon",
    html: `<div style="transform: rotate(${heading}deg);">
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path d="M12 2 L19 21 L12 16.5 L5 21 Z" fill="#c8102e" stroke="#00202b" stroke-width="1.5"/>
      </svg>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export function PublicTrackingMap(): JSX.Element {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [positions, setPositions] = useState<PublicAircraftPosition[]>([]);

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

  useEffect(() => {
    let cancelled = false;

    async function fetchPositions(): Promise<void> {
      try {
        const response = await fetch("/api/tracking/public");
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { positions: PublicAircraftPosition[] };
        if (!cancelled) {
          setPositions(data.positions);
        }
      } catch {
        // Silently ignore on the public embed - no error UI needed for
        // site visitors, it'll just retry on the next poll.
      }
    }

    fetchPositions();
    const interval = setInterval(fetchPositions, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const seenKeys = new Set<string>();

    for (const position of positions) {
      const key = position.nNumber ?? position.hex;
      seenKeys.add(key);
      const icon = planeIcon(position.headingDeg);
      const label = position.nNumber ?? position.makeModel;
      const existing = markersRef.current[key];

      if (existing) {
        existing.setLatLng([position.lat, position.lon]);
        existing.setIcon(icon);
      } else {
        const marker = L.marker([position.lat, position.lon], { icon }).addTo(map);
        marker.bindTooltip(label, { permanent: true, direction: "top" });
        markersRef.current[key] = marker;
      }

      markersRef.current[key].bindPopup(
        `<strong>${label}</strong><br/>${position.makeModel}<br/>${
          position.altitudeFt !== null ? `${position.altitudeFt} ft` : "Altitude unknown"
        }`
      );
    }

    for (const [key, marker] of Object.entries(markersRef.current)) {
      if (!seenKeys.has(key)) {
        map.removeLayer(marker);
        delete markersRef.current[key];
      }
    }
  }, [positions]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}
