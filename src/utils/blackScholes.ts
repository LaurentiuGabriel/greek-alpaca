import type { Greeks, OptionParams } from '../types';

// Standard normal CDF using Abramowitz and Stegun approximation
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Standard normal PDF
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Calculate d1 and d2 for Black-Scholes
function calcD1D2(params: OptionParams): { d1: number; d2: number } {
  const { spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatility } = params;

  const d1 =
    (Math.log(spotPrice / strikePrice) +
      (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) /
    (volatility * Math.sqrt(timeToExpiry));

  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

  return { d1, d2 };
}

// Black-Scholes option price
export function optionPrice(params: OptionParams): number {
  const { spotPrice, strikePrice, timeToExpiry, riskFreeRate, optionType } = params;
  const { d1, d2 } = calcD1D2(params);

  if (optionType === 'call') {
    return (
      spotPrice * normalCDF(d1) -
      strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2)
    );
  } else {
    return (
      strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2) -
      spotPrice * normalCDF(-d1)
    );
  }
}

// Calculate all Greeks
export function calculateGreeks(params: OptionParams): Greeks {
  const { spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatility, optionType } = params;
  const { d1, d2 } = calcD1D2(params);
  const sqrtT = Math.sqrt(timeToExpiry);

  // Delta
  let delta: number;
  if (optionType === 'call') {
    delta = normalCDF(d1);
  } else {
    delta = normalCDF(d1) - 1;
  }

  // Gamma (same for calls and puts)
  const gamma = normalPDF(d1) / (spotPrice * volatility * sqrtT);

  // Theta
  const commonTheta = -(spotPrice * normalPDF(d1) * volatility) / (2 * sqrtT);
  let theta: number;
  if (optionType === 'call') {
    theta = commonTheta - riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2);
  } else {
    theta = commonTheta + riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2);
  }
  // Convert to daily theta
  theta = theta / 365;

  // Vega (same for calls and puts) - per 1% change in vol
  const vega = (spotPrice * sqrtT * normalPDF(d1)) / 100;

  // Rho - per 1% change in rate
  let rho: number;
  if (optionType === 'call') {
    rho = (strikePrice * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2)) / 100;
  } else {
    rho = -(strikePrice * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2)) / 100;
  }

  return { delta, gamma, theta, vega, rho };
}

// Calculate implied volatility using Newton-Raphson
export function impliedVolatility(
  marketPrice: number,
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  optionType: 'call' | 'put',
  maxIterations = 100,
  tolerance = 1e-6
): number {
  let vol = 0.3; // Initial guess

  for (let i = 0; i < maxIterations; i++) {
    const params: OptionParams = {
      spotPrice,
      strikePrice,
      timeToExpiry,
      riskFreeRate,
      volatility: vol,
      optionType,
    };

    const price = optionPrice(params);
    const diff = price - marketPrice;

    if (Math.abs(diff) < tolerance) {
      return vol;
    }

    // Vega for Newton-Raphson step (not scaled)
    const { d1 } = calcD1D2(params);
    const vega = spotPrice * Math.sqrt(timeToExpiry) * normalPDF(d1);

    if (vega < 1e-10) break;

    vol = vol - diff / vega;

    // Keep vol in reasonable bounds
    if (vol < 0.01) vol = 0.01;
    if (vol > 5.0) vol = 5.0;
  }

  return vol;
}

// Calculate historical volatility from price series
export function historicalVolatility(prices: number[], annualizationFactor = 252): number {
  if (prices.length < 2) return 0;

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1);

  return Math.sqrt(variance * annualizationFactor);
}

// Stock "Greeks" - stocks have delta=1, everything else is 0
export function stockGreeks(): Greeks {
  return {
    delta: 1.0,
    gamma: 0,
    theta: 0,
    vega: 0,
    rho: 0,
  };
}
