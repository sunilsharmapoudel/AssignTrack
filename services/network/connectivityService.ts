import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// ─── Check Connectivity ───────────────────────────────────────────────────────

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return !!(state.isConnected && state.isInternetReachable);
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

export function subscribeToConnectivity(
  callback: (online: boolean) => void
): () => void {
  return NetInfo.addEventListener((state: NetInfoState) => {
    callback(!!(state.isConnected && state.isInternetReachable));
  });
}

// ─── Connection Type ──────────────────────────────────────────────────────────

export async function getConnectionType(): Promise<string> {
  const state = await NetInfo.fetch();
  return state.type ?? 'unknown';
}
