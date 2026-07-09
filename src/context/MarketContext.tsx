import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MarketWebSocketService, fetchPairsMeta } from '../services/websocket';
import { loadFavourites, toggleFavourite } from '../services/favourites';
import type { ConnectionStatus, MarketUpdate, PairMeta, PairState } from '../types';

interface MarketContextValue {
  pairs:            PairState[];
  connectionStatus: ConnectionStatus;
  favourites:       Set<string>;
  isRefreshing:     boolean;
  toggleFav:        (pair: string) => void;
  refreshMeta:      () => void;
  /** Stable ref — always points to the live WS service instance */
  wsServiceRef:     React.MutableRefObject<MarketWebSocketService | null>;
}

const MarketContext = createContext<MarketContextValue>({
  pairs:            [],
  connectionStatus: 'disconnected',
  favourites:       new Set(),
  isRefreshing:     false,
  toggleFav:        () => {},
  refreshMeta:      () => {},
  wsServiceRef:     { current: null },
});

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [pairMap,    setPairMap]    = useState<Map<string, PairState>>(new Map());
  const [pairsOrder, setPairsOrder] = useState<string[]>([]);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [favourites,       setFavourites]        = useState<Set<string>>(new Set());
  const [isRefreshing,     setIsRefreshing]       = useState(false);

  // Stable ref exposed in context so consumers always read the live instance
  const wsServiceRef = useRef<MarketWebSocketService | null>(null);

  // ── WebSocket handlers ───────────────────────────────────────────────────

  const handleUpdates = useCallback((updates: MarketUpdate[]) => {
    setPairMap(prev => {
      const next = new Map(prev);
      for (const u of updates) {
        const existing = next.get(u.pair);
        if (!existing) continue;
        const prevPrice = existing.lastUpdate?.price;
        const direction =
          prevPrice === undefined ? 'neutral'
          : u.price > prevPrice   ? 'up'
          : u.price < prevPrice   ? 'down'
          :                         'neutral';
        next.set(u.pair, {
          ...existing,
          lastUpdate:     u,
          previousPrice:  prevPrice,
          priceDirection: direction,
        });
      }
      return next;
    });
  }, []);

  const handleStatus = useCallback((s: ConnectionStatus) => setConnectionStatus(s), []);

  // ── REST meta ────────────────────────────────────────────────────────────

  const refreshMeta = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const metas: PairMeta[] = await fetchPairsMeta();
      setPairsOrder(metas.map(m => m.pair));
      setPairMap(prev => {
        const next = new Map(prev);
        for (const meta of metas) {
          const existing = next.get(meta.pair) ?? { pair: meta.pair, displayName: meta.displayName };
          next.set(meta.pair, { ...existing, ...meta });
        }
        return next;
      });
    } catch (err) {
      console.warn('[MarketContext] meta fetch failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // ── Favourites ───────────────────────────────────────────────────────────

  const toggleFav = useCallback((pair: string) => {
    setFavourites(prev => {
      // Optimistic update first
      const optimistic = new Set(prev);
      optimistic.has(pair) ? optimistic.delete(pair) : optimistic.add(pair);
      // Persist async and reconcile
      toggleFavourite(pair, prev).then(setFavourites);
      return optimistic;
    });
  }, []);

  // ── Startup ──────────────────────────────────────────────────────────────

  useEffect(() => {
    loadFavourites().then(setFavourites);
    refreshMeta();

    const ws = new MarketWebSocketService(handleUpdates, handleStatus);
    wsServiceRef.current = ws;
    ws.start();

    return () => {
      ws.stop();
      wsServiceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived pairs (stable display order) ─────────────────────────────────

  const pairs = useMemo<PairState[]>(
    () => pairsOrder.map(key => pairMap.get(key)!).filter(Boolean),
    [pairMap, pairsOrder],
  );

  const value = useMemo<MarketContextValue>(
    () => ({
      pairs,
      connectionStatus,
      favourites,
      isRefreshing,
      toggleFav,
      refreshMeta,
      wsServiceRef,
    }),
    [pairs, connectionStatus, favourites, isRefreshing, toggleFav, refreshMeta],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export const useMarket = () => useContext(MarketContext);

/** Convenience: subscribe to a single pair */
export function usePair(pair: string): PairState | undefined {
  const { pairs } = useMarket();
  return useMemo(() => pairs.find(p => p.pair === pair), [pairs, pair]);
}
