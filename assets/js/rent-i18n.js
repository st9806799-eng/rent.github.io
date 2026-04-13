(function (global) {
  var STORAGE_KEY = "rent-static-lang";

  var DICT = {
    uk: {
      "locale.uk": "УК",
      "locale.en": "EN",
      "nav.home": "На головну",
      "dash.nav.home": "Сьогодні",
      "dash.nav.reservations": "Бронювання",
      "dash.nav.analytics": "Аналітика",
      "dash.nav.logout": "Вийти",
      "home.title": "Rent",
      "home.subtitle": "Простий інтерфейс — бронювання в браузері, дані лише на цьому пристрої (localStorage).",
      "home.f1": "Розклади",
      "home.f2": "Місткість слотів",
      "home.f3": "Без сервера Node.js",
      "home.f4": "Підходить для GitHub Pages",
      "home.cta.signIn": "Увійти",
      "home.cta.register": "Створити акаунт власника",
      "home.cta.admin": "Адмін-панель",
      "home.cta.dashboard": "Кабінет",
      "home.cta.createBusiness": "Створити бізнес",
      "home.note":
        "Ця збірка працює офлайн у браузері (localStorage). Онлайн-оплати немає.",
      "auth.login.title": "Вхід",
      "auth.login.continue": "Продовжити",
      "auth.login.noAccount": "Немає акаунта?",
      "auth.login.register": "Реєстрація",
      "auth.register.title": "Створити акаунт",
      "auth.register.submit": "Зареєструватися",
      "auth.register.haveAccount": "Вже є акаунт?",
      "auth.register.signIn": "Увійти",
      "auth.field.email": "Email",
      "auth.field.password": "Пароль",
      "auth.adminAccount": "Зареєструвати як адміністратора (демо)",
      "auth.error.exists": "Користувач з таким email уже є.",
      "auth.error.bad": "Невірний email або пароль.",
      "dash.today.title": "Сьогодні",
      "dash.today.count": "{{n}} бронювань",
      "dash.today.empty":
        "Поки немає бронювань. Додайте послугу та поділіться посиланням на сторінку бронювання.",
      "dash.link.addService": "➕ Додати послугу",
      "dash.link.schedule": "📅 Розклад",
      "dash.copy.link": "🔗 Копіювати посилання",
      "dash.copy.copied": "Скопійовано",
      "dash.copy.qr": "Завантажити QR",
      "dash.back": "Назад",
      "reservations.title": "Бронювання",
      "reservations.subtitle": "Сьогодні та наступні",
      "reservations.empty": "Немає майбутніх бронювань.",
      "schedule.title": "Розклад",
      "schedule.subtitle":
        "За замовчуванням 09:00–18:00 щодня. Вимкніть дні або змініть час.",
      "schedule.day0": "Нд",
      "schedule.day1": "Пн",
      "schedule.day2": "Вт",
      "schedule.day3": "Ср",
      "schedule.day4": "Чт",
      "schedule.day5": "Пт",
      "schedule.day6": "Сб",
      "analytics.title": "Аналітика",
      "analytics.totalBookings": "Усього підтверджених бронювань",
      "analytics.today": "Сьогодні",
      "analytics.cancellations": "Скасовано",
      "analytics.topService": "Топ-послуга",
      "serviceNew.title": "Додати послугу",
      "serviceNew.name": "Назва",
      "serviceNew.duration": "Тривалість (хв)",
      "serviceNew.price": "Ціна (необов’язково)",
      "serviceNew.placeholder.name": "Стрижка",
      "serviceNew.placeholder.price": "500",
      "serviceNew.hint": "Послуги одразу з’являються на публічній сторінці бронювання.",
      "serviceNew.submit": "Зберегти послугу",
      "ownerRow.cancel": "Скасувати",
      "ownerRow.move": "Перенести",
      "ownerRow.close": "Закрити",
      "common.save": "Зберегти",
      "profile.title": "Профіль магазину",
      "profile.storeName": "Назва магазину",
      "profile.description": "Опис",
      "profile.descriptionPlaceholder": "Чим займаєтесь…",
      "profile.mainAddress": "Основна адреса",
      "profile.portfolio.hint": "URL зображень портфоліо (по одному в рядку)",
      "profile.save": "Зберегти профіль",
      "business.create.title": "Створіть бізнес",
      "business.create.intro":
        "Один крок — години за замовчуванням (9–18) і порожній список послуг.",
      "business.field.name": "Назва бізнесу",
      "business.field.phone": "Телефон",
      "business.field.address": "Адреса (необов’язково)",
      "business.submit": "Створити й почати",
      "admin.businessesTitle": "Заклади",
      "admin.searchHint": "Пошук за назвою, slug або телефоном",
      "admin.search": "Шукати",
      "admin.openBooking": "Відкрити бронювання",
      "admin.reservations": "Бронювання",
      "admin.none": "Нічого не знайдено.",
      "admin.resTitle": "Броні закладу",
      "telegram.title": "Telegram (статична версія)",
      "telegram.static":
        "Нагадування через бота потребують сервера з вебхуком. Тут можна лише зберегти нотатку (Chat ID) в даних профілю для наглядності.",
      "telegram.field.chatId": "Telegram Chat ID (необов’язково)",
      "booking.tagline": "Забронюйте за кілька кроків",
      "booking.servicesTitle": "Послуги",
      "booking.services.empty": "Послуг ще немає.",
      "booking.back": "← Назад",
      "booking.pickTime": "Оберіть час",
      "booking.pickDay": "День",
      "booking.almostThere": "Майже готово",
      "booking.label.name": "Ім’я",
      "booking.label.phone": "Телефон",
      "booking.book.submit": "Забронювати",
      "booking.success.title": "Бронь підтверджено",
      "booking.success.saved": "Час збережено в цьому браузері.",
      "booking.reservation.title": "Ваше бронювання",
      "booking.cancel": "Скасувати бронь",
      "booking.newBooking": "Нове бронювання",
      "booking.footer.lookupTitle": "Уже є бронювання?",
      "booking.footer.phonePlaceholder": "Ваш телефон",
      "booking.footer.find": "Знайти",
      "booking.error.lookupFailed": "Немає активного бронювання на цей телефон.",
      "booking.error.overlap": "Цей час уже зайнято.",
      "booking.error.failed": "Помилка",
      "booking.slugMissing": "Не вказано slug закладу. Відкрийте посилання з кабінету.",
      "booking.notFound": "Заклад не знайдено.",
    },
    en: {
      "locale.uk": "UK",
      "locale.en": "EN",
      "nav.home": "Home",
      "dash.nav.home": "Today",
      "dash.nav.reservations": "Reservations",
      "dash.nav.analytics": "Analytics",
      "dash.nav.logout": "Log out",
      "home.title": "Rent",
      "home.subtitle":
        "Simple booking in the browser — data stays on this device only (localStorage).",
      "home.f1": "Schedules",
      "home.f2": "Slot capacity",
      "home.f3": "No Node.js server",
      "home.f4": "Works on GitHub Pages",
      "home.cta.signIn": "Sign in",
      "home.cta.register": "Create owner account",
      "home.cta.admin": "Admin panel",
      "home.cta.dashboard": "Dashboard",
      "home.cta.createBusiness": "Create business",
      "home.note":
        "This static build runs offline in the browser (localStorage). There is no online payment.",
      "auth.login.title": "Sign in",
      "auth.login.continue": "Continue",
      "auth.login.noAccount": "No account?",
      "auth.login.register": "Register",
      "auth.register.title": "Create account",
      "auth.register.submit": "Register",
      "auth.register.haveAccount": "Already have an account?",
      "auth.register.signIn": "Sign in",
      "auth.field.email": "Email",
      "auth.field.password": "Password",
      "auth.adminAccount": "Register as admin (demo)",
      "auth.error.exists": "An account with this email already exists.",
      "auth.error.bad": "Invalid email or password.",
      "dash.today.title": "Today",
      "dash.today.count": "{{n}} reservations",
      "dash.today.empty": "No reservations yet. Add a service and share your booking link.",
      "dash.link.addService": "➕ Add service",
      "dash.link.schedule": "📅 Schedule",
      "dash.copy.link": "🔗 Copy booking link",
      "dash.copy.copied": "Copied",
      "dash.copy.qr": "Download QR",
      "dash.back": "Back",
      "reservations.title": "Reservations",
      "reservations.subtitle": "Today and upcoming",
      "reservations.empty": "No upcoming reservations.",
      "schedule.title": "Schedule",
      "schedule.subtitle": "Default is 09:00–18:00 every day. Toggle days off or change times.",
      "schedule.day0": "Sun",
      "schedule.day1": "Mon",
      "schedule.day2": "Tue",
      "schedule.day3": "Wed",
      "schedule.day4": "Thu",
      "schedule.day5": "Fri",
      "schedule.day6": "Sat",
      "analytics.title": "Analytics",
      "analytics.totalBookings": "Total confirmed bookings",
      "analytics.today": "Today",
      "analytics.cancellations": "Cancelled",
      "analytics.topService": "Top service",
      "serviceNew.title": "Add service",
      "serviceNew.name": "Name",
      "serviceNew.duration": "Duration (minutes)",
      "serviceNew.price": "Price (optional)",
      "serviceNew.placeholder.name": "Haircut",
      "serviceNew.placeholder.price": "500",
      "serviceNew.hint": "Saved services appear on your public booking page.",
      "serviceNew.submit": "Save service",
      "ownerRow.cancel": "Cancel",
      "ownerRow.move": "Move",
      "ownerRow.close": "Close",
      "common.save": "Save",
      "profile.title": "Store profile",
      "profile.storeName": "Store name",
      "profile.description": "Description",
      "profile.descriptionPlaceholder": "What you offer…",
      "profile.mainAddress": "Main address",
      "profile.portfolio.hint": "Portfolio image URLs (one per line)",
      "profile.save": "Save profile",
      "business.create.title": "Create your business",
      "business.create.intro":
        "One step — default hours (9–18) and an empty service list.",
      "business.field.name": "Business name",
      "business.field.phone": "Phone",
      "business.field.address": "Address (optional)",
      "business.submit": "Create and start",
      "admin.businessesTitle": "Businesses",
      "admin.searchHint": "Search by name, slug, or phone",
      "admin.search": "Search",
      "admin.openBooking": "Open booking",
      "admin.reservations": "Reservations",
      "admin.none": "No matches.",
      "admin.resTitle": "Business reservations",
      "telegram.title": "Telegram (static build)",
      "telegram.static":
        "Bot reminders need a server webhook. You can still store a Chat ID in profile data as a note.",
      "telegram.field.chatId": "Telegram Chat ID (optional)",
      "booking.tagline": "Book in a few steps",
      "booking.servicesTitle": "Services",
      "booking.services.empty": "No services yet.",
      "booking.back": "← Back",
      "booking.pickTime": "Pick a time",
      "booking.pickDay": "Day",
      "booking.almostThere": "Almost there",
      "booking.label.name": "Name",
      "booking.label.phone": "Phone",
      "booking.book.submit": "Book",
      "booking.success.title": "Booking confirmed",
      "booking.success.saved": "Your slot is stored in this browser.",
      "booking.reservation.title": "Your reservation",
      "booking.cancel": "Cancel booking",
      "booking.newBooking": "New booking",
      "booking.footer.lookupTitle": "Already booked?",
      "booking.footer.phonePlaceholder": "Your phone",
      "booking.footer.find": "Find",
      "booking.error.lookupFailed": "No active reservation for this phone.",
      "booking.error.overlap": "That time is already taken.",
      "booking.error.failed": "Something went wrong",
      "booking.slugMissing": "Missing business slug. Open the link from your dashboard.",
      "booking.notFound": "Business not found.",
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
      var l = btn.getAttribute("data-lang");
      btn.setAttribute("aria-pressed", l === lang ? "true" : "false");
    });
    try {
      var ev = new CustomEvent("rent-lang-change", { detail: { lang: lang } });
      document.dispatchEvent(ev);
    } catch (e) {}
  }

  function t(lang, key, vars) {
    var raw = (DICT[lang] && DICT[lang][key]) || (DICT.en && DICT.en[key]) || key;
    if (vars && typeof raw === "string") {
      Object.keys(vars).forEach(function (k) {
        raw = raw.split("{{" + k + "}}").join(String(vars[k]));
      });
    }
    return raw;
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
  }

  function initLocaleSwitcher() {
    document.querySelectorAll(".locale-switch button[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
      });
    });
    setLang(getLang());
  }

  global.RentI18n = {
    getLang: getLang,
    setLang: setLang,
    t: t,
    apply: apply,
    initLocaleSwitcher: initLocaleSwitcher,
    DICT: DICT,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLocaleSwitcher);
  } else {
    initLocaleSwitcher();
  }
})(typeof window !== "undefined" ? window : this);
