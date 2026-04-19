import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  AlpacaAccount,
  AlpacaPosition,
  PositionGreeks,
  PortfolioExposure,
  HedgeRecommendation,
  AppConfig,
} from '../types';
import { configureAlpaca, getAccount, getPositions } from '../services/alpacaApi';
import { stockGreeks } from '../utils/blackScholes';
import { calculatePortfolioExposure, getBeta } from '../utils/exposure';
import { generateHedgeRecommendations } from '../utils/hedging';
import { generateMockData } from '../utils/mockData';

interface PortfolioContextType {
  account: AlpacaAccount | null;
  positions: AlpacaPosition[];
  positionGreeks: PositionGreeks[];
  exposure: PortfolioExposure | null;
  recommendations: HedgeRecommendation[];
  config: AppConfig;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  useMockData: boolean;
  setConfig: (config: AppConfig) => void;
  refresh: () => Promise<void>;
  toggleMockData: () => void;
}

const defaultConfig: AppConfig = {
  alpacaApiKey: '',
  alpacaSecretKey: '',
  usePaperTrading: true,
  riskFreeRate: 0.05,
  refreshInterval: 30,
};

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [positionGreeks, setPositionGreeks] = useState<PositionGreeks[]>([]);
  const [exposure, setExposure] = useState<PortfolioExposure | null>(null);
  const [recommendations, setRecommendations] = useState<HedgeRecommendation[]>([]);
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true);

  const computeGreeksAndExposure = useCallback(
    (positions: AlpacaPosition[]) => {
      // For stock positions, delta = 1 per share, other greeks = 0
      // In a full implementation, options would use Black-Scholes
      const greeks: PositionGreeks[] = positions.map((pos) => {
        const qty = parseFloat(pos.qty);
        const mv = parseFloat(pos.market_value);
        const side = parseFloat(pos.qty) >= 0 ? 1 : -1;

        return {
          symbol: pos.symbol,
          quantity: qty,
          marketValue: mv,
          greeks: {
            ...stockGreeks(),
            delta: stockGreeks().delta * side,
          },
          impliedVolatility: 0.3, // placeholder
          optionType: 'stock' as const,
          beta: getBeta(pos.symbol),
        };
      });

      setPositionGreeks(greeks);

      const exp = calculatePortfolioExposure(positions, greeks);
      setExposure(exp);

      const recs = generateHedgeRecommendations(exp, greeks);
      setRecommendations(recs);
    },
    []
  );

  const loadMockData = useCallback(() => {
    const mock = generateMockData();
    setAccount(mock.account);
    setPositions(mock.positions);
    setIsConnected(true);
    setError(null);
    computeGreeksAndExposure(mock.positions);
  }, [computeGreeksAndExposure]);

  const refresh = useCallback(async () => {
    if (useMockData) {
      loadMockData();
      return;
    }

    if (!config.alpacaApiKey || !config.alpacaSecretKey) {
      setError('Please configure your Alpaca API credentials');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      configureAlpaca(config.alpacaApiKey, config.alpacaSecretKey);

      const [acc, pos] = await Promise.all([getAccount(), getPositions()]);

      setAccount(acc);
      setPositions(pos);
      setIsConnected(true);

      computeGreeksAndExposure(pos);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to Alpaca';
      setError(message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [config, useMockData, loadMockData, computeGreeksAndExposure]);

  const toggleMockData = useCallback(() => {
    setUseMockData((prev) => !prev);
  }, []);

  // Auto-load mock data on mount
  useEffect(() => {
    if (useMockData) {
      loadMockData();
    }
  }, [useMockData, loadMockData]);

  // Auto-refresh
  useEffect(() => {
    if (config.refreshInterval <= 0 || !isConnected) return;
    const interval = setInterval(refresh, config.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [config.refreshInterval, isConnected, refresh]);

  return (
    <PortfolioContext.Provider
      value={{
        account,
        positions,
        positionGreeks,
        exposure,
        recommendations,
        config,
        isLoading,
        isConnected,
        error,
        useMockData,
        setConfig,
        refresh,
        toggleMockData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextType {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
