"use client";

import dynamic from "next/dynamic";

const PublicTrackingMap = dynamic(
  () => import("@/components/tracking/public-tracking-map").then((mod) => mod.PublicTrackingMap),
  { ssr: false }
);

export function PublicTrackingMapLoader(): JSX.Element {
  return <PublicTrackingMap />;
}
