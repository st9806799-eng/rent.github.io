(function (global) {
  global.RentFormat = {
    slot: function (iso, locale) {
      var d = new Date(iso);
      return d.toLocaleString(locale || undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    price: function (cents, currency) {
      if (cents == null || cents === "") return "—";
      var n = typeof cents === "number" ? cents : parseInt(cents, 10);
      return (n / 100).toLocaleString(undefined, {
        style: "currency",
        currency: currency || "UAH",
      });
    },
  };
})(typeof window !== "undefined" ? window : this);
