import { getCurrentUser } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";
import { BusinessProfileEditor } from "@/components/BusinessProfileEditor";

export default async function BusinessProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const biz = await getPrimaryBusinessForOwner(user.id);
  if (!biz) return null;

  const portfolio = Array.isArray(biz.portfolio)
    ? biz.portfolio.filter((v): v is string => typeof v === "string")
    : [];

  return (
    <BusinessProfileEditor
      slug={biz.slug}
      initialName={biz.name}
      initialAddress={biz.address ?? ""}
      initialDescription={biz.description ?? ""}
      initialLocationAddress={biz.locationAddress ?? ""}
      initialLocation={
        biz.locationLat != null && biz.locationLng != null
          ? { lat: biz.locationLat, lng: biz.locationLng }
          : null
      }
      initialPortfolio={portfolio}
    />
  );
}
