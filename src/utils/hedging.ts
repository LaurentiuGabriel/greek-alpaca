import type {
  PortfolioExposure,
  PositionGreeks,
  HedgeRecommendation,
  HedgeUrgency,
} from '../types';

let recommendationCounter = 0;

function nextId(): string {
  return `hedge-${++recommendationCounter}`;
}

function assessUrgency(value: number, thresholds: [number, number, number]): HedgeUrgency {
  const abs = Math.abs(value);
  if (abs >= thresholds[2]) return 'critical';
  if (abs >= thresholds[1]) return 'high';
  if (abs >= thresholds[0]) return 'medium';
  return 'low';
}

export function generateHedgeRecommendations(
  exposure: PortfolioExposure,
  positionGreeks: PositionGreeks[]
): HedgeRecommendation[] {
  const recommendations: HedgeRecommendation[] = [];
  recommendationCounter = 0;

  const { portfolioGreeks, netExposure, totalValue, sectorExposures, betaWeightedDelta } = exposure;

  // 1. Delta exposure check
  const deltaRatio = totalValue > 0 ? Math.abs(portfolioGreeks.delta * 100) / totalValue : 0;
  if (deltaRatio > 0.3 || Math.abs(portfolioGreeks.delta) > 50) {
    const urgency = assessUrgency(portfolioGreeks.delta, [30, 80, 150]);
    const hedgeQty = Math.round(Math.abs(portfolioGreeks.delta) / 1); // SPY delta ~1
    const action = portfolioGreeks.delta > 0 ? 'sell' : 'buy';

    recommendations.push({
      id: nextId(),
      strategy: 'index_hedge',
      title: 'Neutralize Delta Exposure',
      description: `Portfolio delta is ${portfolioGreeks.delta.toFixed(1)}, indicating significant directional exposure. Consider hedging with SPY to reduce delta risk.`,
      urgency,
      estimatedCost: hedgeQty * 450 * 0.001, // approximate commission
      riskReduction: Math.min(90, Math.abs(portfolioGreeks.delta) * 0.5),
      targetGreek: 'delta',
      actions: [
        {
          action,
          instrument: 'SPY',
          quantity: hedgeQty,
          estimatedPrice: 450,
          rationale: `${action === 'sell' ? 'Short' : 'Buy'} SPY shares to offset portfolio delta of ${portfolioGreeks.delta.toFixed(1)}`,
        },
      ],
    });
  }

  // 2. Gamma risk check
  if (Math.abs(portfolioGreeks.gamma) > 5) {
    const urgency = assessUrgency(portfolioGreeks.gamma, [5, 15, 30]);
    recommendations.push({
      id: nextId(),
      strategy: 'spread',
      title: 'Manage Gamma Risk',
      description: `Portfolio gamma is ${portfolioGreeks.gamma.toFixed(2)}. ${
        portfolioGreeks.gamma > 0
          ? 'Positive gamma means accelerating gains/losses. Consider selling options spreads to reduce gamma.'
          : 'Negative gamma creates acceleration risk. Consider buying options to add positive gamma.'
      }`,
      urgency,
      estimatedCost: Math.abs(portfolioGreeks.gamma) * 50,
      riskReduction: 60,
      targetGreek: 'gamma',
      actions: [
        {
          action: portfolioGreeks.gamma > 0 ? 'sell' : 'buy',
          instrument: 'SPY ATM Straddle (30 DTE)',
          quantity: Math.ceil(Math.abs(portfolioGreeks.gamma) / 2),
          estimatedPrice: 12.0,
          rationale: `${portfolioGreeks.gamma > 0 ? 'Sell' : 'Buy'} straddles to ${portfolioGreeks.gamma > 0 ? 'reduce' : 'increase'} portfolio gamma`,
        },
      ],
    });
  }

  // 3. Theta decay check
  if (Math.abs(portfolioGreeks.theta) > 50) {
    const urgency = assessUrgency(portfolioGreeks.theta, [50, 150, 300]);
    recommendations.push({
      id: nextId(),
      strategy: portfolioGreeks.theta < 0 ? 'covered_call' : 'protective_put',
      title: portfolioGreeks.theta < 0 ? 'Reduce Time Decay Cost' : 'Optimize Theta Income',
      description: `Portfolio theta is $${portfolioGreeks.theta.toFixed(0)}/day. ${
        portfolioGreeks.theta < 0
          ? 'You are losing significant value to time decay daily. Consider selling covered calls or closing long options positions.'
          : 'You are collecting premium, but ensure you have adequate protection against adverse moves.'
      }`,
      urgency,
      estimatedCost: 0,
      riskReduction: 40,
      targetGreek: 'theta',
      actions: portfolioGreeks.theta < 0
        ? [
            {
              action: 'sell',
              instrument: 'Covered Calls on largest positions',
              quantity: 1,
              estimatedPrice: 3.0,
              rationale: 'Sell covered calls to generate income offsetting theta decay',
            },
          ]
        : [
            {
              action: 'buy',
              instrument: 'Protective Puts on portfolio',
              quantity: 1,
              estimatedPrice: 4.0,
              rationale: 'Buy puts to protect against downside while maintaining theta income',
            },
          ],
    });
  }

  // 4. Vega exposure check
  if (Math.abs(portfolioGreeks.vega) > 100) {
    const urgency = assessUrgency(portfolioGreeks.vega, [100, 300, 600]);
    recommendations.push({
      id: nextId(),
      strategy: 'spread',
      title: 'Manage Volatility Exposure',
      description: `Portfolio vega is $${portfolioGreeks.vega.toFixed(0)} per 1% vol change. ${
        portfolioGreeks.vega > 0
          ? 'Long volatility exposure - portfolio benefits from vol increases but suffers from vol crush.'
          : 'Short volatility exposure - portfolio is at risk if volatility spikes.'
      }`,
      urgency,
      estimatedCost: Math.abs(portfolioGreeks.vega) * 0.1,
      riskReduction: 55,
      targetGreek: 'vega',
      actions: [
        {
          action: portfolioGreeks.vega > 0 ? 'sell' : 'buy',
          instrument: 'VXX / UVXY shares',
          quantity: Math.ceil(Math.abs(portfolioGreeks.vega) / 10),
          estimatedPrice: 20,
          rationale: `${portfolioGreeks.vega > 0 ? 'Sell' : 'Buy'} volatility products to offset vega`,
        },
      ],
    });
  }

  // 5. Concentration risk check
  const largestSector = sectorExposures[0];
  if (largestSector && largestSector.percentage > 40) {
    recommendations.push({
      id: nextId(),
      strategy: 'pair_trade',
      title: `Reduce ${largestSector.sector} Concentration`,
      description: `${largestSector.sector} represents ${largestSector.percentage.toFixed(1)}% of your portfolio. Consider diversifying or hedging with sector-specific ETFs.`,
      urgency: largestSector.percentage > 60 ? 'high' : 'medium',
      estimatedCost: 0,
      riskReduction: 30,
      targetGreek: 'exposure',
      actions: [
        {
          action: 'sell',
          instrument: `${largestSector.sector} sector ETF puts`,
          quantity: Math.ceil(largestSector.value / 10000),
          estimatedPrice: 5.0,
          rationale: `Hedge concentrated ${largestSector.sector} exposure`,
        },
      ],
    });
  }

  // 6. Net exposure / market risk check
  const netRatio = totalValue > 0 ? netExposure / totalValue : 0;
  if (Math.abs(netRatio) > 0.8) {
    recommendations.push({
      id: nextId(),
      strategy: 'index_hedge',
      title: 'Reduce Directional Market Exposure',
      description: `Net exposure is ${(netRatio * 100).toFixed(0)}% of portfolio value. Portfolio is heavily ${netRatio > 0 ? 'long' : 'short'} the market. Consider adding hedges to reduce directional risk.`,
      urgency: Math.abs(netRatio) > 0.95 ? 'high' : 'medium',
      estimatedCost: totalValue * 0.003,
      riskReduction: 45,
      targetGreek: 'exposure',
      actions: [
        {
          action: netRatio > 0 ? 'buy' : 'sell',
          instrument: 'SPY Put Spread (30 DTE)',
          quantity: Math.ceil(Math.abs(netExposure) / 45000),
          estimatedPrice: 3.5,
          rationale: `Buy put spreads to protect against market ${netRatio > 0 ? 'decline' : 'rally'}`,
        },
      ],
    });
  }

  // 7. Beta-weighted risk
  if (Math.abs(betaWeightedDelta) > 100) {
    recommendations.push({
      id: nextId(),
      strategy: 'index_hedge',
      title: 'Hedge Beta-Weighted Risk',
      description: `Beta-weighted delta is ${betaWeightedDelta.toFixed(1)} SPY-equivalent shares. This means your portfolio moves like ${Math.abs(betaWeightedDelta).toFixed(0)} shares of SPY.`,
      urgency: assessUrgency(betaWeightedDelta, [100, 250, 500]),
      estimatedCost: Math.abs(betaWeightedDelta) * 0.5,
      riskReduction: 70,
      targetGreek: 'delta',
      actions: [
        {
          action: betaWeightedDelta > 0 ? 'sell' : 'buy',
          instrument: 'SPY',
          quantity: Math.round(Math.abs(betaWeightedDelta)),
          estimatedPrice: 450,
          rationale: `Offset beta-weighted delta of ${betaWeightedDelta.toFixed(0)} SPY-equivalent shares`,
        },
      ],
    });
  }

  // 8. Individual position risk - large single positions
  for (const pg of positionGreeks) {
    const positionWeight = totalValue > 0 ? Math.abs(pg.marketValue) / totalValue : 0;
    if (positionWeight > 0.25) {
      recommendations.push({
        id: nextId(),
        strategy: 'reduce_position',
        title: `Trim ${pg.symbol} Position`,
        description: `${pg.symbol} represents ${(positionWeight * 100).toFixed(1)}% of your portfolio. Consider trimming or hedging this concentrated position.`,
        urgency: positionWeight > 0.4 ? 'high' : 'medium',
        estimatedCost: 0,
        riskReduction: 25,
        targetGreek: 'exposure',
        actions: [
          {
            action: 'sell',
            instrument: pg.symbol,
            quantity: Math.round(Math.abs(pg.quantity) * 0.3),
            estimatedPrice: pg.marketValue / pg.quantity,
            rationale: `Reduce ${pg.symbol} from ${(positionWeight * 100).toFixed(1)}% to ~${((positionWeight * 0.7) * 100).toFixed(1)}% of portfolio`,
          },
        ],
      });
    }
  }

  // Sort by urgency
  const urgencyOrder: Record<HedgeUrgency, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return recommendations;
}
