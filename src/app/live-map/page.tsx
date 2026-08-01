import { PublicTrackingMap } from "@/components/tracking/public-tracking-map";

export const metadata = {
  title: "Live Mission Tracking | Props for a Purpose",
};

export default function LiveMapPage(): JSX.Element {
  return (
    <div className="h-screen w-screen bg-surface">
      <PublicTrackingMap />
    </div>
  );
}
