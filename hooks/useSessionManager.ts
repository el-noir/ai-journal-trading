import { useReducer, useCallback, useEffect } from 'react';
import { AppState, Session, Settings, Trade, TradeResult, PatternStat } from '../types';

const LOCAL_STORAGE_KEY = 'aiTradingJournalState';

// --- UTILITY FUNCTIONS ---
const calculateProfitLoss = (stake: number, payoutPercent: number, result: TradeResult): number => {
    if (result === 'W') return stake * (payoutPercent / 100);
    if (result === 'L') return -stake;
    return 0;
};

const calculateNextStake = (
    previousStake: number, 
    result: TradeResult, 
    consecutiveWins: number,
    minTrade: number
): number => {
    let multiplier = 1.0;
    if (result === 'W') {
        multiplier = 1.5 + Math.min(consecutiveWins * 0.05, 0.2); // Cap bonus at 20% (4 wins)
    } else if (result === 'L') {
        multiplier = 0.75;
    }
    const calculatedStake = Math.round(previousStake * multiplier);
    return Math.max(minTrade, calculatedStake);
};

// --- REDUCER ACTIONS ---
type Action =
  | { type: 'ADD_TRADE'; payload: { stake: number; pattern: string } }
  | { type: 'UPDATE_TRADE_RESULT'; payload: { tradeId: number; result: 'W' | 'L' } }
  | { type: 'ARCHIVE_SESSION' }
  | { type: 'START_NEW_SESSION' }
  | { type: 'UPDATE_SETTINGS'; payload: Settings }
  | { type: 'ADD_SESSION_SUMMARY'; payload: { sessionId: string; summary: string } };

const createNewSession = (settings: Settings): Session => ({
    id: `session-${Date.now()}`,
    date: new Date().toISOString(),
    startingCapital: settings.startingCapital,
    currentCapital: settings.startingCapital,
    trades: [],
    netProfit: 0,
    status: 'IN_PROGRESS',
});

const defaultSettings: Settings = {
    startingCapital: 30000,
    dailyTargetPercent: 5,
    dailyStopLossPercent: 3,
    maxTrades: 10,
    minTrade: 280,
    payoutPercent: 85,
    longTermGoal: 60000,
    optionalStopOnWins: true,
    winsToStop: 3,
    optionalStopOnLosses: true,
    lossesToStop: 3,
};

const getInitialState = (): AppState => {
    try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            // Basic validation
            if (parsedState.settings && parsedState.currentSession) {
                return parsedState;
            }
        }
    } catch (error) {
        console.error("Failed to load state from localStorage", error);
    }
    
    // Fallback to default state
    return {
        settings: defaultSettings,
        currentSession: createNewSession(defaultSettings),
        historicalSessions: [],
        stats: {
            wins: 0,
            losses: 0,
            consecutiveWins: 0,
            consecutiveLosses: 0,
            nextStake: defaultSettings.minTrade,
            winsNeeded: 0,
            patternStats: [],
        },
    };
};

