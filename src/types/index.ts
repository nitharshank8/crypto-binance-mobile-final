/** [price, quantity] string tuple — Binance convention */
export type PriceLevel = [string, string];

/** Processed market update broadcast by the backend */
export interface MarketUpdate {
  pair:          string;   // e.g. "BTCUSDT"
  timestamp:     number;   // unix ms
  price:         number;   // mid-price (bestBid + bestAsk) / 2
  spread:        number;   // bestAsk - bestBid
  buyPressure:   number;   // 0–100
  sellPressure:  number;   // 0–100
  bids:          PriceLevel[];  // top N levels, sorted desc by price
  asks:          PriceLevel[];  // top N levels, sorted asc by price
}

/** REST metadata returned by GET /pairs/meta */
export interface PairMeta {
  pair:                  string;
  displayName:           string;
  status:                'TRADING' | 'UNAVAILABLE';
  high24h:               number;
  low24h:                number;
  volume24h:             number;
  priceChangePercent24h: number;
}

/** Combined live + meta state kept in React context */
export interface PairState extends Partial<PairMeta> {
  pair:             string;
  displayName:      string;
  lastUpdate?:      MarketUpdate;
  previousPrice?:   number;
  priceDirection?:  'up' | 'down' | 'neutral';
}

/** WebSocket message envelope from the backend */
export interface WsMessage {
  type:    'marketUpdate';
  updates: MarketUpdate[];
}

/** Control message sent to the backend to change emit interval */
export interface SetIntervalMessage {
  type:       'setInterval';
  intervalMs: number;
}

/** Connection lifecycle states */
export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';
