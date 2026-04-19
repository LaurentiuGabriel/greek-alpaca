import type { AlpacaPosition, PortfolioExposure, SectorExposure, PositionGreeks, Greeks } from '../types';

// Sector mapping - simplified sector classification
const SECTOR_MAP: Record<string, string> = {
  AAPL: 'Technology', MSFT: 'Technology', GOOGL: 'Technology', GOOG: 'Technology',
  AMZN: 'Consumer Discretionary', TSLA: 'Consumer Discretionary', META: 'Technology',
  NVDA: 'Technology', AMD: 'Technology', INTC: 'Technology', AVGO: 'Technology',
  CRM: 'Technology', ADBE: 'Technology', ORCL: 'Technology', CSCO: 'Technology',
  NFLX: 'Communication Services', DIS: 'Communication Services',
  JPM: 'Financials', BAC: 'Financials', GS: 'Financials', MS: 'Financials',
  WFC: 'Financials', C: 'Financials', V: 'Financials', MA: 'Financials',
  JNJ: 'Healthcare', UNH: 'Healthcare', PFE: 'Healthcare', ABBV: 'Healthcare',
  MRK: 'Healthcare', LLY: 'Healthcare', TMO: 'Healthcare',
  XOM: 'Energy', CVX: 'Energy', COP: 'Energy', SLB: 'Energy', OXY: 'Energy',
  PG: 'Consumer Staples', KO: 'Consumer Staples', PEP: 'Consumer Staples',
  WMT: 'Consumer Staples', COST: 'Consumer Staples',
  BA: 'Industrials', CAT: 'Industrials', HON: 'Industrials', UPS: 'Industrials',
  MMM: 'Industrials', GE: 'Industrials', RTX: 'Industrials',
  NEE: 'Utilities', DUK: 'Utilities', SO: 'Utilities',
  AMT: 'Real Estate', PLD: 'Real Estate', CCI: 'Real Estate',
  LIN: 'Materials', APD: 'Materials', SHW: 'Materials',
  SPY: 'Index/ETF', QQQ: 'Index/ETF', IWM: 'Index/ETF', DIA: 'Index/ETF',
  VTI: 'Index/ETF', VOO: 'Index/ETF', VXX: 'Volatility', UVXY: 'Volatility',
};

// Beta estimates for common stocks
const BETA_MAP: Record<string, number> = {
  AAPL: 1.2, MSFT: 0.9, GOOGL: 1.1, AMZN: 1.2, TSLA: 1.8,
  META: 1.3, NVDA: 1.7, AMD: 1.8, INTC: 0.7, JPM: 1.1,
  BAC: 1.4, GS: 1.3, JNJ: 0.6, UNH: 0.8, PFE: 0.7,
  XOM: 0.9, CVX: 1.0, PG: 0.4, KO: 0.6, WMT: 0.5,
  BA: 1.5, DIS: 1.2, NFLX: 1.4, V: 0.9, MA: 1.0,
  SPY: 1.0, QQQ: 1.1, IWM: 1.2, VXX: -3.5, UVXY: -5.0,
};

export function getSector(symbol: string): string {
  return SECTOR_MAP[symbol.toUpperCase()] || 'Other';
}

export function getBeta(symbol: string): number {
  return BETA_MAP[symbol.toUpperCase()] ?? 1.0;
}

export function calculatePortfolioExposure(
  positions: AlpacaPosition[],
  positionGreeks: PositionGreeks[]
): PortfolioExposure {
  let longExposure = 0;
  let shortExposure = 0;
  let totalValue = 0;

  // Sector accumulation
  const sectorMap = new Map<string, { value: number; positions: string[] }>();

  for (const pos of positions) {
    const mv = parseFloat(pos.market_value);
    totalValue += Math.abs(mv);

    if (mv >= 0) {
      longExposure += mv;
    } else {
      shortExposure += Math.abs(mv);
    }

    const sector = getSector(pos.symbol);
    const existing = sectorMap.get(sector) || { value: 0, positions: [] };
    existing.value += mv;
    existing.positions.push(pos.symbol);
    sectorMap.set(sector, existing);
  }

  const sectorExposures: SectorExposure[] = Array.from(sectorMap.entries())
    .map(([sector, data]) => ({
      sector,
      value: data.value,
      percentage: totalValue > 0 ? (Math.abs(data.value) / totalValue) * 100 : 0,
      positions: data.positions,
    }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  // Aggregate portfolio Greeks
  const portfolioGreeks: Greeks = {
    delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0,
  };

  let betaWeightedDelta = 0;

  for (const pg of positionGreeks) {
    const weight = pg.quantity;
    portfolioGreeks.delta += pg.greeks.delta * weight;
    portfolioGreeks.gamma += pg.greeks.gamma * weight;
    portfolioGreeks.theta += pg.greeks.theta * weight;
    portfolioGreeks.vega += pg.greeks.vega * weight;
    portfolioGreeks.rho += pg.greeks.rho * weight;
    betaWeightedDelta += pg.greeks.delta * weight * pg.beta;
  }

  const netExposure = longExposure - shortExposure;
  const grossExposure = longExposure + shortExposure;

  return {
    totalValue,
    longExposure,
    shortExposure,
    netExposure,
    grossExposure,
    leverageRatio: totalValue > 0 ? grossExposure / totalValue : 0,
    sectorExposures,
    betaWeightedDelta,
    portfolioGreeks,
  };
}
