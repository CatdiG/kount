'use client';

import React from 'react';
import { ParsingResult } from '@/types/chat';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Clock, Sparkles } from 'lucide-react';

interface ChatChartsProps {
  parsingResult: ParsingResult;
}

export default function ChatCharts({ parsingResult }: ChatChartsProps) {
  const { hourlyDistribution, topKeywords } = parsingResult;

  const formatXAxisHour = (hourVal: any) => {
    const h = Number(hourVal);
    return `${h}시`;
  };

  const timeTicks = [0, 3, 6, 9, 12, 15, 18, 21];

  return (
    <div className="w-full space-y-4">
      {/* Chart 1: 24시간대별 대화 분포 */}
      <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4 flex flex-col items-center shadow-2xs">
        <div className="flex items-center gap-1.5 w-full justify-center text-center mb-3">
          <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <h3 className="text-sm font-extrabold text-slate-900">24시간대별 채팅 타임라인</h3>
        </div>
        <div className="h-48 sm:h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHourlyLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" ticks={timeTicks} tickFormatter={formatXAxisHour} stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <ReferenceLine x={9} stroke="#f87171" strokeDasharray="3 3" strokeWidth={1.5} />
              <ReferenceLine x={18} stroke="#f87171" strokeDasharray="3 3" strokeWidth={1.5} />
              <Tooltip
                formatter={(val: any) => [`${val ?? 0}개 메시지`, '채팅 수']}
                labelFormatter={(label: any) => `시간대: ${formatXAxisHour(label)}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '0.75rem',
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHourlyLight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: 최다 사용 키워드 Top 20 */}
      <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center gap-1.5 w-full justify-center text-center mb-3">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <h3 className="text-sm font-extrabold text-slate-900">
            최다 사용 키워드 Top 20
          </h3>
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
          {topKeywords.length === 0 ? (
            <p className="text-slate-400 text-xs italic">키워드가 추출되지 않았습니다.</p>
          ) : (
            topKeywords.slice(0, 20).map((kw, i) => {
              const badgeGradients = [
                'bg-indigo-50 text-indigo-700 border-indigo-200',
                'bg-purple-50 text-purple-700 border-purple-200',
                'bg-pink-50 text-pink-700 border-pink-200',
                'bg-amber-50 text-amber-800 border-amber-200',
                'bg-emerald-50 text-emerald-800 border-emerald-200',
              ];
              const grad = badgeGradients[i % badgeGradients.length];

              return (
                <span
                  key={kw.text}
                  className={`px-2.5 py-1 rounded-xl border ${grad} text-xs font-bold transition-transform cursor-default shadow-2xs`}
                >
                  #{kw.text} ({kw.value})
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
