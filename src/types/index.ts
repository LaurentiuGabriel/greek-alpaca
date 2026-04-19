// Alpaca API Types
export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  daytrade_count: number;
  daytrading_buying_power: string;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
  asset_marginable: boolean;
}

export interface AlpacaBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  n: number;
  vw: number;
}

export interface AlpacaSnapshot {
  latestTrade: {
    t: string;
    p: number;
    s: number;
  };
  latestQuote: {
    ap: number;
    as: number;
    bp: number;
    bs: number;
  };
  minuteBar: AlpacaBar;
  dailyBar: AlpacaBar;
  prevDailyBar: AlpacaBar;
}

// Greeks Types
export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionParams {
  spotPrice: number;
  strikePrice: number;
  timeToExpiry: number; // in years
  riskFreeRate: number;
  volatility: number;
  optionType: 'call' | 'put';
}

export interface PositionGreeks {
  symbol: string;
  quantity: number;
  marketValue: number;
  greeks: Greeks;
  impliedVolatility: number;
  optionType: 'call' | 'put' | 'stock';
  beta: number;
}

// Portfolio Exposure Types
export interface SectorExposure {
  sector: string;
  value: number;
  percentage: number;
  positions: string[];
}

export interface PortfolioExposure {
  totalValue: number;
  longExposure: number;
  shortExposure: number;
  netExposure: number;
  grossExposure: number;
  leverageRatio: number;
  sectorExposures: SectorExposure[];
  betaWeightedDelta: number;
  portfolioGreeks: Greeks;
}

// Hedging Types
export type HedgeUrgency = 'low' | 'medium' | 'high' | 'critical';
export type HedgeStrategy = 'protective_put' | 'covered_call' | 'collar' | 'spread' | 'index_hedge' | 'pair_trade' | 'reduce_position';

export interface HedgeRecommendation {
  id: string;
  strategy: HedgeStrategy;
  title: string;
  description: string;
  urgency: HedgeUrgency;
  estimatedCost: number;
  riskReduction: number; // percentage
  targetGreek: keyof Greeks | 'exposure';
  actions: HedgeAction[];
}

export interface HedgeAction {
  action: 'buy' | 'sell';
  instrument: string;
  quantity: number;
  estimatedPrice: number;
  rationale: string;
}

// App State
export interface AppConfig {
  alpacaApiKey: string;
  alpacaSecretKey: string;
  usePaperTrading: boolean;
  riskFreeRate: number;
  refreshInterval: number; // seconds
}
