// @version 0.1.0 @date 2026-05-22
// Zero-PII heartbeat reminder (Daniel 2026-05-22). Instead of collecting an
// owner email (which would break the zero-PII promise), we generate a RECURRING
// calendar reminder the user adds to their OWN calendar(s) — nothing leaves the
// device, we store + send nothing. Two paths so it works on every calendar:
//   • a downloadable .ics (Apple Calendar, Outlook desktop, Thunderbird, any)
//   • a Google Calendar "add event" deep link
// The on-chain selfHeartbeat + the grace window remain the real guarantee; this
// just reduces "I forgot" risk.

export type ReminderInterval = "weekly" | "fortnightly" | "monthly";

const SUMMARY = "Send your NoKLock heartbeat";
const DETAILS =
  "Open noklock.app/heartbeat and check in (or send an on-chain selfHeartbeat) to keep your dead-man's switch from firing. Your next-of-kin inherit only if you go silent past your grace period. NoKLock holds no email and sent you nothing — this reminder lives only in your own calendar.";
const URL = "https://noklock.app/heartbeat";

const OFFSET_DAYS: Record<ReminderInterval, number> = { weekly: 7, fortnightly: 14, monthly: 30 };

function rrule(interval: ReminderInterval): string {
  return interval === "weekly" ? "FREQ=WEEKLY;INTERVAL=1"
    : interval === "fortnightly" ? "FREQ=WEEKLY;INTERVAL=2"
    : "FREQ=MONTHLY;INTERVAL=1";
}

const p2 = (n: number): string => String(n).padStart(2, "0");

/** First-occurrence local date (one interval from today), 09:00 local. */
function firstStart(interval: ReminderInterval): { y: number; m: number; d: number } {
  const dt = new Date();
  dt.setDate(dt.getDate() + OFFSET_DAYS[interval]);
  return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() };
}

function ymd({ y, m, d }: { y: number; m: number; d: number }): string {
  return `${y}${p2(m)}${p2(d)}`;
}

function utcStamp(): string {
  const n = new Date();
  return `${n.getUTCFullYear()}${p2(n.getUTCMonth() + 1)}${p2(n.getUTCDate())}T${p2(n.getUTCHours())}${p2(n.getUTCMinutes())}${p2(n.getUTCSeconds())}Z`;
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Build a recurring-reminder .ics. Floating local 09:00 start so it fires at
 *  9am wherever the user is. CRLF line endings per RFC 5545. */
export function buildHeartbeatIcs(interval: ReminderInterval): string {
  const s = firstStart(interval);
  const day = ymd(s);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NoKLock//Heartbeat Reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:heartbeat-${Date.now()}@noklock.app`,
    `DTSTAMP:${utcStamp()}`,
    `DTSTART:${day}T090000`,
    `DTEND:${day}T091500`,
    `RRULE:${rrule(interval)}`,
    `SUMMARY:${icsEscape(SUMMARY)}`,
    `DESCRIPTION:${icsEscape(DETAILS)}`,
    `URL:${URL}`,
    "BEGIN:VALARM",
    "TRIGGER:PT0S",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(SUMMARY)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/** Google Calendar "add recurring event" deep link. */
export function googleCalendarUrl(interval: ReminderInterval): string {
  const day = ymd(firstStart(interval));
  const dates = `${day}T090000Z/${day}T091500Z`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: SUMMARY,
    details: DETAILS,
    location: URL,
    dates,
    recur: `RRULE:${rrule(interval)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Trigger a client-side .ics download — nothing leaves the device. */
export function downloadHeartbeatIcs(interval: ReminderInterval): void {
  try {
    const blob = new Blob([buildHeartbeatIcs(interval)], { type: "text/calendar;charset=utf-8" });
    const url = URL_create(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `noklock-heartbeat-reminder-${interval}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL_revoke(url);
  } catch {
    /* download blocked — the Google link + copy fallback still work */
  }
}

// Indirection so the URL global isn't shadowed by our `URL` string const above.
function URL_create(blob: Blob): string { return window.URL.createObjectURL(blob); }
function URL_revoke(u: string): void { window.URL.revokeObjectURL(u); }
