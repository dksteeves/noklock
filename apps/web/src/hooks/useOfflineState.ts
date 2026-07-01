// @version 0.1.0 @date 2026-05-30
// Detect whether the browser is offline OR the app is airgapped. Either
// signals "no network is happening right now", which is the mood signal
// the vizzes use to swap palette + show an OFFLINE pill.
//
// Listens to:
//   - window 'online' / 'offline' events (navigator.onLine)
//   - airgap-manager change events (entering / leaving airgap)

import { useEffect, useState } from "react";
import { isAirgapped, isBrowserOnline, subscribeAirgap } from "../lib/airgap-manager.js";

export interface OfflineState {
  readonly offline: boolean;
  readonly airgapped: boolean;
  readonly networkOff: boolean;
}

export function useOfflineState(): OfflineState {
  const [state, setState] = useState<OfflineState>(() => snapshot());

  useEffect(() => {
    const refresh = (): void => setState(snapshot());
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    const unsub = subscribeAirgap(refresh);
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      unsub();
    };
  }, []);

  return state;
}

function snapshot(): OfflineState {
  const online = isBrowserOnline();
  const airgapped = isAirgapped();
  return {
    offline: !online,
    airgapped,
    networkOff: !online || airgapped,
  };
}
