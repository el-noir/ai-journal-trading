import React, { useState, useCallback } from 'react';
import { Session } from '../types';
import { generateSessionSummary } from '../services/geminiService';
import { Archive, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

const SessionRow: React.FC<{ session: Session; onAddSummary: (sessionId: string, summary: string) => void; }> = ({ session, onAddSummary }) => {
  const isProfit = session.netProfit >= 0;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await generateSessionSummary(session);
      onAddSummary(session.id, summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate summary.');
    } finally {
      setIsLoading(false);
    }
  }, [session, onAddSummary]);

  return (
    <li className="p-3 bg-slate-800/50 rounded-md transition-all">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-semibold text-white">
            {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs text-slate-400">{session.trades.length} trades</span>
        </div>
        <div className={`flex items-center text-lg font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          {session.netProfit.toFixed(2)}
          {isProfit ? <ArrowUpRight className="w-5 h-5 ml-1" /> : <ArrowDownRight className="w-5 h-5 ml-1" />}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700">
        {session.aiSummary ? (
          <p className="text-sm text-slate-300 italic">
            <Sparkles className="w-4 h-4 text-cyan-400 inline-block mr-2" />
            {session.aiSummary}
          </p>
        ) : (
          <>
            {isLoading ? (
                <div className="flex items-center text-sm text-slate-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400 mr-2"></div>
                    Generating AI summary...
                </div>
            ) : (
                 <button
                    onClick={handleGenerateSummary}
                    className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
                    disabled={isLoading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Summary
                </button>
            )}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </>
        )}
      </div>
    </li>
  );
};

const HistoricalSessions: React.FC<{ sessions: Session[]; onAddSummary: (sessionId: string, summary: string) => void; }> = ({ sessions, onAddSummary }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Archive className="w-12 h-12 mx-auto text-slate-600" />
        <p className="mt-2 text-slate-500">No archived sessions.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
      {sessions.map((session) => (
        <SessionRow key={session.id} session={session} onAddSummary={onAddSummary} />
      ))}
    </ul>
  );
};

export default HistoricalSessions;