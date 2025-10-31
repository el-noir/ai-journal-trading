
import React, { useState, useRef, useEffect } from 'react';
import { Trade, SessionStatus, TradeResult } from '../types';
import { List, PlusCircle, Check, X } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
  onAddTrade: (stake: number, pattern: string) => void;
  onUpdateResult: (tradeId: number, result: 'W' | 'L') => void;
  nextStake: number;
  status: SessionStatus;
  winsNeeded: number;
  payoutPercent: number;
}

const getResultColor = (result: TradeResult) => {
    switch (result) {
        case 'W': return 'text-green-400';
        case 'L': return 'text-red-400';
        default: return 'text-yellow-400';
    }
};

const TradeRow: React.FC<{trade: Trade, onUpdateResult: (tradeId: number, result: 'W' | 'L') => void; status: SessionStatus}> = ({ trade, onUpdateResult, status }) => {
    return (
        <tr className="border-b border-slate-700 hover:bg-slate-800/50">
            <td className="p-3 text-center font-mono">{trade.tradeNumber}</td>
            <td className="p-3 text-right">{trade.stake.toFixed(2)}</td>
            <td className={`p-3 text-center font-semibold ${getResultColor(trade.result)}`}>
                {trade.result === 'PENDING' && !status.includes('REACHED') && !status.includes('HIT') ? (
                    <div className="flex justify-center space-x-2">
                        <button onClick={() => onUpdateResult(trade.id, 'W')} className="p-1 rounded-full bg-green-500/20 hover:bg-green-500/40"><Check className="w-4 h-4 text-green-400" /></button>
                        <button onClick={() => onUpdateResult(trade.id, 'L')} className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/40"><X className="w-4 h-4 text-red-400" /></button>
                    </div>
                ) : trade.result}
            </td>
            <td className={`p-3 text-right font-semibold ${getResultColor(trade.result)}`}>{trade.profitLoss.toFixed(2)}</td>
            <td className={`p-3 text-right ${trade.cumulativeProfit >= 0 ? 'text-white' : 'text-red-400'}`}>{trade.cumulativeProfit.toFixed(2)}</td>
            <td className="p-3">{trade.pattern}</td>
        </tr>
    );
};

const AddTradeForm: React.FC<{onAddTrade: (stake: number, pattern: string) => void; nextStake: number;}> = ({ onAddTrade, nextStake }) => {
    const [stake, setStake] = useState(nextStake);
    const [pattern, setPattern] = useState('');

    useEffect(() => {
        setStake(nextStake);
    }, [nextStake]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (stake > 0 && pattern.trim() !== '') {
            onAddTrade(stake, pattern.trim());
            setPattern('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-6 gap-3 p-3 bg-slate-900/50">
            <td className="p-1 text-center font-mono col-span-1 flex items-center justify-center text-slate-400">
                <PlusCircle className="w-5 h-5"/>
            </td>
            <td className="col-span-1">
                <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(Number(e.target.value))}
                    className="w-full bg-slate-700 p-2 rounded-md text-right focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    required
                />
            </td>
            <td className="col-span-3">
                 <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="Enter pattern/reason..."
                    className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    required
                />
            </td>
            <td className="col-span-1">
                 <button type="submit" className="w-full h-full bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition font-semibold">
                    Add
                </button>
            </td>
        </form>
    );
};

const TradeTable: React.FC<TradeTableProps> = ({ trades, onAddTrade, onUpdateResult, nextStake, status, winsNeeded, payoutPercent }) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
    }
  }, [trades]);

  const isSessionActive = status === 'IN_PROGRESS';

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center">
            <List className="w-6 h-6 text-cyan-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">Trade Log</h2>
        </div>
        <div className="flex space-x-4">
            <div className="text-right">
                <span className="text-xs text-slate-400">Wins Needed</span>
                <p className="font-bold text-cyan-400 text-lg">{winsNeeded}</p>
            </div>
             <div className="text-right">
                <span className="text-xs text-slate-400">Next Stake</span>
                <p className="font-bold text-white text-lg">{isSessionActive ? nextStake.toFixed(2) : '—'}</p>
            </div>
        </div>
      </div>
      <div ref={tableContainerRef} className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800 shadow-md">
            <tr className="text-left text-slate-400">
              <th className="p-3 text-center">#</th>
              <th className="p-3 text-right">Stake (PKR)</th>
              <th className="p-3 text-center">Result</th>
              <th className="p-3 text-right">P/L</th>
              <th className="p-3 text-right">Cumulative</th>
              <th className="p-3">Pattern / Reason</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <TradeRow key={trade.id} trade={trade} onUpdateResult={onUpdateResult} status={status} />
            ))}
          </tbody>
        </table>
      </div>
      {isSessionActive ? (
        <AddTradeForm onAddTrade={onAddTrade} nextStake={nextStake} />
      ) : (
        <div className="p-4 text-center bg-slate-900/50 text-slate-400 font-semibold">
            Session has ended. No further trades allowed.
        </div>
      )}
    </div>
  );
};

export default TradeTable;
