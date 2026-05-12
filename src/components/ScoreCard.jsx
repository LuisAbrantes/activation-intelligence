import React from 'react';
import { Activity } from 'lucide-react';
import { getScoreTier } from '../constants/scoring.js';

// Mapeamento de colorKey → classes Tailwind
const COLOR_MAP = {
  red:   { text: 'text-red-500',   bg: 'bg-red-50',   stroke: 'stroke-red-500' },
  amber: { text: 'text-amber-500', bg: 'bg-amber-50', stroke: 'stroke-amber-500' },
  blue:  { text: 'text-blue-500',  bg: 'bg-blue-50',  stroke: 'stroke-blue-500' },
  green: { text: 'text-green-500', bg: 'bg-green-50', stroke: 'stroke-green-500' },
};

export default function ScoreCard({ score }) {
  const tier = getScoreTier(score);
  const colors = COLOR_MAP[tier.colorKey] ?? COLOR_MAP.red;

  // Matemática do círculo SVG
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass p-8 rounded-2xl mb-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50">
      <div className="absolute top-5 left-5 flex items-center gap-2 text-gray-500">
        <div className="bg-gray-100 p-2 rounded-xl">
          <Activity className="w-5 h-5 text-gray-600" />
        </div>
        <span className="font-semibold text-sm tracking-wide uppercase text-gray-600">Activation Score</span>
      </div>

      <div className="relative mt-12 mb-6 group">
        {/* Fundo do círculo */}
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-100"
          />
          {/* Progresso do círculo */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${colors.stroke}`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Texto do Score no Centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <span className={`text-6xl font-black tracking-tighter ${colors.text}`}>
            {score}
          </span>
          <span className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">/ 100</span>
        </div>
      </div>

      <div className={`px-6 py-2 rounded-full border ${colors.bg} border-transparent ${colors.text} font-bold text-sm tracking-wide uppercase shadow-sm transition-all duration-300`}>
        {tier.label}
      </div>
    </div>
  );
}
