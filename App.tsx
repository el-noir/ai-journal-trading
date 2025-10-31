import React, { useState } from 'react';
import SessionSummary from './components/SessionSummary';
import TradeTable from './components/TradeTable';
import AIRecommendations from './components/AIRecommendations';
import PatternStats from './components/PatternStats';
import HistoricalSessions from './components/HistoricalSessions';
import SettingsPanel from './components/SettingsPanel';
import { useSessionManager } from './hooks/useSessionManager';
import { Settings } from './types';
import { DollarSign, BarChart2, BrainCircuit, History, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const {
    state,
    addTrade,
    updateTradeResult,
    archiveCurrentSession,
    startNewSession,
    updateSettings,
    addSessionSummary
  } = useSessionManager();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { currentSession, historicalSessions, settings, stats } = state;
  const { netProfit, trades, status } = currentSession;

  const dailyTarget = (settings.startingCapital * settings.dailyTargetPercent) / 100;
  const dailyStopLoss = (settings.startingCapital * settings.dailyStopLossPercent) / 100;
  
  const handleSettingsSave = (newSettings: Settings) => {
    updateSettings(newSettings);
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">AI Trading Journal</h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors"
            aria-label="Open Settings"
          >
            <SettingsIcon className="w-6 h-6 text-slate-400" />
          </button>
        </header>

        {isSettingsOpen && (
          <SettingsPanel
            settings={settings}
            onSave={handleSettingsSave}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}

        <main className="space-y-6">
          {/* Session Summary */}
          <SessionSummary
            netProfit={netProfit}
            dailyTarget={dailyTarget}
            dailyStopLoss={dailyStopLoss}
            wins={stats.wins}
            status={status}
            capital={currentSession.currentCapital}
            longTermGoal={settings.longTermGoal}
            startingCapital={settings.startingCapital}
          />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Trade Table */}
              <TradeTable
                trades={trades}
                onAddTrade={addTrade}
                onUpdateResult={updateTradeResult}
                nextStake={stats.nextStake}
                status={status}
                winsNeeded={stats.winsNeeded}
                payoutPercent={settings.payoutPercent}
              />
              {/* Historical Sessions */}
              <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                 <div className="flex items-center mb-4">
                  <History className="w-6 h-6 text-cyan-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">Session History</h2>
                </div>
                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={archiveCurrentSession}
                        disabled={status === 'IN_PROGRESS' && trades.length === 0}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition disabled:bg-slate-600 disabled:cursor-not-allowed text-sm font-semibold"
                    >
                        Archive Current Session
                    </button>
                    <button
                        onClick={startNewSession}
                        className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition text-sm font-semibold"
                    >
                        Start New Session
                    </button>
                </div>
                <HistoricalSessions sessions={historicalSessions} onAddSummary={addSessionSummary} />
              </div>
            </div>

            <div className="space-y-6">
              {/* AI Recommendations */}
              <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <BrainCircuit className="w-6 h-6 text-cyan-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">AI Recommendations</h2>
                </div>
                <AIRecommendations patternStats={stats.patternStats} />
              </div>

              {/* Pattern Stats */}
              <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                 <div className="flex items-center mb-4">
                  <BarChart2 className="w-6 h-6 text-cyan-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">Pattern Performance</h2>
                </div>
                <PatternStats stats={stats.patternStats} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;