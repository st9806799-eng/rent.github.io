import type { Locale } from "./config";

export const ukMessages = {
  "booking.tagline": "Забронюйте за кілька кроків",
  "booking.error.bookFailed": "Не вдалося забронювати",
  "booking.error.failed": "Помилка",
  "booking.error.lookupFailed": "Немає активного бронювання на цей телефон.",
  "booking.reservation.title": "Ваше бронювання",
  "booking.confirmBooking": "Підтвердити бронювання",
  "booking.changeTime": "Змінити час",
  "booking.cancel": "Скасувати",
  "booking.newBooking": "Нове бронювання",
  "booking.services.empty": "Послуг ще немає. Загляньте пізніше.",
  "booking.services.srOnly": "Послуги",
  "booking.back": "← Назад",
  "booking.pickTime": "Оберіть час",
  "booking.loadingTimes": "Завантаження…",
  "booking.almostThere": "Майже готово",
  "booking.label.name": "Ім’я",
  "booking.label.phone": "Телефон",
  "booking.book.submit": "Забронювати",
  "booking.success.title": "Бронь підтверджено",
  "booking.success.saved":
    "Ми зберегли час. Поверніться на цю сторінку пізніше — зможете змінити або скасувати бронь.",
  "booking.success.telegramHint":
    "Натисніть кнопку нижче, щоб відкрити Telegram-бота — там можна увімкнути нагадування приблизно за 2 години до візиту.",
  "booking.done": "Готово",
  "booking.reschedule.newTime": "Новий час",
  "booking.footer.lookupTitle": "Уже є бронювання?",
  "booking.footer.phonePlaceholder": "Ваш телефон",
  "booking.footer.find": "Знайти",
  "booking.modal.title": "Підтвердження бронювання",
  "booking.modal.body":
    "Відкрийте Telegram-бота за посиланням нижче, щоб отримати підтвердження та увімкнути нагадування перед візитом.",
  "booking.modal.openTelegram": "Відкрити Telegram",
  "booking.modal.close": "Закрити",
  "booking.durationFmt": "{{n}} хв ·",

  "home.title": "Rent",
  "home.subtitle": "Простий інтерфейс, потужний рушій — бронювання за кілька дотиків.",
  "home.feature.schedules": "Розклади",
  "home.feature.capacity": "Місткість",
  "home.feature.verification": "Верифікація (згодом)",
  "home.feature.resources": "Ресурси (згодом)",
  "home.cta.signIn": "Увійти",
  "home.cta.admin": "Адмін",
  "home.cta.dashboard": "Відкрити кабінет",
  "home.cta.createBusiness": "Створити бізнес",
  "home.cta.register": "Створити акаунт власника",

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

  "dash.nav.reservations": "Бронювання",
  "dash.nav.analytics": "Аналітика",
  "dash.nav.logout": "Вийти",

  "dash.today.title": "Сьогодні",
  "dash.today.count": "{{n}} бронювань",
  "dash.today.empty":
    "Поки немає бронювань. Додайте послугу та поділіться посиланням.",
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
  "analytics.totalBookings": "Усього бронювань",
  "analytics.today": "Сьогодні",
  "analytics.cancellations": "Скасування",
  "analytics.topService": "Топ-послуга",

  "serviceNew.title": "Додати послугу",
  "serviceNew.name": "Назва",
  "serviceNew.duration": "Тривалість (хв)",
  "serviceNew.price": "Ціна (необов’язково)",
  "serviceNew.placeholder.name": "Стрижка",
  "serviceNew.placeholder.price": "25.00",
  "serviceNew.hint": "Збережені послуги одразу доступні для броню на публічній сторінці.",

  "ownerRow.cancel": "Скасувати",
  "ownerRow.move": "Перенести",
  "ownerRow.close": "Закрити",

  "common.save": "Зберегти",

  "profile.title": "Профіль магазину",
  "profile.storeName": "Назва магазину",
  "profile.description": "Опис",
  "profile.descriptionPlaceholder": "Чим займаєтесь, послуги, особливості…",
  "profile.mainAddress": "Основна адреса",
  "profile.map.pickHint": "Вкажіть точку на карті (натисніть по карті)",
  "profile.map.addressFromPoint": "Адреса за точкою",
  "profile.portfolio.photos": "Фото робіт / портфоліо",
  "profile.portfolio.remove": "×",
  "profile.preview": "Прев’ю для клієнта",

  "business.create.title": "Створіть бізнес",
  "business.create.intro":
    "Один крок — додаємо точку, години за замовчуванням (9–18) і порожній список послуг.",
  "business.field.name": "Назва бізнесу",
  "business.field.phone": "Телефон",
  "business.field.address": "Адреса (необов’язково)",
  "business.placeholder.name": "Studio North",
  "business.placeholder.phone": "+380 …",
  "business.placeholder.address": "Місто, вулиця",
  "business.submit": "Створити й почати",

  "admin.nav.title": "Адмін",
  "admin.nav.home": "Головна",

  "telegram.title": "Сповіщення в Telegram",
  "telegram.botOff":
    "Спільний бот ще не підключений. Його один раз створює адміністратор сайту в @BotFather і додає в .env на сервері TELEGRAM_BOT_TOKEN та TELEGRAM_BOT_USERNAME. Один бот для всіх закладів і клієнтів — окремий бот власнику не потрібен.",
  "telegram.botOn":
    "Підключений один спільний бот на весь сервіс. Вам не потрібно створювати свого — вкажіть лише ваш особистий Chat ID: на нього приходитимуть сповіщення про броні саме вашого бізнесу. Клієнти для нагадувань натискають кнопку на сторінці броні — це той самий бот.",
  "telegram.chatIdHint":
    "Свій Chat ID можна подивитися, написавши боту @userinfobot /start — вставте число нижче.",
  "telegram.field.chatId": "Ваш Telegram Chat ID",
  "telegram.placeholder.chatId": "наприклад 123456789",
  "telegram.save": "Зберегти",
  "telegram.faq":
    "Чому клієнту не приходить підтвердження з бота: сервер має отримувати події від Telegram через вебхук. На localhost Telegram достукатися не може — потрібен публічний HTTPS (деплой на Vercel тощо) або тунель (ngrok, cloudflared). Потім один раз: npm run telegram:set-webhook -- https://ваш-домен. Перевірка: у dev відкрийте /api/telegram/webhook у браузері — побачите getWebhookInfo. Якщо в .env задано TELEGRAM_WEBHOOK_SECRET, але вебхук ставили без цього секрета — запити повертатимуть 401; або очистіть змінну, або перезапустіть telegram:set-webhook. Нагадування клієнтам: cron на GET …/api/cron/reminders з Authorization: Bearer CRON_SECRET.",
};

