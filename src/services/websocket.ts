import { Platform } from 'react-native';
import type {
  MarketUpdate,
  WsMessage,
  ConnectionStatus,
  SetIntervalMessage,
  PairMeta,
} from '../types';

/**
 * HOST CONFIGURATION
 *
 *  Android Emulator  →  10.0.2.2   (host machine localhost)
 *  iOS Simulator     →  localhost
 *  Physical device   →  your LAN IP, e.g. 192.168.1.100
 */
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PORT = 4000;

export const WS_URL   = `ws://${HOST}:${PORT}/ws`;
export const REST_URL = `http://${HOST}:${PORT}`;

type UpdateCallback = (updates: MarketUpdate[]) => void;
type StatusCallback = (status: ConnectionStatus) => void;

const MIN_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;

export class MarketWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = MIN_RECONNECT_MS;
  private stopped = false;

  constructor(
    private readonly onUpdates: UpdateCallback,
    private readonly onStatus:  StatusCallback,
  ) {}

  start(): void {
    this.stopped = false;
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(1000, 'App stopped'); } catch {}
      this.ws = null;
    }
  }

  /** Sends a control message to adjust the backend emit interval in real time */
  sendInterval(intervalMs: number): void {
    if (this.ws && this.ws.readyState === 1 /* OPEN */) {
      const msg: SetIntervalMessage = { type: 'setInterval', intervalMs };
      this.ws.send(JSON.stringify(msg));
    }
  }

  private connect(): void {
    if (this.stopped) return;

    this.onStatus('connecting');
    console.log(`[WS] Connecting → ${WS_URL}`);

    try {
      // Use global.WebSocket to avoid any Metro/Hermes bundle-time resolution
      // issues with the WebSocket identifier being tree-shaken or shadowed.
      const WS = (globalThis as any).WebSocket as typeof WebSocket;
      this.ws = new WS(WS_URL);
    } catch (err) {
      console.error('[WS] Constructor threw:', err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[WS] ✅ Connected');
      this.reconnectDelay = MIN_RECONNECT_MS;
      this.onStatus('connected');
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as WsMessage;
        if (msg.type === 'marketUpdate' && Array.isArray(msg.updates)) {
          this.onUpdates(msg.updates);
        }
      } catch (err) {
        console.warn('[WS] Parse error:', err);
      }
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log(`[WS] Closed  code=${event.code}  clean=${event.wasClean}`);
      this.ws = null;
      if (!this.stopped) {
        this.onStatus('reconnecting');
        this.scheduleReconnect();
      } else {
        this.onStatus('disconnected');
      }
    };

    this.ws.onerror = () => {
      // In React Native the error event carries no useful detail;
      // the close event that immediately follows has the real code/reason.
      console.warn('[WS] ❌ Error (close event follows)');
    };
  }

  private scheduleReconnect(): void {
    if (this.stopped) return;
    const delay = this.reconnectDelay;
    console.log(`[WS] Retry in ${delay}ms`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer  = null;
      this.reconnectDelay  = Math.min(delay * 2 + Math.random() * 400, MAX_RECONNECT_MS);
      this.connect();
    }, delay);
  }
}

/** Fetches trading pair metadata from the REST endpoint */
export async function fetchPairsMeta(): Promise<PairMeta[]> {
  const url = `${REST_URL}/pairs/meta`;
  console.log(`[REST] GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json() as { pairs: PairMeta[] };
  return body.pairs;
}
