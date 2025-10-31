import React, { useState } from 'react';
import { Settings } from '../types';
import { X } from 'lucide-react';

interface SettingsPanelProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave, onClose }) => {
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };
  
  const handleSave = () => {
    onSave(currentSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Capital & Goals */}
          <div className="space-y-4 border-b border-slate-700 pb-6">
            <h3 className="text-lg font-medium text-cyan-400">Capital & Goals</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Starting Capital (PKR)" name="startingCapital" value={currentSettings.startingCapital} onChange={handleChange} />
                <InputField label="Long-Term Goal (PKR)" name="longTermGoal" value={currentSettings.longTermGoal} onChange={handleChange} />
            </div>
          </div>

          {/* Daily Limits */}
          <div className="space-y-4 border-b border-slate-700 pb-6">
            <h3 className="text-lg font-medium text-cyan-400">Daily Limits</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Daily Target (%)" name="dailyTargetPercent" value={currentSettings.dailyTargetPercent} onChange={handleChange} />
                <InputField label="Daily Stop-Loss (%)" name="dailyStopLossPercent" value={currentSettings.dailyStopLossPercent} onChange={handleChange} />
            </div>
          </div>
          
          {/* Trade Rules */}
          <div className="space-y-4 border-b border-slate-700 pb-6">
            <h3 className="text-lg font-medium text-cyan-400">Trade Rules</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Max Trades per Day" name="maxTrades" value={currentSettings.maxTrades} onChange={handleChange} />
                <InputField label="Minimum Trade (PKR)" name="minTrade" value={currentSettings.minTrade} onChange={handleChange} />
                <InputField label="Payout (%)" name="payoutPercent" value={currentSettings.payoutPercent} onChange={handleChange} />
            </div>
          </div>

          {/* Session Pausing */}
           <div className="space-y-4">
            <h3 className="text-lg font-medium text-cyan-400">Optional Session Pausing</h3>
            <div className="space-y-3">
                 <div className="flex items-center space-x-3">
                    <CheckboxField label={`Pause after`} name="optionalStopOnWins" checked={currentSettings.optionalStopOnWins} onChange={handleChange} />
                    <input 
                        type="number" 
                        name="winsToStop" 
                        value={currentSettings.winsToStop} 
                        onChange={handleChange}
                        disabled={!currentSettings.optionalStopOnWins}
                        className="w-16 bg-slate-700 p-1 rounded-md text-center focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50" 
                    />
                    <span className={`text-slate-300 ${!currentSettings.optionalStopOnWins && 'opacity-50'}`}>wins</span>
                 </div>
                 <div className="flex items-center space-x-3">
                    <CheckboxField label={`Pause after`} name="optionalStopOnLosses" checked={currentSettings.optionalStopOnLosses} onChange={handleChange} />
                     <input 
                        type="number" 
                        name="lossesToStop" 
                        value={currentSettings.lossesToStop} 
                        onChange={handleChange}
                        disabled={!currentSettings.optionalStopOnLosses}
                        className="w-16 bg-slate-700 p-1 rounded-md text-center focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50" 
                    />
                    <span className={`text-slate-300 ${!currentSettings.optionalStopOnLosses && 'opacity-50'}`}>consecutive losses</span>
                 </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/50 sticky bottom-0">
          <button onClick={handleSave} className="w-full py-2 px-4 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{label: string; name: keyof Settings; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({label, name, value, onChange}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input type="number" id={name} name={name} value={value} onChange={onChange} className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
    </div>
);

const CheckboxField: React.FC<{label: string; name: keyof Settings; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({label, name, checked, onChange}) => (
    <label className="flex items-center space-x-3 cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-600 focus:ring-cyan-500" />
        <span className="text-slate-300">{label}</span>
    </label>
);

export default SettingsPanel;