const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'ADD_TRADE': {
            const newTrade: Trade = {
                id: Date.now(),
                tradeNumber: state.currentSession.trades.length + 1,
                stake: action.payload.stake,
                payoutPercent: state.settings.payoutPercent,
                result: 'PENDING',
                profitLoss: 0,
                cumulativeProfit: state.currentSession.netProfit,
                pattern: action.payload.pattern,
            };
            return {
                ...state,
                currentSession: {
                    ...state.currentSession,
                    trades: [...state.currentSession.trades, newTrade],
                },
            };
        }

        case 'UPDATE_TRADE_RESULT': {
            let cumulativeProfit = 0;
            let wins = 0;
            let losses = 0;
            let consecutiveWins = 0;
            let consecutiveLosses = 0;
            const patternStatsMap: Record<string, { total: number; wins: number }> = {};

            const updatedTrades = state.currentSession.trades.map(t => {
                let trade = t;
                if (t.id === action.payload.tradeId) {
                    trade = { ...t, result: action.payload.result };
                    trade.profitLoss = calculateProfitLoss(trade.stake, trade.payoutPercent, trade.result);
                }

                cumulativeProfit += trade.profitLoss;
                trade.cumulativeProfit = cumulativeProfit;
                
                if (trade.result === 'W') {
                    wins++;
                    consecutiveWins++;
                    consecutiveLosses = 0;
                } else if (trade.result === 'L') {
                    losses++;
                    consecutiveLosses++;
                    consecutiveWins = 0;
                }

                if (trade.pattern) {
                    if (!patternStatsMap[trade.pattern]) {
                        patternStatsMap[trade.pattern] = { total: 0, wins: 0 };
                    }
                    patternStatsMap[trade.pattern].total++;
                    if (trade.result === 'W') {
                        patternStatsMap[trade.pattern].wins++;
                    }
                }
                
                return trade;
            });
            
            const lastCompletedTrade = [...updatedTrades].reverse().find(t => t.result !== 'PENDING');

            const nextStake = lastCompletedTrade ? calculateNextStake(
                lastCompletedTrade.stake, 
                lastCompletedTrade.result, 
                consecutiveWins,
                state.settings.minTrade
            ) : state.settings.minTrade;

            const dailyTarget = (state.settings.startingCapital * state.settings.dailyTargetPercent) / 100;
            const dailyStopLoss = (state.settings.startingCapital * state.settings.dailyStopLossPercent) / 100;

            let status = state.currentSession.status;
            if (cumulativeProfit >= dailyTarget) {
                status = 'TARGET_REACHED';
            } else if (cumulativeProfit <= -dailyStopLoss) {
                status = 'STOP_LOSS_HIT';
            } else if (state.settings.optionalStopOnWins && wins >= state.settings.winsToStop) {
                status = 'PAUSED_WINS';
            } else if (state.settings.optionalStopOnLosses && consecutiveLosses >= state.settings.lossesToStop) {
                status = 'PAUSED_LOSSES';
            } else if (updatedTrades.length >= state.settings.maxTrades) {
                 status = 'PAUSED_WINS'; // Or some other 'max trades reached' status
            } else {
                status = 'IN_PROGRESS';
            }
            
            const winsNeeded = Math.max(0, Math.ceil((dailyTarget - cumulativeProfit) / (state.settings.minTrade * (state.settings.payoutPercent / 100))));
            
            const patternStats: PatternStat[] = Object.entries(patternStatsMap).map(([name, data]) => ({
                name,
                ...data,
                accuracy: data.total > 0 ? (data.wins / data.total) * 100 : 0,
            }));

            return {
                ...state,
                currentSession: {
                    ...state.currentSession,
                    trades: updatedTrades,
                    netProfit: cumulativeProfit,
                    currentCapital: state.settings.startingCapital + cumulativeProfit,
                    status,
                },
                stats: {
                    wins, losses, consecutiveWins, consecutiveLosses, nextStake, winsNeeded, patternStats,
                },
            };
        }

        case 'ARCHIVE_SESSION': {
             if (state.currentSession.trades.length === 0) return state;
             const newHistoricalSessions = [state.currentSession, ...state.historicalSessions];
             const newSession = createNewSession({...state.settings, startingCapital: state.currentSession.currentCapital});
             return {
                 ...state,
                 currentSession: newSession,
                 historicalSessions: newHistoricalSessions,
                 stats: getInitialState().stats,
             }
        }

        case 'START_NEW_SESSION': {
            const newSession = createNewSession(state.settings);
            return {
                ...state,
                currentSession: newSession,
                stats: getInitialState().stats
            };
        }

        case 'UPDATE_SETTINGS': {
            const newSettings = action.payload;
            const oldSettings = state.settings;
            const newState = {
                ...state,
                settings: newSettings,
            };
            // Reset session if capital changes, otherwise keep it
            if (oldSettings.startingCapital !== newSettings.startingCapital) {
                 newState.currentSession = createNewSession(newSettings);
                 newState.stats = getInitialState().stats;
            }
            return newState;
        }
        
        case 'ADD_SESSION_SUMMARY': {
            return {
                ...state,
                historicalSessions: state.historicalSessions.map(session => 
                    session.id === action.payload.sessionId
                        ? { ...session, aiSummary: action.payload.summary }
                        : session
                )
            };
        }

        default:
            return state;
    }
};

export const useSessionManager = () => {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  
  useEffect(() => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [state]);

  const addTrade = useCallback((stake: number, pattern: string) => {
    dispatch({ type: 'ADD_TRADE', payload: { stake, pattern } });
  }, []);

  const updateTradeResult = useCallback((tradeId: number, result: 'W' | 'L') => {
    dispatch({ type: 'UPDATE_TRADE_RESULT', payload: { tradeId, result } });
  }, []);
  
  const archiveCurrentSession = useCallback(() => {
    dispatch({ type: 'ARCHIVE_SESSION' });
  }, []);
  
  const startNewSession = useCallback(() => {
    dispatch({ type: 'START_NEW_SESSION' });
  }, []);
  
  const updateSettings = useCallback((settings: Settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);
  
  const addSessionSummary = useCallback((sessionId: string, summary: string) => {
    dispatch({ type: 'ADD_SESSION_SUMMARY', payload: { sessionId, summary } });
  }, []);

  return { state, addTrade, updateTradeResult, archiveCurrentSession, startNewSession, updateSettings, addSessionSummary };
};