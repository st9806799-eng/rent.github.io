export function formatSlot(iso: string, locale = "en-US") {
  const d = new Date(iso);
  return d.toLocaleString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(cents: number | null, currency = "USD") {
  if (cents == null) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    cents / 100
  );
}
