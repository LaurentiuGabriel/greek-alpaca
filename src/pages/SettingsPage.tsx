import { useState } from 'react';
import { Key, RefreshCw, Database, Gauge } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import GlassCard from '../components/ui/GlassCard';

export default function SettingsPage() {
  const { config, setConfig, useMockData, toggleMockData, refresh, isConnected } = usePortfolio();
  const [apiKey, setApiKey] = useState(config.alpacaApiKey);
  const [secretKey, setSecretKey] = useState(config.alpacaSecretKey);
  const [riskFreeRate, setRiskFreeRate] = useState(config.riskFreeRate.toString());
  const [refreshInterval, setRefreshInterval] = useState(config.refreshInterval.toString());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setConfig({
      ...config,
      alpacaApiKey: apiKey,
      alpacaSecretKey: secretKey,
      riskFreeRate: parseFloat(riskFreeRate) || 0.05,
      refreshInterval: parseInt(refreshInterval) || 30,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Configure API credentials and application preferences</p>
      </div>

      {/* Data Source */}
      <GlassCard title="Data Source" subtitle="Toggle between live Alpaca data and demo mode">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/15">
              <Database className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {useMockData ? 'Demo Mode (Mock Data)' : 'Live Alpaca API'}
              </p>
              <p className="text-xs text-slate-500">
                {useMockData
                  ? 'Using simulated portfolio data for demonstration'
                  : isConnected
                  ? 'Connected to Alpaca Paper Trading API'
                  : 'Not connected - configure credentials below'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleMockData}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              useMockData ? 'bg-violet-500' : 'bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                useMockData ? 'left-6.5 translate-x-0' : 'left-0.5'
              }`}
              style={{ left: useMockData ? '26px' : '2px' }}
            />
          </button>
        </div>
      </GlassCard>

      {/* Alpaca Credentials */}
      <GlassCard title="Alpaca API Credentials" subtitle="Paper trading API keys from alpaca.markets">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
              <Key className="w-3.5 h-3.5" />
              API Key ID
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="PKXXXXXXXXXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
              <Key className="w-3.5 h-3.5" />
              Secret Key
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your secret key"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono"
            />
          </div>
          <p className="text-xs text-slate-500">
            Get your API keys from{' '}
            <a
              href="https://app.alpaca.markets/paper/dashboard/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline"
            >
              Alpaca Paper Trading Dashboard
            </a>
            . Keys are stored locally in your browser only.
          </p>
        </div>
      </GlassCard>

      {/* Model Parameters */}
      <GlassCard title="Model Parameters" subtitle="Adjust calculation parameters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
              <Gauge className="w-3.5 h-3.5" />
              Risk-Free Rate
            </label>
            <input
              type="number"
              step="0.01"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">Used in Black-Scholes calculations (e.g. 0.05 = 5%)</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              step="5"
              min="10"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">Auto-refresh interval for live data</p>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        <button
          onClick={refresh}
          className="px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-sm font-medium transition-all"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
}
