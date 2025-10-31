
import React, { useState, useCallback } from 'react';
import { analyzeMarketImage, getPatternRecommendation } from '../services/geminiService';
import { AIMarketAnalysis, PatternStat } from '../types';
import { Upload, Lightbulb, BarChartHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read blob as base64 string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const AIRecommendations: React.FC<{patternStats: PatternStat[]}> = ({patternStats}) => {
  const [analysis, setAnalysis] = useState<AIMarketAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [patternSuggestion, setPatternSuggestion] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setAnalysis(null);
      setFileName(file.name);
      try {
        const base64Image = await blobToBase64(file);
        const result = await analyzeMarketImage(base64Image);
        setAnalysis(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGetSuggestion = useCallback(async () => {
    setIsSuggesting(true);
    setPatternSuggestion('');
    try {
        const suggestion = await getPatternRecommendation(patternStats);
        setPatternSuggestion(suggestion);
    } catch (e) {
        setPatternSuggestion('Error getting suggestion.');
    } finally {
        setIsSuggesting(false);
    }
  }, [patternStats]);

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="market-image-upload"
          className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 hover:border-cyan-500 transition-colors"
        >
          <Upload className="w-8 h-8 text-slate-500 mb-2" />
          <span className="text-sm font-semibold text-slate-300">Upload Market Screenshot</span>
          <span className="text-xs text-slate-400">{fileName || 'PNG, JPG, JPEG'}</span>
          <input id="market-image-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/png, image/jpeg" />
        </label>
      </div>

      {isLoading && (
         <div className="flex items-center justify-center p-4 rounded-lg bg-slate-700/50">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
            <span className="ml-3 text-slate-300">Analyzing image...</span>
        </div>
      )}

      {error && <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>}

      {analysis && (
        <div className="space-y-4 p-4 rounded-lg bg-slate-900/50">
          <h3 className="text-lg font-semibold text-cyan-400">Analysis Result</h3>
          <div className="p-3 bg-slate-800 rounded-md">
            <h4 className="font-semibold mb-2 text-slate-300">Prediction</h4>
            <div className="flex justify-between items-center text-lg">
                <span className={`font-bold ${analysis.prediction.direction === 'Uptrend' ? 'text-green-400' : 'text-red-400'}`}>
                    {analysis.prediction.direction}
                </span>
                <div className="text-right">
                    <span className="text-xs text-slate-400">Confidence</span>
                    <p className="font-bold">{analysis.prediction.confidence}%</p>
                </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-800 p-2 rounded-md">
                <p className="text-slate-400">Entry</p>
                <p className="font-mono">{analysis.prediction.entry}</p>
            </div>
            <div className="bg-slate-800 p-2 rounded-md">
                <p className="text-slate-400">Stop-Loss</p>
                <p className="font-mono">{analysis.prediction.stopLoss}</p>
            </div>
            <div className="bg-slate-800 p-2 rounded-md">
                <p className="text-slate-400">Take-Profit</p>
                <p className="font-mono">{analysis.prediction.takeProfit}</p>
            </div>
          </div>

          <div>
             <h4 className="font-semibold mb-2 text-slate-300 flex items-center"><Clock className="w-4 h-4 mr-2" /> Multi-Timeframe Trend</h4>
             <div className="flex justify-around bg-slate-800 p-2 rounded-md text-center text-sm">
                <div><span className="text-xs text-slate-400">1M:</span> {analysis.trend['1m']}</div>
                <div><span className="text-xs text-slate-400">5M:</span> {analysis.trend['5m']}</div>
                <div><span className="text-xs text-slate-400">15M:</span> {analysis.trend['15m']}</div>
             </div>
          </div>
        </div>
      )}

      <div>
        <button 
            onClick={handleGetSuggestion} 
            disabled={isSuggesting}
            className="w-full flex items-center justify-center px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition font-semibold disabled:opacity-50"
        >
            <Lightbulb className="w-5 h-5 mr-2" />
            Suggest Next Pattern
        </button>
         {isSuggesting && <p className="text-center text-sm mt-2 text-slate-400">Getting suggestion...</p>}
        {patternSuggestion && (
            <div className="mt-3 p-3 bg-cyan-500/10 text-cyan-400 rounded-md text-center font-semibold">
                {patternSuggestion}
            </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
