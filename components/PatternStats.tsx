
import React from 'react';
import { PatternStat } from '../types';

const PatternStatBar: React.FC<{ stat: PatternStat }> = ({ stat }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-300 truncate pr-2">{stat.name}</span>
        <span className="font-mono text-xs px-2 py-0.5 bg-slate-700 rounded-full">{stat.wins}/{stat.total}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className="bg-cyan-500 h-2.5 rounded-full"
          style={{ width: `${stat.accuracy}%` }}
          title={`${stat.accuracy.toFixed(1)}% Accuracy`}
        ></div>
      </div>
    </div>
  );
};

const PatternStats: React.FC<{ stats: PatternStat[] }> = ({ stats }) => {
  if (stats.length === 0) {
    return <p className="text-center text-slate-500 text-sm">No pattern data for this session yet.</p>;
  }

  const sortedStats = [...stats].sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4">
      {sortedStats.map((stat) => (
        <PatternStatBar key={stat.name} stat={stat} />
      ))}
    </div>
  );
};

export default PatternStats;