export type MessageKey = keyof typeof ukMessages;

export const enMessages: Record<MessageKey, string> = {
  "booking.tagline": "Book in a few taps",
  "booking.error.bookFailed": "Could not book",
  "booking.error.failed": "Something went wrong",
  "booking.error.lookupFailed": "No active reservation for this phone.",
  "booking.reservation.title": "Your reservation",
  "booking.confirmBooking": "Confirm booking",
  "booking.changeTime": "Change time",
  "booking.cancel": "Cancel",
  "booking.newBooking": "New booking",
  "booking.services.empty": "No services yet. Check back soon.",
  "booking.services.srOnly": "Services",
  "booking.back": "← Back",
  "booking.pickTime": "Pick a time",
  "booking.loadingTimes": "Loading…",
  "booking.almostThere": "Almost there",
  "booking.label.name": "Name",
  "booking.label.phone": "Phone",
  "booking.book.submit": "Book",
  "booking.success.title": "Booking confirmed",
  "booking.success.saved":
    "We saved your slot. Come back later to reschedule or cancel.",
  "booking.success.telegramHint":
    "Tap the button below to open the Telegram bot — you can enable reminders about 2 hours before your visit.",
  "booking.done": "Done",
  "booking.reschedule.newTime": "New time",
  "booking.footer.lookupTitle": "Already booked?",
  "booking.footer.phonePlaceholder": "Your phone",
  "booking.footer.find": "Find",
  "booking.modal.title": "Confirm booking",
  "booking.modal.body":
    "Open the Telegram bot using the link below to get confirmation and enable reminders before your visit.",
  "booking.modal.openTelegram": "Open Telegram",
  "booking.modal.close": "Close",
  "booking.durationFmt": "{{n}} min ·",

  "home.title": "Rent",
  "home.subtitle": "Simple UI, powerful engine — booking in a few taps.",
  "home.feature.schedules": "Schedules",
  "home.feature.capacity": "Capacity",
  "home.feature.verification": "Verification (future)",
  "home.feature.resources": "Resources (future)",
  "home.cta.signIn": "Sign in",
  "home.cta.admin": "Admin",
  "home.cta.dashboard": "Open dashboard",
  "home.cta.createBusiness": "Create business",
  "home.cta.register": "Create owner account",

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

  "dash.nav.reservations": "Reservations",
  "dash.nav.analytics": "Analytics",
  "dash.nav.logout": "Log out",

  "dash.today.title": "Today",
  "dash.today.count": "{{n}} reservations",
  "dash.today.empty": "No reservations yet. Add a service and share your link.",
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
  "analytics.totalBookings": "Total bookings",
  "analytics.today": "Today",
  "analytics.cancellations": "Cancellations",
  "analytics.topService": "Top service",

  "serviceNew.title": "Add service",
  "serviceNew.name": "Name",
  "serviceNew.duration": "Duration (minutes)",
  "serviceNew.price": "Price (optional)",
  "serviceNew.placeholder.name": "Haircut",
  "serviceNew.placeholder.price": "25.00",
  "serviceNew.hint": "Saved services are immediately bookable on your public page.",

  "ownerRow.cancel": "Cancel",
  "ownerRow.move": "Move",
  "ownerRow.close": "Close",

  "common.save": "Save",

  "profile.title": "Store profile",
  "profile.storeName": "Store name",
  "profile.description": "Description",
  "profile.descriptionPlaceholder": "What you do, key services, unique details…",
  "profile.mainAddress": "Main address",
  "profile.map.pickHint": "Pick map location (click on map)",
  "profile.map.addressFromPoint": "Address from point",
  "profile.portfolio.photos": "Portfolio photos",
  "profile.portfolio.remove": "×",
  "profile.preview": "Preview as client",

  "business.create.title": "Create your business",
  "business.create.intro":
    "One step — we add a branch, default hours (9–18), and an empty service list.",
  "business.field.name": "Business name",
  "business.field.phone": "Phone",
  "business.field.address": "Address (optional)",
  "business.placeholder.name": "Studio North",
  "business.placeholder.phone": "+1 …",
  "business.placeholder.address": "City, street",
  "business.submit": "Create & start",

  "admin.nav.title": "Admin",
  "admin.nav.home": "Home",

  "telegram.title": "Telegram notifications",
  "telegram.botOff":
    "The shared bot is not connected yet. A site admin creates it once in @BotFather and adds TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME to the server .env. One bot for all businesses and clients — owners don’t need their own bot.",
  "telegram.botOn":
    "One shared bot is enabled for the whole service. You don’t need to create your own — just enter your personal Chat ID for alerts about your business. Clients use the same bot for reminders from the booking page.",
  "telegram.chatIdHint":
    "Get your Chat ID by messaging @userinfobot with /start — paste the number below.",
  "telegram.field.chatId": "Your Telegram Chat ID",
  "telegram.placeholder.chatId": "e.g. 123456789",
  "telegram.save": "Save",
  "telegram.faq":
    "Why clients don’t get bot confirmations: the server must receive Telegram events via webhook. On localhost Telegram can’t reach you — use public HTTPS (e.g. Vercel) or a tunnel (ngrok, cloudflared). Then run once: npm run telegram:set-webhook -- https://your-domain. Check: in dev open /api/telegram/webhook in the browser — you’ll see getWebhookInfo. If TELEGRAM_WEBHOOK_SECRET is set in .env but the webhook was set without it, requests return 401; clear the var or re-run telegram:set-webhook. Client reminders: cron GET …/api/cron/reminders with Authorization: Bearer CRON_SECRET.",
};

export const dictionaries: Record<Locale, Record<MessageKey, string>> = {
  uk: ukMessages,
  en: enMessages,
};

export function createTranslator(dict: Record<MessageKey, string>) {
  return function t(key: MessageKey, vars?: Record<string, string | number>): string {
    let s = dict[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{{${k}}}`, String(v));
      }
    }
    return s;
  };
}

export type TranslateFn = ReturnType<typeof createTranslator>;
