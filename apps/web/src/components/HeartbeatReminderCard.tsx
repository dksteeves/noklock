// @version 0.1.0 @date 2026-05-22
// Zero-PII heartbeat reminder card (Daniel 2026-05-22). Lets the user add a
// recurring "send your heartbeat" reminder to their OWN calendar(s) — a
// downloadable .ics (Apple / Outlook / any) plus a Google Calendar deep link.
// NoKLock holds no email and sends nothing; everything is generated locally.

import { useState } from "react";
import { downloadHeartbeatIcs, googleCalendarUrl, type ReminderInterval } from "../lib/calendarReminder.js";

const INTERVALS: { id: ReminderInterval; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "fortnightly", label: "Fortnightly" },
  { id: "monthly", label: "Monthly" },
];

export function HeartbeatReminderCard(): JSX.Element {
  const [interval, setInterval] = useState<ReminderInterval>("fortnightly");
  const [downloaded, setDownloaded] = useState(false);

  return (
    <div className="card">
      <h3 className="font-bold font-display mb-1"><span className="grad">Never forget a heartbeat</span></h3>
      <p className="text-sm text-text-on-dark/85 mb-3">
        Add a recurring reminder to <strong>your own</strong> calendar. We don't take your email and send nothing —
        the reminder lives entirely in your calendar. Pick a cadence comfortably shorter than your grace period so
        you always have time to check in.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm text-text-muted">Remind me:</span>
        {INTERVALS.map((iv) => (
          <button
            key={iv.id}
            onClick={() => setInterval(iv.id)}
            className={`text-sm px-3 py-1.5 rounded border ${interval === iv.id ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-semibold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}
          >
            {iv.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { downloadHeartbeatIcs(interval); setDownloaded(true); setTimeout(() => setDownloaded(false), 2500); }}
          className="btn btn-primary text-sm"
        >
          {downloaded ? "Downloaded ✓" : "Download .ics (Apple · Outlook · any)"}
        </button>
        <a
          href={googleCalendarUrl(interval)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary text-sm"
        >
          Add to Google Calendar ↗
        </a>
      </div>

      <p className="text-[11px] text-text-muted mt-3">
        Add it to as many calendars as you like — download the .ics into Apple Calendar / Outlook / Thunderbird,
        and use the Google link for a Google account. A reminder helps, but the on-chain self-heartbeat and your
        chosen grace window are the real guarantee — this just cuts the "I forgot" risk while keeping zero personal
        data with us.
      </p>
    </div>
  );
}
