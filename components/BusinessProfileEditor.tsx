"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { updateBusinessProfileAction } from "@/app/actions/business";
import { FormError, Shell, Submit } from "@/components/Shell";

type Point = { lat: number; lng: number } | null;

function MapPointPicker({
  value,
  onPick,
}: {
  value: Point;
  onPick: (p: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  if (!value) return null;
  return <CircleMarker center={[value.lat, value.lng]} radius={8} pathOptions={{ color: "#3b82f6" }} />;
}

export function BusinessProfileEditor({
  slug,
  initialName,
  initialAddress,
  initialDescription,
  initialLocationAddress,
  initialLocation,
  initialPortfolio,
}: {
  slug: string;
  initialName: string;
  initialAddress: string;
  initialDescription: string;
  initialLocationAddress: string;
  initialLocation: Point;
  initialPortfolio: string[];
}) {
  const [error, formAction] = useActionState(updateBusinessProfileAction, null);
  const [pending, startTransition] = useTransition();

  const [portfolio, setPortfolio] = useState<string[]>(initialPortfolio);
  const [location, setLocation] = useState<Point>(initialLocation);
  const [locationAddress, setLocationAddress] = useState<string>(initialLocationAddress);

  useEffect(() => {
    if (!location) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lng}`;
        const res = await fetch(url, { signal: abort.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { display_name?: string };
        if (data.display_name) {
          setLocationAddress(data.display_name);
        }
      } catch {
        // ignore reverse-geocode network errors
      }
    }, 500);
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [location?.lat, location?.lng]);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      if (dataUrl) next.push(dataUrl);
    }
    setPortfolio((prev) => [...prev, ...next].slice(0, 18));
  };

  const mapCenter = useMemo<[number, number]>(() => {
    if (location) return [location.lat, location.lng];
    return [50.4501, 30.5234];
  }, [location]);

  return (
    <Shell
      title="Store profile"
      action={
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          Back
        </Link>
      }
    >
      <form action={formAction} className="space-y-4">
        <FormError message={error} />
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--muted)]">Store name</span>
          <input
            name="name"
            required
            defaultValue={initialName}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-[var(--muted)]">Description</span>
          <textarea
            name="description"
            defaultValue={initialDescription}
            rows={4}
            placeholder="What you do, key services, unique details..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-[var(--muted)]">Main address</span>
          <input
            name="address"
            defaultValue={initialAddress}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm text-[var(--muted)]">Pick map location (click on map)</p>
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <MapContainer center={mapCenter} zoom={13} style={{ height: 280, width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapPointPicker value={location} onPick={setLocation} />
            </MapContainer>
          </div>
          <input type="hidden" name="locationLat" value={location?.lat ?? ""} />
          <input type="hidden" name="locationLng" value={location?.lng ?? ""} />
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">Address from point</span>
            <input
              name="locationAddress"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">Portfolio photos</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              void addFiles(e.currentTarget.files);
              e.currentTarget.value = "";
            }}
            className="block w-full text-sm"
          />
          <input type="hidden" name="portfolioJson" value={JSON.stringify(portfolio)} />
          {portfolio.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {portfolio.map((src, idx) => (
                <div key={`${src.slice(0, 40)}-${idx}`} className="relative overflow-hidden rounded-lg border border-[var(--border)]">
                  <img src={src} alt={`Portfolio ${idx + 1}`} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPortfolio((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-xs"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Submit>Save</Submit>
          <button
            type="button"
            onClick={() =>
              startTransition(() => {
                window.open(`/b/${slug}`, "_blank");
              })
            }
            disabled={pending}
            className="w-full rounded-xl border border-[var(--border)] py-3 text-sm hover:bg-[var(--surface)] disabled:opacity-50"
          >
            Preview as client
          </button>
        </div>
      </form>
    </Shell>
  );
}
