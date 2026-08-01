"use client";

import dynamic from "next/dynamic";

const LiveTrackingMap = dynamic(
  () => import("@/components/tracking/live-tracking-map").then((mod) => mod.LiveTrackingMap),
  { ssr: false }
);

export function LiveTrackingMapLoader(): JSX.Element {
  return <LiveTrackingMap />;
}
