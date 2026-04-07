import { formatDateTimeUk, sendTelegramMessage } from "./telegram";

export async function notifyOwnerNewBooking(input: {
  ownerChatId: string | null | undefined;
  businessName: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  startIso: string;
}) {
  if (!input.ownerChatId) return;
  const when = formatDateTimeUk(input.startIso);
  await sendTelegramMessage(
    input.ownerChatId,
    [
      "<b>Нова бронь</b>",
      `🏢 ${escapeHtml(input.businessName)}`,
      `👤 ${escapeHtml(input.clientName)} · ${escapeHtml(input.clientPhone)}`,
      `📌 ${escapeHtml(input.serviceName)}`,
      `🕐 ${escapeHtml(when)}`,
    ].join("\n")
  );
}

export async function notifyOwnerBookingCancelled(input: {
  ownerChatId: string | null | undefined;
  businessName: string;
  clientName: string;
  serviceName: string;
  startIso: string;
}) {
  if (!input.ownerChatId) return;
  const when = formatDateTimeUk(input.startIso);
  await sendTelegramMessage(
    input.ownerChatId,
    [
      "<b>Скасовано бронь</b>",
      `🏢 ${escapeHtml(input.businessName)}`,
      `👤 ${escapeHtml(input.clientName)}`,
      `📌 ${escapeHtml(input.serviceName)}`,
      `🕐 було: ${escapeHtml(when)}`,
    ].join("\n")
  );
}

export async function notifyOwnerBookingMoved(input: {
  ownerChatId: string | null | undefined;
  businessName: string;
  clientName: string;
  serviceName: string;
  oldStartIso: string;
  newStartIso: string;
}) {
  if (!input.ownerChatId) return;
  await sendTelegramMessage(
    input.ownerChatId,
    [
      "<b>Перенесено час</b>",
      `🏢 ${escapeHtml(input.businessName)}`,
      `👤 ${escapeHtml(input.clientName)}`,
      `📌 ${escapeHtml(input.serviceName)}`,
      `🕐 ${escapeHtml(formatDateTimeUk(input.oldStartIso))} → ${escapeHtml(formatDateTimeUk(input.newStartIso))}`,
    ].join("\n")
  );
}

/** Після переходу за посиланням «Нагадування в Telegram» — підтвердження броні + підписка на нагадування */
export async function notifyClientBookingConfirmed(input: {
  clientChatId: string;
  businessName: string;
  serviceName: string;
  clientName: string;
  startIso: string;
}) {
  const when = formatDateTimeUk(input.startIso);
  await sendTelegramMessage(
    input.clientChatId,
    [
      "<b>Бронь підтверджено</b>",
      `🏢 ${escapeHtml(input.businessName)}`,
      `📌 ${escapeHtml(input.serviceName)}`,
      `👤 ${escapeHtml(input.clientName)}`,
      `🕐 ${escapeHtml(when)}`,
      "",
      "Нагадування надішлемо сюди приблизно за <b>24 години</b> до візиту.",
    ].join("\n")
  );
}

export async function notifyClientReminder(input: {
  clientChatId: string;
  businessName: string;
  serviceName: string;
  startIso: string;
}) {
  const when = formatDateTimeUk(input.startIso);
  await sendTelegramMessage(
    input.clientChatId,
    [
      "<b>Нагадування про візит</b>",
      `🏢 ${escapeHtml(input.businessName)}`,
      `📌 ${escapeHtml(input.serviceName)}`,
      `🕐 ${escapeHtml(when)}`,
      "",
      "До зустрічі!",
    ].join("\n")
  );
}

export async function notifyClientBookingCancelledByOwner(input: {
  clientChatId: string;
  businessName: string;
  serviceName: string;
  startIso: string;
}) {
  const when = formatDateTimeUk(input.startIso);
  await sendTelegramMessage(
    input.clientChatId,
    [
      "<b>Бронь скасовано</b>",
      `🏢 ${escapeHtml(input.businessName)}`,
      `📌 ${escapeHtml(input.serviceName)}`,
      `🕐 було: ${escapeHtml(when)}`,
    ].join("\n")
  );
}

export async function notifyClientBookingRescheduledByOwner(input: {
  clientChatId: string;
  businessName: string;
  serviceName: string;
  newStartIso: string;
}) {
  const when = formatDateTimeUk(input.newStartIso);
  await sendTelegramMessage(
    input.clientChatId,
    [
      "<b>Час візиту змінено</b>",
      `🏢 ${escapeHtml(input.businessName)}`,
      `📌 ${escapeHtml(input.serviceName)}`,
      `🕐 Новий час: ${escapeHtml(when)}`,
    ].join("\n")
  );
}

export async function notifyClientBookingRescheduledSelf(input: {
  clientChatId: string;
  businessName: string;
  serviceName: string;
  newStartIso: string;
}) {
  const when = formatDateTimeUk(input.newStartIso);
  await sendTelegramMessage(
    input.clientChatId,
    [
      "<b>Ви змінили час візиту</b>",
      `🏢 ${escapeHtml(input.businessName)}`,
      `📌 ${escapeHtml(input.serviceName)}`,
      `🕐 Новий час: ${escapeHtml(when)}`,
    ].join("\n")
  );
}

export async function notifyClientBookingCancelledSelf(input: {
  clientChatId: string;
  businessName: string;
  serviceName: string;
  startIso: string;
}) {
  const when = formatDateTimeUk(input.startIso);
  await sendTelegramMessage(
    input.clientChatId,
    [
      "<b>Бронь скасовано</b>",
      `🏢 ${escapeHtml(input.businessName)}`,
      `📌 ${escapeHtml(input.serviceName)}`,
      `🕐 було: ${escapeHtml(when)}`,
      "",
      "Скасовано з вашого запиту на сайті.",
    ].join("\n")
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
