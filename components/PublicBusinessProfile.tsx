export function PublicBusinessProfile({
  name,
  description,
  address,
  locationAddress,
  location,
  portfolio,
}: {
  name: string;
  description: string | null;
  address: string | null;
  locationAddress: string | null;
  location: { lat: number; lng: number } | null;
  portfolio: string[];
}) {
  if (!description && !address && !locationAddress && portfolio.length === 0) return null;

  const mapUrl = location
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`
    : null;

  return (
    <section className="mx-auto mt-6 w-full max-w-lg space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-xl font-semibold">{name}</h2>
      {description && <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{description}</p>}

      {(address || locationAddress) && (
        <div className="space-y-1 text-sm">
          {address && <p>Address: {address}</p>}
          {locationAddress && <p className="text-[var(--muted)]">Map point: {locationAddress}</p>}
        </div>
      )}

      {mapUrl && (
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <iframe title="Business location" src={mapUrl} className="h-56 w-full" loading="lazy" />
        </div>
      )}

      {portfolio.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[var(--muted)]">Portfolio</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {portfolio.map((src, idx) => (
              <img
                key={`${src.slice(0, 30)}-${idx}`}
                src={src}
                alt={`Portfolio ${idx + 1}`}
                className="h-24 w-full rounded-lg border border-[var(--border)] object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
