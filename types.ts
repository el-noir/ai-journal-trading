export type TradeResult = 'W' | 'L' | 'PENDING';
export type SessionStatus = 'IN_PROGRESS' | 'TARGET_REACHED' | 'STOP_LOSS_HIT' | 'PAUSED_WINS' | 'PAUSED_LOSSES';

export interface Trade {
  id: number;
  tradeNumber: number;
  stake: number;
  payoutPercent: number;
  result: TradeResult;
  profitLoss: number;
  cumulativeProfit: number;
  pattern: string;
}

export interface Session {
  id: string;
  date: string;
  startingCapital: number;
  currentCapital: number;
  trades: Trade[];
  netProfit: number;
  status: SessionStatus;
  aiSummary?: string;
}

export interface PatternStat {
  name: string;
  total: number;
  wins: number;
  accuracy: number;
}

export interface AppState {
    settings: Settings;
    currentSession: Session;
    historicalSessions: Session[];
    stats: SessionStats;
}

export interface SessionStats {
    wins: number;
    losses: number;
    consecutiveWins: number;
    consecutiveLosses: number;
    nextStake: number;
    winsNeeded: number;
    patternStats: PatternStat[];
}

export interface Settings {
    startingCapital: number;
    dailyTargetPercent: number;
    dailyStopLossPercent: number;
    maxTrades: number;
    minTrade: number;
    payoutPercent: number;
    longTermGoal: number;
    optionalStopOnWins: boolean;
    winsToStop: number;
    optionalStopOnLosses: boolean;
    lossesToStop: number;
}

export interface AIMarketAnalysis {
    patterns: { name: string; description: string }[];
    trend: { '1m': string; '5m': string; '15m': string };
    prediction: {
        direction: 'Uptrend' | 'Downtrend' | 'Sideways';
        confidence: number;
        entry: string;
        stopLoss: string;
        takeProfit: string;
    };
}