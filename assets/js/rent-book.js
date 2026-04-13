(function (global) {
  function qs(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(global.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  function clientPhoneKey(slug) {
    return "rentClientPhone." + slug;
  }

  function getSavedPhone(slug) {
    try {
      return sessionStorage.getItem(clientPhoneKey(slug)) || "";
    } catch (e) {
      return "";
    }
  }

  function savePhone(slug, phone) {
    try {
      sessionStorage.setItem(clientPhoneKey(slug), phone);
    } catch (e) {}
  }

  function show(el) {
    el.classList.remove("hidden");
  }
  function hide(el) {
    el.classList.add("hidden");
  }

  function localeBcp47() {
    return global.RentI18n.getLang() === "uk" ? "uk-UA" : "en-US";
  }

  function t(k) {
    return global.RentI18n.t(global.RentI18n.getLang(), k);
  }

  function init() {
    var DEFAULT_TELEGRAM_BOT_USERNAME = "ReservationUA_bot";
    var slug = qs("slug");
    var errSlug = document.getElementById("book-error-slug");
    var err404 = document.getElementById("book-error-404");
    var main = document.getElementById("book-main");

    if (!slug) {
      if (errSlug) show(errSlug);
      return;
    }

    var biz = global.RentDB.getBusinessBySlug(slug);
    if (!biz) {
      if (err404) show(err404);
      return;
    }

    if (main) show(main);

    var services = global.RentDB.listServices(biz.id);
    var hours = global.RentDB.getHours(biz.id);

    renderProfile(biz);

    var elServices = document.getElementById("step-services");
    var elExisting = document.getElementById("step-existing");
    var elDay = document.getElementById("step-day");
    var elTimes = document.getElementById("step-times");
    var elDetails = document.getElementById("step-details");
    var elSuccess = document.getElementById("step-success");
    var listServices = document.getElementById("service-list");
    var dayChips = document.getElementById("day-chips");
    var slotGrid = document.getElementById("slot-grid");
    var lookupForm = document.getElementById("lookup-form");
    var lookupErr = document.getElementById("lookup-err");
    var successTelegramCta = document.getElementById("success-telegram-cta");
    var successTelegramLink = document.getElementById("success-telegram-link");

    var state = {
      serviceId: null,
      service: null,
      dayIndex: 0,
      dayDate: null,
      startIso: null,
      existing: null,
    };

    function refreshI18n() {
      global.RentI18n.apply(global.RentI18n.getLang());
    }

    function buildTelegramUrl() {
      // Static build fallback: support full URL or bot username in business fields.
      var raw = String(
        (biz && (biz.telegramBotLink || biz.telegramBotUsername || biz.telegramChatId)) || ""
      ).trim();
      if (!raw) raw = DEFAULT_TELEGRAM_BOT_USERNAME;
      if (/^https?:\/\//i.test(raw)) return raw;
      var username = raw.replace(/^@/, "");
      if (!username || /^\d+$/.test(username)) return null;
      return "https://t.me/" + username;
    }

    function hideSuccessTelegramCta() {
      if (successTelegramCta) hide(successTelegramCta);
    }

    function showSuccessTelegramCta() {
      if (!successTelegramCta || !successTelegramLink) return;
      var tgUrl = buildTelegramUrl();
      if (!tgUrl) {
        hide(successTelegramCta);
        return;
      }
      successTelegramLink.href = tgUrl;
      show(successTelegramCta);
    }

    document.addEventListener("rent-lang-change", function () {
      refreshI18n();
      if (state.existing) renderExisting(state.existing);
      if (state.serviceId) renderDayChips();
      if (state.dayDate && state.service) renderSlotsForDay();
    });

    function renderProfile(b) {
      var title = document.getElementById("profile-title");
      var desc = document.getElementById("profile-desc");
      var addr = document.getElementById("profile-address");
      var mapWrap = document.getElementById("profile-map-wrap");
      var mapFrame = document.getElementById("profile-map");
      var port = document.getElementById("profile-portfolio");
      if (title) title.textContent = b.name;
      if (desc) {
        desc.textContent = b.description || "";
        desc.style.display = b.description ? "block" : "none";
      }
      if (addr) {
        var lines = [b.address, b.locationAddress].filter(Boolean).join("\n");
        addr.textContent = lines;
        addr.style.display = lines ? "block" : "none";
      }
      if (b.locationLat != null && b.locationLng != null && mapWrap && mapFrame) {
        mapFrame.src =
          "https://www.google.com/maps?q=" +
          encodeURIComponent(b.locationLat + "," + b.locationLng) +
          "&z=15&output=embed";
        show(mapWrap);
      } else if (mapWrap) hide(mapWrap);
      if (port) {
        port.innerHTML = "";
        var imgs = Array.isArray(b.portfolio) ? b.portfolio : [];
        if (imgs.length) {
          var grid = document.createElement("div");
          grid.className = "portfolio-grid";
          imgs.forEach(function (src, idx) {
            if (!src) return;
            var im = document.createElement("img");
            im.src = src;
            im.alt = "Portfolio " + (idx + 1);
            grid.appendChild(im);
          });
          port.appendChild(grid);
        }
      }
    }

    function tryShowExisting() {
      var phone = getSavedPhone(slug);
      if (!phone) return false;
      var r = global.RentDB.findReservationForClient(biz.id, phone);
      if (!r) return false;
      state.existing = r;
      hide(elServices);
      hide(elDay);
      hide(elTimes);
      hide(elDetails);
      hide(elSuccess);
      hideSuccessTelegramCta();
      show(elExisting);
      renderExisting(r);
      return true;
    }

    function renderExisting(r) {
      var box = document.getElementById("existing-body");
      if (!box) return;
      var svc = global.RentDB.getService(r.serviceId);
      var loc = localeBcp47();
      var line =
        global.RentFormat.slot(r.startAt, loc) + " · " + (svc ? svc.name : "");
      box.innerHTML =
        "<p><strong>" +
        global.RentNav.esc(r.clientName) +
        "</strong></p><p class=\"subtitle\" style=\"margin-top:0.25rem\">" +
        global.RentNav.esc(line) +
        "</p>";
      var cancelBtn = document.getElementById("existing-cancel");
      if (cancelBtn) {
        cancelBtn.onclick = function () {
          if (!confirm("OK?")) return;
          var res = global.RentDB.clientCancelReservation(r.id, getSavedPhone(slug));
          if (res.error) {
            alert(t("booking.error.failed"));
            return;
          }
          sessionStorage.removeItem(clientPhoneKey(slug));
          global.location.reload();
        };
      }
    }

    function openNewFlow() {
      state.existing = null;
      hide(elExisting);
      hide(elSuccess);
      hideSuccessTelegramCta();
      if (services.length === 0) {
        show(elServices);
        listServices.innerHTML =
          '<p class="subtitle" data-i18n="booking.services.empty"></p>';
        refreshI18n();
        return;
      }
      show(elServices);
      listServices.innerHTML = "";
      services.forEach(function (s) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "service-btn";
        var price =
          s.priceCents != null
            ? " · " + global.RentFormat.price(s.priceCents, "UAH")
            : "";
        var minLabel = global.RentI18n.getLang() === "uk" ? " хв" : " min";
        btn.textContent = s.name + " · " + s.durationMinutes + minLabel + price;
        btn.addEventListener("click", function () {
          state.serviceId = s.id;
          state.service = s;
          hide(elServices);
          state.dayIndex = 0;
          renderDayChips();
          show(elDay);
        });
        listServices.appendChild(btn);
      });
    }

    function startOfDay(d) {
      var x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    }

    function renderDayChips() {
      dayChips.innerHTML = "";
      var today = startOfDay(new Date());
      for (var i = 0; i < 14; i++) {
        var d = new Date(today);
        d.setDate(d.getDate() + i);
        (function (di, dateObj) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "day-chip" + (di === state.dayIndex ? " day-chip-active" : "");
          b.textContent = dateObj.toLocaleDateString(localeBcp47(), {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          b.addEventListener("click", function () {
            state.dayIndex = di;
            state.dayDate = dateObj;
            Array.prototype.forEach.call(dayChips.children, function (c) {
              c.classList.remove("day-chip-active");
            });
            b.classList.add("day-chip-active");
            renderSlotsForDay();
            show(elTimes);
          });
          dayChips.appendChild(b);
        })(i, d);
      }
      state.dayDate = new Date(today);
      Array.prototype.forEach.call(dayChips.children, function (c, idx) {
        if (idx === 0) c.classList.add("day-chip-active");
      });
      renderSlotsForDay();
      show(elTimes);
    }

    function renderSlotsForDay() {
      slotGrid.innerHTML = "";
      if (!state.service || !state.dayDate) return;
      var day = startOfDay(state.dayDate);
      var slotDates = global.RentSlots.slotsForDay(
        day,
        hours,
        state.service.durationMinutes,
        30
      );
      slotDates.forEach(function (start) {
        var end = new Date(start.getTime() + state.service.durationMinutes * 60000);
        var clash = global.RentDB.load().reservations.some(function (r) {
          if (r.businessId !== biz.id || r.status !== "confirmed") return false;
          return global.RentSlots.overlap(
            new Date(r.startAt),
            new Date(r.endAt),
            start,
            end
          );
        });
        if (clash) return;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "slot-btn";
        btn.textContent = start.toLocaleTimeString(localeBcp47(), {
          hour: "2-digit",
          minute: "2-digit",
        });
        btn.addEventListener("click", function () {
          state.startIso = start.toISOString();
          hide(elDay);
          hide(elTimes);
          show(elDetails);
        });
        slotGrid.appendChild(btn);
      });
      if (!slotGrid.children.length) {
        var p = document.createElement("p");
        p.className = "subtitle";
        p.textContent = "—";
        slotGrid.appendChild(p);
      }
    }

    document.getElementById("back-to-services").addEventListener("click", function () {
      hide(elDay);
      hide(elTimes);
      show(elServices);
    });

    document.getElementById("back-to-day").addEventListener("click", function () {
      hide(elTimes);
      show(elDay);
    });

    document.getElementById("back-to-times").addEventListener("click", function () {
      hide(elDetails);
      show(elDay);
      show(elTimes);
    });

    document.getElementById("booking-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("bf-name").value.trim();
      var phone = document.getElementById("bf-phone").value.trim();
      var res = global.RentDB.addReservation({
        businessId: biz.id,
        serviceId: state.serviceId,
        startIso: state.startIso,
        clientName: name,
        clientPhone: phone,
      });
      if (res.error === "overlap") {
        alert(t("booking.error.overlap"));
        return;
      }
      if (res.error) {
        alert(t("booking.error.failed"));
        return;
      }
      savePhone(slug, phone);
      hide(elDetails);
      show(elSuccess);
      showSuccessTelegramCta();
    });

    document.getElementById("btn-new-booking").addEventListener("click", function () {
      openNewFlow();
    });

    if (lookupForm) {
      lookupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (lookupErr) lookupErr.textContent = "";
        var phone = document.getElementById("lookup-phone").value.trim();
        var r = global.RentDB.findReservationForClient(biz.id, phone);
        if (!r) {
          if (lookupErr) lookupErr.textContent = t("booking.error.lookupFailed");
          return;
        }
        savePhone(slug, phone);
        state.existing = r;
        hide(elServices);
        hide(elDay);
        hide(elTimes);
        hide(elDetails);
        hide(elSuccess);
        hideSuccessTelegramCta();
        show(elExisting);
        renderExisting(r);
      });
    }

    if (!tryShowExisting()) {
      openNewFlow();
    }
  }

  global.RentBook = { init: init };
})(typeof window !== "undefined" ? window : this);
