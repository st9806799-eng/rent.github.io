(function (global) {
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderDashNav(el, opts) {
    if (!el) return;
    var name = (opts && opts.businessName) || "Rent";
    var active = (opts && opts.active) || "";
    var p = (opts && opts.pathPrefix) || "";
    var parts = [
      { href: p + "reservations.html", key: "dash.nav.reservations", id: "reservations" },
      { href: p + "analytics.html", key: "dash.nav.analytics", id: "analytics" },
      { href: p + "profile.html", key: "profile.title", id: "profile" },
    ];
    var html = '<nav class="top-nav"><div class="top-nav-inner">';
    html +=
      '<a href="' +
      p +
      'index.html" class="top-nav-brand">' +
      esc(name) +
      '</a><span class="top-nav-sep">·</span>';
    parts.forEach(function (item) {
      var cls = "top-nav-link";
      if (active === item.id) cls += " top-nav-link-active";
      html +=
        '<a href="' +
        item.href +
        '" class="' +
        cls +
        '" data-i18n="' +
        item.key +
        '"></a>';
    });
    html +=
      '<div class="top-nav-spacer"></div><button type="button" class="top-nav-logout" id="rent-logout-btn" data-i18n="dash.nav.logout"></button></div></nav>';
    el.innerHTML = html;
    global.RentI18n.apply(global.RentI18n.getLang());
    var btn = el.querySelector("#rent-logout-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        global.RentAuth.logout();
        global.location.href = p + "../login.html";
      });
    }
  }

  function renderAdminNav(el, opts) {
    if (!el) return;
    var active = (opts && opts.active) || "";
    var html = '<nav class="top-nav"><div class="top-nav-inner">';
    html +=
      '<a href="index.html" class="top-nav-brand">Admin</a><span class="top-nav-sep">·</span>';
    var linkCls = "top-nav-link" + (active === "home" ? " top-nav-link-active" : "");
    html += '<a href="index.html" class="' + linkCls + '" data-i18n="nav.home"></a>';
    html +=
      '<div class="top-nav-spacer"></div><button type="button" class="top-nav-logout" id="rent-admin-logout" data-i18n="dash.nav.logout"></button></div></nav>';
    el.innerHTML = html;
    global.RentI18n.apply(global.RentI18n.getLang());
    var btn = el.querySelector("#rent-admin-logout");
    if (btn) {
      btn.addEventListener("click", function () {
        global.RentAuth.logout();
        global.location.href = "../login.html";
      });
    }
  }

  global.RentNav = {
    renderDashNav: renderDashNav,
    renderAdminNav: renderAdminNav,
    esc: esc,
  };
})(typeof window !== "undefined" ? window : this);
