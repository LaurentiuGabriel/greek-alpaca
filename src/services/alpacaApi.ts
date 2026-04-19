import type { AlpacaAccount, AlpacaPosition, AlpacaSnapshot } from '../types';

const ALPACA_BASE = '/api/alpaca';
const ALPACA_DATA = '/api/alpaca-data';

let apiKey = '';
let secretKey = '';

export function configureAlpaca(key: string, secret: string) {
  apiKey = key;
  secretKey = secret;
}

function getHeaders(): HeadersInit {
  return {
    'APCA-API-KEY-ID': apiKey,
    'APCA-API-SECRET-KEY': secretKey,
    'Content-Type': 'application/json',
  };
}

async function fetchAlpaca<T>(endpoint: string, base = ALPACA_BASE): Promise<T> {
  const res = await fetch(`${base}${endpoint}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Alpaca API error ${res.status}: ${errorBody}`);
  }
  return res.json();
}

export async function getAccount(): Promise<AlpacaAccount> {
  return fetchAlpaca<AlpacaAccount>('/v2/account');
}

export async function getPositions(): Promise<AlpacaPosition[]> {
  return fetchAlpaca<AlpacaPosition[]>('/v2/positions');
}

export async function getPosition(symbol: string): Promise<AlpacaPosition> {
  return fetchAlpaca<AlpacaPosition>(`/v2/positions/${symbol}`);
}

export async function getSnapshot(symbol: string): Promise<AlpacaSnapshot> {
  return fetchAlpaca<AlpacaSnapshot>(`/v2/stocks/${symbol}/snapshot`, ALPACA_DATA);
}

export async function getSnapshots(symbols: string[]): Promise<Record<string, AlpacaSnapshot>> {
  const symbolsParam = symbols.join(',');
  return fetchAlpaca<Record<string, AlpacaSnapshot>>(
    `/v2/stocks/snapshots?symbols=${symbolsParam}`,
    ALPACA_DATA
  );
}

export async function getHistoricalBars(
  symbol: string,
  timeframe = '1Day',
  start?: string,
  end?: string,
  limit = 252
) {
  const params = new URLSearchParams({ timeframe, limit: limit.toString() });
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  return fetchAlpaca<{ bars: Array<{ t: string; o: number; h: number; l: number; c: number; v: number }> }>(
    `/v2/stocks/${symbol}/bars?${params.toString()}`,
    ALPACA_DATA
  );
}

// Fetch portfolio history
export async function getPortfolioHistory(period = '1M', timeframe = '1D') {
  return fetchAlpaca<{
    timestamp: number[];
    equity: number[];
    profit_loss: number[];
    profit_loss_pct: number[];
    base_value: number;
  }>(`/v2/account/portfolio/history?period=${period}&timeframe=${timeframe}`);
}
