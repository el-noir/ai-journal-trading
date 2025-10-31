
import React from 'react';
import { SessionStatus } from '../types';
import { TrendingUp, TrendingDown, Target, ShieldCheck, Flag, Star, AlertTriangle } from 'lucide-react';

interface SessionSummaryProps {
  netProfit: number;
  dailyTarget: number;
  dailyStopLoss: number;
  wins: number;
  status: SessionStatus;
  capital: number;
  longTermGoal: number;
  startingCapital: number;
}

const getStatusInfo = (status: SessionStatus) => {
    switch (status) {
        case 'TARGET_REACHED':
            return { text: 'Target Reached', color: 'text-green-400', bgColor: 'bg-green-500/10', icon: <Star className="w-5 h-5" /> };
        case 'STOP_LOSS_HIT':
            return { text: 'Stop Loss Hit', color: 'text-red-400', bgColor: 'bg-red-500/10', icon: <AlertTriangle className="w-5 h-5" /> };
        case 'PAUSED_WINS':
            return { text: 'Paused (3 Wins)', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', icon: <ShieldCheck className="w-5 h-5" /> };
        case 'PAUSED_LOSSES':
            return { text: 'Paused (3 Losses)', color: 'text-orange-400', bgColor: 'bg-orange-500/10', icon: <ShieldCheck className="w-5 h-5" /> };
        default:
            return { text: 'In Progress', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', icon: <TrendingUp className="w-5 h-5" /> };
    }
};

const ProgressBar: React.FC<{ value: number; bgColor: string }> = ({ value, bgColor }) => (
  <div className="w-full bg-slate-700 rounded-full h-2.5">
    <div
      className={`${bgColor} h-2.5 rounded-full transition-all duration-500`}
      style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
    ></div>
  </div>
);

const SessionSummary: React.FC<SessionSummaryProps> = ({
  netProfit, dailyTarget, dailyStopLoss, wins, status, capital, longTermGoal, startingCapital
}) => {
  const profitProgress = (netProfit / dailyTarget) * 100;
  const lossProgress = (Math.abs(Math.min(0, netProfit)) / dailyStopLoss) * 100;
  const longTermProgress = ((capital - startingCapital) / (longTermGoal - startingCapital)) * 100;
  
  const statusInfo = getStatusInfo(status);

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* Net Profit */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-lg">
          <span className="text-sm text-slate-400 font-medium">Net Profit</span>
          <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netProfit.toFixed(2)}
          </span>
        </div>
        
        {/* Wins */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-lg">
          <span className="text-sm text-slate-400 font-medium">Wins</span>
          <span className="text-2xl font-bold text-white">{wins}</span>
        </div>
        
        {/* Capital */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-lg">
          <span className="text-sm text-slate-400 font-medium">Capital</span>
          <span className="text-2xl font-bold text-white">{capital.toFixed(2)}</span>
        </div>

        {/* Session Status */}
        <div className={`flex flex-col items-center justify-center p-4 rounded-lg ${statusInfo.bgColor}`}>
          <span className="text-sm font-medium ${statusInfo.color} opacity-80">Status</span>
          <div className={`flex items-center space-x-2 text-lg font-bold ${statusInfo.color}`}>
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
          </div>
        </div>

        {/* Long-term goal - this can be a separate larger item */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col justify-center p-4 bg-slate-900/50 rounded-lg">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-400 flex items-center">
                    <Flag className="w-4 h-4 mr-2" /> Long-Term Goal
                </span>
                <span className="text-sm font-semibold text-cyan-400">{longTermProgress.toFixed(1)}%</span>
            </div>
             <ProgressBar value={longTermProgress} bgColor="bg-cyan-500" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Daily Target Progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-400 flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-400" /> Daily Target ({dailyTarget.toFixed(2)} PKR)
            </span>
            <span className="text-sm font-semibold text-green-400">{profitProgress > 0 ? profitProgress.toFixed(1) : '0.0'}%</span>
          </div>
          <ProgressBar value={profitProgress} bgColor="bg-green-500" />
        </div>

        {/* Daily Stop-Loss */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-400 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-red-400" /> Stop-Loss ({dailyStopLoss.toFixed(2)} PKR)
            </span>
            <span className="text-sm font-semibold text-red-400">{lossProgress.toFixed(1)}%</span>
          </div>
          <ProgressBar value={lossProgress} bgColor="bg-red-500" />
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
