// @version 0.1.0 @date 2026-05-13
//
// useDropbox — connection state + factory for a configured DropboxAdapter.
// Reads token from localStorage; returns a fresh adapter instance each call
// of `adapter()`. If the token isn't present, `isConnected` is false.

import { useEffect, useState } from "react";
import { DropboxAdapter } from "@soulchain/storage-adapters";
import { getToken, getAppKey, setToken, type CloudToken, type CloudAppKey } from "../lib/cloud-keys.js";

export interface UseDropboxState {
  readonly isConnected: boolean;
  readonly token: CloudToken | null;
  readonly appKey: CloudAppKey | null;
  readonly adapter: () => DropboxAdapter | null;
  readonly disconnect: () => void;
  readonly refresh: () => void;
}

export function useDropbox(): UseDropboxState {
  const [token, setTok] = useState<CloudToken | null>(() => getToken("dropbox"));
  const [appKey, setKey] = useState<CloudAppKey | null>(() => getAppKey("dropbox"));

  // Re-read on window focus + on storage events from other tabs.
  useEffect(() => {
    function reread(): void {
      setTok(getToken("dropbox"));
      setKey(getAppKey("dropbox"));
    }
    window.addEventListener("focus", reread);
    window.addEventListener("storage", reread);
    return () => {
      window.removeEventListener("focus", reread);
      window.removeEventListener("storage", reread);
    };
  }, []);

  return {
    isConnected: !!token,
    token,
    appKey,
    adapter: () => token ? new DropboxAdapter(token.accessToken) : null,
    disconnect: () => {
      setToken("dropbox", null);
      setTok(null);
    },
    refresh: () => {
      setTok(getToken("dropbox"));
      setKey(getAppKey("dropbox"));
    },
  };
}
