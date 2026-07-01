// @version 0.5.0 @date 2026-06-04
// 0.5.0 — Daniel 2026-06-04: STRIP all the orchestration that wasn't fixing
//         it. Removed IntersectionObserver gating — the homepage video is
//         above-the-fold and the 25% threshold on a 0-height-until-metadata
//         element was racey. Set preload="auto" so the browser actually
//         fetches the file (was "metadata" since 0.3.0 which only loaded
//         the codec header — onCanPlay needs the FIRST FRAMES and that
//         requires more than metadata). Surface a VISIBLE error banner
//         under the player when the video errors out, so a missing file /
//         wrong MIME / blocked URL is no longer silent. Removed the
//         onCanPlay fallback (was 0.4.0 belt-and-braces) — with preload=
//         auto + autoPlay attribute + an explicit play() in a single
//         mount-effect the bare browser behaviour handles it; less code
//         = fewer race conditions.
// @version 0.4.0 @date 2026-06-04
// 0.4.0 — Daniel 2026-06-04: video STILL not playing on prod after 0.3.0
//         preload fix. Adding onCanPlay handler that explicitly calls play()
//         the moment the browser has enough data. Belt-and-braces alongside
//         the static autoPlay attribute. Browsers that don't honor the bare
//         attribute on SPA-mounted elements will respect the explicit play()
//         call when muted+playsInline are set.
// @version 0.3.0 @date 2026-06-03
// 0.3.0 — Daniel 2026-06-03: video still not autoplaying on prod. Fix: preload
//         now always "metadata" instead of being gated by IntersectionObserver
//         inView state. Browsers need at least metadata loaded before autoPlay
//         can fire — preload="none" was blocking the attribute even though the
//         attribute itself was static (0.2.0 fix). Tiny bandwidth cost on cold
//         load; reliable autoplay.
// @version 0.2.0 @date 2026-06-03
// 0.2.0 — Daniel 2026-06-03: autoplay-on-load fix per investigation. autoPlay
//          attribute now static (browsers grant permission at parse-time, not
//          runtime). preload still lazy-gated via inView. Play-promise
//          rejections now console.warn instead of silent.
// 0.1.0 — Daniel 2026-06-02: NEW component. Drop-in <video> replacement with:
//          (1) IntersectionObserver-gated loading (preload="none" until in
//              viewport, then swaps to "metadata" + autoplays).
//          (2) Multi-source <source> list — pass [{src,type}, ...] in priority
//              order (the browser picks the first it can play). URLs should
//              be url-encoded by the caller if they contain spaces.
//          (3) Hover/focus-within control bar overlay (bottom-centre, fades
//              in 200ms on mouseenter/focus, fades out on mouseleave).
//              Buttons: ⏮ rewind-to-start · ⏪ -5s · ⏯ play/pause toggle
//              (icon swaps based on state) · ⏩ +5s.
//          (4) Keyboard support when the video has focus: Space toggles
//              play/pause, Arrow Left = -5s, Arrow Right = +5s.
//          (5) Per-button aria-label + title for screen readers.
//          (6) Pure React + native HTML5 video API — no third-party player,
//              no css framework lock-in beyond Tailwind utility classes.
//          Used by routes/Landing.tsx 0.20.0 to host the end-to-end pipeline
//          MP4/WebM on the homepage.

import { useEffect, useMemo, useRef, useState } from "react";

export type VideoSource = { src: string; type: string };

type Props = {
  sources: ReadonlyArray<VideoSource>;
  poster: string;
  ariaLabel: string;
};

