(function (global) {
  global.RentCrypto = {
    sha256hex: function (text) {
      var buf = new TextEncoder().encode(text);
      return crypto.subtle.digest("SHA-256", buf).then(function (hash) {
        return Array.from(new Uint8Array(hash))
          .map(function (b) {
            return b.toString(16).padStart(2, "0");
          })
          .join("");
      });
    },
  };
})(typeof window !== "undefined" ? window : this);
