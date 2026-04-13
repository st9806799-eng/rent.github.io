(function () {
  var STORAGE_KEY = "rent-static-lang";

  var DICT = {
    uk: {
      "home.title": "Rent",
      "home.subtitle":
        "Простий інтерфейс, потужний рушій — бронювання за кілька дотиків.",
      "home.f1": "Розклади",
      "home.f2": "Місткість",
      "home.f3": "Верифікація (згодом)",
      "home.f4": "Ресурси (згодом)",
      "home.cta.signIn": "Увійти",
      "home.cta.register": "Створити акаунт власника",
      "home.cta.demo": "Демо бронювання (статично)",
      "home.note":
        "Повна версія з базою та оплатою — у вихідному Next.js-проєкті в корені репозиторію. Ця папка docs/ — для GitHub Pages.",
      "login.title": "Вхід",
      "login.submit": "Продовжити",
      "login.noAccount": "Немає акаунта?",
      "login.register": "Реєстрація",
      "register.title": "Створити акаунт",
      "register.submit": "Зареєструватися",
      "register.haveAccount": "Вже є акаунт?",
      "register.signIn": "Увійти",
      "auth.email": "Email",
      "auth.password": "Пароль",
      "auth.staticHint":
        "Це статична сторінка: дані нікуди не відправляються. Для реального входу запускайте повний застосунок локально.",
      "booking.tagline": "Забронюйте за кілька кроків",
      "booking.services": "Послуги",
      "booking.pickTime": "Оберіть час",
      "booking.almost": "Майже готово",
      "booking.name": "Ім’я",
      "booking.phone": "Телефон",
      "booking.submit": "Забронювати",
      "booking.back": "← Назад",
      "booking.success": "Бронь підтверджено (демо)",
      "booking.successText":
        "У статичній версії бронь лише імітується. У повному застосунку тут з’явиться запис у базі та оплата.",
      "booking.demoBiz": "Демо-салон",
      "booking.demoDesc":
        "Приклад публічного профілю — у повній версії тут адреса, карта та портфоліо.",
      "booking.s1": "Стрижка · 45 хв",
      "booking.s2": "Манікюр · 60 хв",
      "locale.uk": "УК",
      "locale.en": "EN",
      "nav.home": "На головну",
    },
    en: {
      "home.title": "Rent",
      "home.subtitle": "Simple UI, solid engine — bookings in a few taps.",
      "home.f1": "Schedules",
      "home.f2": "Capacity",
      "home.f3": "Verification (coming)",
      "home.f4": "Resources (coming)",
      "home.cta.signIn": "Sign in",
      "home.cta.register": "Create owner account",
      "home.cta.demo": "Booking demo (static)",
      "home.note":
        "The full app with database and payments lives in the Next.js project at the repo root. This docs/ folder is for GitHub Pages.",
      "login.title": "Sign in",
      "login.submit": "Continue",
      "login.noAccount": "No account?",
      "login.register": "Register",
      "register.title": "Create account",
      "register.submit": "Register",
      "register.haveAccount": "Already have an account?",
      "register.signIn": "Sign in",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.staticHint":
        "This is a static page: nothing is sent anywhere. For real auth, run the full app locally.",
      "booking.tagline": "Book in a few steps",
      "booking.services": "Services",
      "booking.pickTime": "Pick a time",
      "booking.almost": "Almost there",
      "booking.name": "Name",
      "booking.phone": "Phone",
      "booking.submit": "Book",
      "booking.back": "← Back",
      "booking.success": "Booking confirmed (demo)",
      "booking.successText":
        "In the static version the booking is only simulated. The full app would save to the database and handle payment.",
      "booking.demoBiz": "Demo salon",
      "booking.demoDesc":
        "Sample public profile — the full app adds address, map, and portfolio.",
      "booking.s1": "Haircut · 45 min",
      "booking.s2": "Manicure · 60 min",
      "locale.uk": "UK",
      "locale.en": "EN",
      "nav.home": "Home",
    },
  };

  function getLang() {
    var fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage === "uk" || fromStorage === "en") return fromStorage;
    var nav = (navigator.language || "en").toLowerCase();
    return nav.indexOf("uk") === 0 ? "uk" : "en";
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "uk" ? "uk" : "en";
    apply(lang);
    document.querySelectorAll(".locale-switch button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });
  }

  function t(lang, key) {
    return (DICT[lang] && DICT[lang][key]) || key;
  }

  function apply(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(lang, key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", t(lang, key));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (key) el.innerHTML = t(lang, key);
    });
  }

  function initLocaleSwitcher() {
    var wrap = document.querySelector(".locale-switch");
    if (!wrap) return;
    wrap.querySelectorAll("button[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
      });
    });
    setLang(getLang());
  }

  window.RentI18n = {
    getLang: getLang,
    setLang: setLang,
    t: t,
    initLocaleSwitcher: initLocaleSwitcher,
    DICT: DICT,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLocaleSwitcher);
  } else {
    initLocaleSwitcher();
  }
})();