export function VideoWithControls({ sources, poster, ariaLabel }: Props): JSX.Element {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  // 0.5.0 — visible failure surface. When the <video> element fires onError
  // we record the MediaError + the failing source URL and render a banner
  // under the poster instead of silently leaving the user with a frozen
  // poster + dead controls.
  const [videoError, setVideoError] = useState<string | null>(null);

  // Mount-effect: bind play/pause listeners so the toggle icon stays in
  // sync, then attempt the autoplay once. The browser's autoPlay attribute
  // is the primary mechanism — this is the safety-net for SPA-mounted
  // elements where the attribute is sometimes ignored. preload="auto"
  // (set on the <video> below) ensures actual frame data arrives, not
  // just metadata, so play() has something to play.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = (): void => setIsPlaying(true);
    const onPause = (): void => setIsPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch((err: unknown) => {
        const e = err as { name?: string; message?: string } | null;
        // eslint-disable-next-line no-console
        console.warn(
          "[VideoWithControls] play() rejected:",
          e?.name ?? "UnknownError",
          e?.message ?? String(err),
        );
      });
    }
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const handlers = useMemo(() => {
    function withVideo(fn: (v: HTMLVideoElement) => void): () => void {
      return () => {
        const v = videoRef.current;
        if (v) fn(v);
      };
    }
    return {
      rewind: withVideo((v) => {
        v.currentTime = 0;
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => undefined);
      }),
      back5: withVideo((v) => {
        v.currentTime = Math.max(0, v.currentTime - 5);
      }),
      fwd5: withVideo((v) => {
        const dur = isFinite(v.duration) ? v.duration : 0;
        v.currentTime = dur ? Math.min(dur, v.currentTime + 5) : v.currentTime + 5;
      }),
      toggle: withVideo((v) => {
        if (v.paused) {
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => undefined);
        } else {
          v.pause();
        }
      }),
    };
  }, []);

  // Keyboard support — Space = play/pause, Arrow Left/Right = ±5s. Active
  // only when focus is anywhere inside the wrapper (video, control buttons),
  // so we never hijack global Space / arrow keys.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      handlers.toggle();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlers.back5();
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handlers.fwd5();
      return;
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onFocus={() => setShowControls(true)}
      onBlur={(e) => {
        // Only collapse the bar when focus truly leaves the wrapper (e.g.
        // tabbing past the last button). Internal focus shuffling between
        // child buttons should NOT trigger a hide.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setShowControls(false);
        }
      }}
      onKeyDown={onKeyDown}
    >
      <video
        ref={videoRef}
        poster={poster}
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        tabIndex={0}
        className="w-full rounded-2xl shadow-2xl outline-none"
        aria-label={ariaLabel}
        onError={(e) => {
          const v = e.currentTarget;
          const err = v.error;
          // 0.5.0 — also stamp the URL of the source the browser was trying
          // last so the banner tells us WHICH file failed (multi-source list).
          const failedSrc = v.currentSrc || "(no currentSrc)";
          const msg = err
            ? `MediaError code=${err.code} message=${err.message || "(empty)"}`
            : "(no MediaError)";
          // eslint-disable-next-line no-console
          console.warn(
            "[VideoWithControls] <video> error:",
            msg,
            "src:",
            failedSrc,
          );
          setVideoError(`${msg} · src=${failedSrc}`);
        }}
      >
        {/* Multi-source list — the browser picks the first <source> it can
            play. Order matters: list the smallest acceptable codec FIRST
            (WebM 720p / WebM 480p) and the mp4 fallback LAST. */}
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      {/* Compact control bar — overlay at bottom-centre, fades in on hover
          / focus-within. Pointer-events allowed only when visible so the
          buttons aren't accidentally clickable while invisible. */}
      <div
        className={
          "absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center gap-1 " +
          "rounded-full border border-bg-surface bg-bg-deepest/85 backdrop-blur " +
          "px-2 py-1 shadow-lg transition-opacity duration-200 " +
          (showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
        aria-hidden={!showControls}
      >
        <ControlBtn
          onClick={handlers.rewind}
          ariaLabel="Rewind to start"
          title="Rewind to start"
          icon="⏮"
        />
        <ControlBtn
          onClick={handlers.back5}
          ariaLabel="Back 5 seconds"
          title="Back 5 seconds (Arrow Left)"
          icon="⏪"
        />
        <ControlBtn
          onClick={handlers.toggle}
          ariaLabel={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          icon={isPlaying ? "⏸" : "▶"}
        />
        <ControlBtn
          onClick={handlers.fwd5}
          ariaLabel="Forward 5 seconds"
          title="Forward 5 seconds (Arrow Right)"
          icon="⏩"
        />
      </div>

      {/* 0.5.0 — visible error banner. Renders ONLY when the browser fires
          onError on the <video>. Tells us exactly what failed (MediaError
          code + which source URL the browser was on) so a missing share-
          cards/ file on the server, a wrong MIME type, or a blocked URL
          is no longer invisible. */}
      {videoError !== null && (
        <div className="mt-2 rounded-md border border-red-500/50 bg-red-900/20 text-red-200 text-xs px-3 py-2 font-mono break-all">
          <span className="font-bold">Video failed to load:</span> {videoError}
        </div>
      )}
    </div>
  );
}

function ControlBtn({
  onClick,
  ariaLabel,
  title,
  icon,
}: {
  onClick: () => void;
  ariaLabel: string;
  title: string;
  icon: string;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={
        "inline-flex items-center justify-center w-8 h-8 rounded-full " +
        "text-text-on-dark/90 hover:text-accent-cyan hover:bg-accent-cyan/10 " +
        "focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 transition-colors text-sm"
      }
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}

export default VideoWithControls;
