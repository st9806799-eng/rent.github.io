(function (global) {
  var KEY = "rent-static-v1";

  function defaultState() {
    return {
      users: [],
      businesses: [],
      services: [],
      hours: [],
      reservations: [],
    };
  }

  function load() {
    try {
      var j = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!j || !Array.isArray(j.users)) return defaultState();
      return j;
    } catch (e) {
      return defaultState();
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function uid() {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
  }

  function normalizePhone(p) {
    return String(p).replace(/\s+/g, "");
  }

  function slugify(name) {
    var base = String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 36);
    return base || "biz";
  }

  function uniqueSlug(state, base) {
    var slug = base;
    var n = 0;
    while (state.businesses.some(function (b) { return b.slug === slug; })) {
      n += 1;
      slug = base + "-" + n;
    }
    return slug;
  }

  var api = {
    load: load,
    save: save,
    resetAll: function () {
      save(defaultState());
    },

    listUsers: function () {
      return load().users;
    },

    findUserById: function (id) {
      return load().users.find(function (u) { return u.id === id; });
    },

    findUserByEmail: function (email) {
      var e = String(email).trim().toLowerCase();
      return load().users.find(function (u) { return u.email === e; });
    },

    createUser: function (email, passwordHash, role) {
      var s = load();
      var e = String(email).trim().toLowerCase();
      if (s.users.some(function (u) { return u.email === e; })) return { error: "exists" };
      var u = {
        id: uid(),
        email: e,
        passwordHash: passwordHash,
        role: role === "ADMIN" ? "ADMIN" : "OWNER",
      };
      s.users.push(u);
      save(s);
      return { user: u };
    },

    getBusinessBySlug: function (slug) {
      return load().businesses.find(function (b) { return b.slug === slug; });
    },

    getBusinessById: function (id) {
      return load().businesses.find(function (b) { return b.id === id; });
    },

    getPrimaryBusiness: function (ownerId) {
      return load().businesses.find(function (b) { return b.ownerId === ownerId; });
    },

    createBusiness: function (ownerId, data) {
      var s = load();
      if (s.businesses.some(function (b) { return b.ownerId === ownerId; }))
        return { error: "already_has_business" };
      var slug = uniqueSlug(s, slugify(data.name));
      var b = {
        id: uid(),
        ownerId: ownerId,
        name: String(data.name).trim(),
        phone: String(data.phone).trim(),
        slug: slug,
        description: data.description ? String(data.description) : "",
        address: data.address ? String(data.address) : "",
        locationLat: null,
        locationLng: null,
        locationAddress: "",
        portfolio: [],
        telegramChatId: "",
      };
      s.businesses.push(b);
      for (var d = 0; d < 7; d++) {
        s.hours.push({
          businessId: b.id,
          dayOfWeek: d,
          openTime: "09:00",
          closeTime: "18:00",
          isOpen: true,
        });
      }
      save(s);
      return { business: b };
    },

    updateBusiness: function (businessId, patch) {
      var s = load();
      var b = s.businesses.find(function (x) { return x.id === businessId; });
      if (!b) return { error: "not_found" };
      Object.keys(patch).forEach(function (k) {
        if (patch[k] !== undefined) b[k] = patch[k];
      });
      save(s);
      return { business: b };
    },

    listServices: function (businessId) {
      return load().services.filter(function (x) { return x.businessId === businessId; });
    },

    addService: function (businessId, name, durationMinutes, priceStr) {
      var s = load();
      var dur = parseInt(durationMinutes, 10);
      if (!dur || dur < 5) dur = 30;
      var priceCents = null;
      if (priceStr != null && String(priceStr).trim() !== "") {
        var p = parseFloat(String(priceStr).replace(",", "."), 10);
        if (!isNaN(p)) priceCents = Math.round(p * 100);
      }
      var svc = {
        id: uid(),
        businessId: businessId,
        name: String(name).trim(),
        durationMinutes: dur,
        priceCents: priceCents,
      };
      s.services.push(svc);
      save(s);
      return { service: svc };
    },

    getHours: function (businessId) {
      return load()
        .hours.filter(function (h) { return h.businessId === businessId; })
        .sort(function (a, b) { return a.dayOfWeek - b.dayOfWeek; });
    },

    setHours: function (businessId, rows) {
      var s = load();
      s.hours = s.hours.filter(function (h) { return h.businessId !== businessId; });
      rows.forEach(function (r) {
        s.hours.push({
          businessId: businessId,
          dayOfWeek: r.dayOfWeek,
          openTime: r.openTime,
          closeTime: r.closeTime,
          isOpen: !!r.isOpen,
        });
      });
      save(s);
    },

    listReservationsUpcoming: function (businessId) {
      var now = Date.now();
      return load()
        .reservations.filter(function (r) {
          return (
            r.businessId === businessId &&
            r.status === "confirmed" &&
            new Date(r.endAt).getTime() >= now
          );
        })
        .sort(function (a, b) {
          return new Date(a.startAt) - new Date(b.startAt);
        });
    },

    listReservationsToday: function (businessId) {
      var now = new Date();
      var sod = new Date(now);
      sod.setHours(0, 0, 0, 0);
      var eod = new Date(sod);
      eod.setDate(eod.getDate() + 1);
      return load().reservations.filter(function (r) {
        if (r.businessId !== businessId || r.status !== "confirmed") return false;
        var t = new Date(r.startAt);
        return t >= sod && t < eod;
      }).sort(function (a, b) {
        return new Date(a.startAt) - new Date(b.startAt);
      });
    },

    getReservation: function (id) {
      return load().reservations.find(function (r) { return r.id === id; });
    },

    getService: function (id) {
      return load().services.find(function (s) { return s.id === id; });
    },

    addReservation: function (data) {
      var s = load();
      var svc = s.services.find(function (x) { return x.id === data.serviceId; });
      if (!svc) return { error: "service" };
      var start = new Date(data.startIso);
      var end = new Date(start.getTime() + svc.durationMinutes * 60000);
      var overlap = s.reservations.some(function (r) {
        if (r.businessId !== data.businessId || r.status !== "confirmed") return false;
        if (data.ignoreId && r.id === data.ignoreId) return false;
        return global.RentSlots.overlap(
          new Date(r.startAt),
          new Date(r.endAt),
          start,
          end
        );
      });
      if (overlap) return { error: "overlap" };
      var res = {
        id: uid(),
        businessId: data.businessId,
        serviceId: data.serviceId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        clientName: String(data.clientName).trim(),
        clientPhone: normalizePhone(data.clientPhone),
        status: "confirmed",
      };
      s.reservations.push(res);
      save(s);
      return { reservation: res };
    },

    cancelReservation: function (id) {
      var s = load();
      var r = s.reservations.find(function (x) { return x.id === id; });
      if (!r) return { error: "not_found" };
      r.status = "cancelled";
      save(s);
      return {};
    },

    clientCancelReservation: function (id, clientPhone) {
      var s = load();
      var r = s.reservations.find(function (x) { return x.id === id; });
      if (!r || r.status !== "confirmed") return { error: "not_found" };
      if (r.clientPhone !== normalizePhone(clientPhone)) return { error: "bad" };
      r.status = "cancelled";
      save(s);
      return {};
    },

    updateReservationStart: function (id, newStartIso) {
      var s = load();
      var r = s.reservations.find(function (x) { return x.id === id; });
      if (!r || r.status !== "confirmed") return { error: "not_found" };
      var svc = s.services.find(function (x) { return x.id === r.serviceId; });
      if (!svc) return { error: "service" };
      var start = new Date(newStartIso);
      var end = new Date(start.getTime() + svc.durationMinutes * 60000);
      var overlap = s.reservations.some(function (o) {
        if (o.businessId !== r.businessId || o.status !== "confirmed" || o.id === id)
          return false;
        return global.RentSlots.overlap(
          new Date(o.startAt),
          new Date(o.endAt),
          start,
          end
        );
      });
      if (overlap) return { error: "overlap" };
      r.startAt = start.toISOString();
      r.endAt = end.toISOString();
      save(s);
      return {};
    },

    findReservationForClient: function (businessId, phone) {
      var p = normalizePhone(phone);
      var now = Date.now();
      return load().reservations.find(function (r) {
        return (
          r.businessId === businessId &&
          r.clientPhone === p &&
          r.status === "confirmed" &&
          new Date(r.endAt).getTime() >= now
        );
      });
    },

    getAvailableSlotIsos: function (businessId, serviceId, ignoreReservationId, daysAhead) {
      var svc = this.getService(serviceId);
      if (!svc) return [];
      var hours = this.getHours(businessId);
      var step = 30;
      var out = [];
      var dayCount = daysAhead != null ? daysAhead : 14;
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      for (var i = 0; i < dayCount; i++) {
        var d = new Date(today);
        d.setDate(d.getDate() + i);
        var slots = global.RentSlots.slotsForDay(d, hours, svc.durationMinutes, step);
        for (var j = 0; j < slots.length; j++) {
          var start = slots[j];
          var end = new Date(start.getTime() + svc.durationMinutes * 60000);
          var clash = load().reservations.some(function (r) {
            if (r.businessId !== businessId || r.status !== "confirmed") return false;
            if (ignoreReservationId && r.id === ignoreReservationId) return false;
            return global.RentSlots.overlap(
              new Date(r.startAt),
              new Date(r.endAt),
              start,
              end
            );
          });
          if (!clash) out.push(start.toISOString());
        }
      }
      return out;
    },

    adminSearchBusinesses: function (q) {
      q = String(q || "")
        .trim()
        .toLowerCase();
      var s = load();
      var list = s.businesses.slice().reverse();
      if (!q) return list.slice(0, 40);
      return list
        .filter(function (b) {
          return (
            b.name.toLowerCase().indexOf(q) >= 0 ||
            b.slug.indexOf(q) >= 0 ||
            b.phone.toLowerCase().indexOf(q) >= 0
          );
        })
        .slice(0, 40);
    },

    countReservations: function (businessId) {
      return load().reservations.filter(function (r) { return r.businessId === businessId; }).length;
    },

    analytics: function (businessId) {
      var all = load().reservations.filter(function (r) { return r.businessId === businessId; });
      var now = new Date();
      var sod = new Date(now);
      sod.setHours(0, 0, 0, 0);
      var eod = new Date(sod);
      eod.setDate(eod.getDate() + 1);
      var today = 0;
      var total = 0;
      var cancelled = 0;
      var map = {};
      all.forEach(function (r) {
        if (r.status === "cancelled") {
          cancelled += 1;
          return;
        }
        if (r.status !== "confirmed") return;
        total += 1;
        var t = new Date(r.startAt);
        if (t >= sod && t < eod) today += 1;
        map[r.serviceId] = (map[r.serviceId] || 0) + 1;
      });
      var top = null;
      var topN = 0;
      Object.keys(map).forEach(function (sid) {
        if (map[sid] > topN) {
          topN = map[sid];
          top = sid;
        }
      });
      var svcName = "";
      if (top) {
        var sv = load().services.find(function (s) { return s.id === top; });
        svcName = sv ? sv.name : "";
      }
      return { total: total, today: today, cancellations: cancelled, topService: svcName };
    },

    listReservationsForAdminBusiness: function (businessId) {
      var now = Date.now();
      return load()
        .reservations.filter(function (r) {
          return r.businessId === businessId && new Date(r.endAt).getTime() >= now;
        })
        .sort(function (a, b) {
          return new Date(a.startAt) - new Date(b.startAt);
        });
    },
  };

  global.RentDB = api;
})(typeof window !== "undefined" ? window : this);
