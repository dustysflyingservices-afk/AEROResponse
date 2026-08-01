import { PublicTrackingMapLoader } from "@/components/tracking/public-tracking-map-loader";

export const metadata = {
  title: "Live Mission Tracking | Props for a Purpose",
};

export default function LiveMapPage(): JSX.Element {
  return (
    <div className="h-screen w-screen bg-surface">
      <PublicTrackingMapLoader />
    </div>
  );
}
